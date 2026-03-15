import NDK from "@nostr-dev-kit/ndk";

type NostrFilter = {
  kinds?: number[];
  authors?: string[];
  ids?: string[];
  [key: string]: unknown;
};

type CacheEntry<T> = {
  data: T;
  updatedAt: number;
};

type QueryParams = {
  key: string;
  relays: string[];
  filter: NostrFilter;
  ttlMs: number;
  timeoutMs?: number;
};

const STORAGE_PREFIX = "cypher-nostr-cache:v2:";
const LOG_PREFIX = "[nostr-cache]";

let ndkClient: NDK | null = null;
let ndkRelaysKey = "";
let connectInFlight: Promise<void> | null = null;

const memoryCache = new Map<string, CacheEntry<unknown>>();
const requestInFlight = new Map<string, Promise<unknown>>();

const now = () => Date.now();

const withTimeout = async <T>(promise: Promise<T>, timeoutMs = 10_000) => {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Relay request timed out")), timeoutMs);
    }),
  ]);
};

const logInfo = (message: string, details?: unknown) => {
  if (!import.meta.client) return;
  if (details !== undefined) {
    console.info(`${LOG_PREFIX} ${message}`, details);
    return;
  }
  console.info(`${LOG_PREFIX} ${message}`);
};

const logWarn = (message: string, details?: unknown) => {
  if (!import.meta.client) return;
  if (details !== undefined) {
    console.warn(`${LOG_PREFIX} ${message}`, details);
    return;
  }
  console.warn(`${LOG_PREFIX} ${message}`);
};

const normalizeEvent = (event: any) => {
  if (!event || typeof event !== "object") return null;
  return {
    id: event.id,
    kind: event.kind,
    pubkey: event.pubkey,
    created_at: event.created_at,
    content: event.content,
    tags: Array.isArray(event.tags) ? event.tags : [],
    sig: event.sig,
  };
};

const normalizeEventList = (events: unknown) => {
  if (!events) return [];
  const rawList = Array.isArray(events) ? events : Array.from(events as any);
  return rawList.map(normalizeEvent).filter(Boolean);
};

const getStorageKey = (key: string) => `${STORAGE_PREFIX}${key}`;

const readPersisted = <T>(key: string): CacheEntry<T> | null => {
  if (!import.meta.client) return null;
  try {
    const raw = localStorage.getItem(getStorageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.updatedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
};

const persistCache = <T>(key: string, entry: CacheEntry<T>) => {
  if (!import.meta.client) return;
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(entry));
  } catch {
    // Ignore storage errors.
  }
};

const getCached = <T>(key: string) => {
  const inMemory = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (inMemory) return inMemory;

  const persisted = readPersisted<T>(key);
  if (persisted) {
    memoryCache.set(key, persisted as CacheEntry<unknown>);
    return persisted;
  }

  return null;
};

const isFresh = (entry: CacheEntry<unknown> | null, ttlMs: number) => {
  if (!entry) return false;
  return now() - entry.updatedAt < ttlMs;
};

const shouldCacheData = (data: unknown) => {
  if (data == null) return false;
  if (Array.isArray(data) && data.length === 0) return false;
  return true;
};

const ensureClient = () => {
  if (!import.meta.client) {
    throw new Error("Nostr cache is client-only");
  }
};

const ensureConnected = async (relays: string[], timeoutMs: number) => {
  ensureClient();

  const relayKey = JSON.stringify(relays || []);
  if (!ndkClient || ndkRelaysKey !== relayKey) {
    ndkClient = new NDK({ explicitRelayUrls: relays });
    ndkRelaysKey = relayKey;
    connectInFlight = null;
  }

  if (!connectInFlight) {
    connectInFlight = withTimeout(ndkClient.connect(), timeoutMs)
      .then(() => {
        logInfo(`Connected to relay set (${relays.length})`, relays);
      })
      .catch((error) => {
        logWarn(
          "Relay connect timed out/failed; continuing with fetch attempt",
          {
            relays,
            error: error instanceof Error ? error.message : String(error),
          },
        );
        connectInFlight = null;
        return undefined;
      });
  }

  await connectInFlight;
  return ndkClient;
};

const setCache = <T>(key: string, data: T) => {
  const entry = { data, updatedAt: now() };
  memoryCache.set(key, entry as CacheEntry<unknown>);
  persistCache(key, entry);
};

const resolveCachedRequest = async <T>(
  params: QueryParams,
  requester: (ndk: NDK) => Promise<T>,
) => {
  const { key, relays, ttlMs, timeoutMs = 10_000 } = params;

  const cached = getCached<T>(key);
  if (isFresh(cached as CacheEntry<unknown> | null, ttlMs)) {
    return cached!.data;
  }

  if (requestInFlight.has(key)) {
    return (await requestInFlight.get(key)!) as T;
  }

  const request = (async () => {
    try {
      const relayCandidates = [
        relays,
        ...relays.map((relay) => [relay]),
      ].filter((candidate) => candidate.length > 0);

      let data: T | null = null;
      let lastError: unknown = null;

      for (const candidate of relayCandidates) {
        try {
          const ndk = await ensureConnected(candidate, timeoutMs);
          data = await withTimeout(requester(ndk), timeoutMs);
          if (candidate.length === 1 && candidate[0] !== relays[0]) {
            logInfo("Recovered query via single-relay fallback", {
              key,
              relay: candidate[0],
            });
          }
          break;
        } catch (error) {
          lastError = error;
          logWarn("Query attempt failed", {
            key,
            relays: candidate,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (data === null) {
        throw lastError || new Error("All relay attempts failed");
      }

      if (shouldCacheData(data)) {
        setCache(key, data);
        if (Array.isArray(data)) {
          logInfo("Query succeeded", { key, count: data.length });
        } else {
          logInfo("Query succeeded", { key, hasData: true });
        }
      } else {
        logInfo("Received empty response; skipping cache", { key });
      }

      return data;
    } catch (error) {
      if (cached) {
        logWarn("Using stale cached data after query failure", {
          key,
          error: error instanceof Error ? error.message : String(error),
        });
        return cached.data;
      }

      logWarn("No data returned and no cache fallback available", {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      requestInFlight.delete(key);
    }
  })();

  requestInFlight.set(key, request as Promise<unknown>);
  return await request;
};

export const useNostrCache = () => {
  const queryEvent = async (params: QueryParams) => {
    const event = await resolveCachedRequest<any | null>(
      params,
      async (ndk) => {
        const response = await ndk.fetchEvent(params.filter as any);
        return normalizeEvent(response);
      },
    );

    return event;
  };

  const queryEvents = async (params: QueryParams) => {
    const events = await resolveCachedRequest<any[]>(params, async (ndk) => {
      const response = await ndk.fetchEvents(params.filter as any);
      return normalizeEventList(response);
    });

    return events;
  };

  const primeCache = <T>(key: string, data: T) => {
    setCache(key, data);
  };

  return {
    queryEvent,
    queryEvents,
    primeCache,
  };
};
