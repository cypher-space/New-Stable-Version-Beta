type BtcRates = {
  fiat: string;
  btcPerFiat: number;
  usdPerBtc: number;
  fiatToUsd: number;
  source: "coinbase" | "coingecko" | "cache" | "none";
  updatedAt: number;
  isStale: boolean;
};

const TTL_MS = 60_000;
const STORAGE_PREFIX = "cypher-btc-rates:";

const memoryCache = new Map<string, BtcRates>();
const inFlight = new Map<string, Promise<BtcRates>>();

const clampNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs = 6000) => {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Rates request timed out")), timeoutMs);
    }),
  ]);
};

const defaultRates = (fiat: string): BtcRates => ({
  fiat,
  btcPerFiat: 0,
  usdPerBtc: 0,
  fiatToUsd: 0,
  source: "none",
  updatedAt: Date.now(),
  isStale: true,
});

const isFresh = (rates?: BtcRates) => {
  if (!rates) return false;
  return Date.now() - rates.updatedAt < TTL_MS;
};

const fromCoinbase = async (fiat: string): Promise<BtcRates> => {
  const [fiatResponse, btcResponse] = await Promise.all([
    withTimeout(
      $fetch<{ data?: { rates?: Record<string, string> } }>(
        `https://api.coinbase.com/v2/exchange-rates?currency=${fiat}`,
      ),
    ),
    withTimeout(
      $fetch<{ data?: { rates?: Record<string, string> } }>(
        "https://api.coinbase.com/v2/exchange-rates?currency=BTC",
      ),
    ),
  ]);

  const btcPerFiat = clampNumber(fiatResponse?.data?.rates?.BTC);
  const usdPerBtc = clampNumber(btcResponse?.data?.rates?.USD);
  const fiatToUsd = clampNumber(
    fiatResponse?.data?.rates?.USD,
    usdPerBtc * btcPerFiat,
  );

  if (btcPerFiat <= 0 || usdPerBtc <= 0) {
    throw new Error("Coinbase returned invalid rates");
  }

  return {
    fiat,
    btcPerFiat,
    usdPerBtc,
    fiatToUsd,
    source: "coinbase",
    updatedAt: Date.now(),
    isStale: false,
  };
};

const fromCoingecko = async (fiat: string): Promise<BtcRates> => {
  const fiatLower = fiat.toLowerCase();
  const response = await withTimeout(
    $fetch<Record<string, Record<string, number>>>(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${fiatLower},usd`,
    ),
  );

  const usdPerBtc = clampNumber(response?.bitcoin?.usd);
  const fiatPerBtc = clampNumber(response?.bitcoin?.[fiatLower]);
  const btcPerFiat = fiatPerBtc > 0 ? 1 / fiatPerBtc : 0;
  const fiatToUsd = fiatPerBtc > 0 ? usdPerBtc / fiatPerBtc : 0;

  if (btcPerFiat <= 0 || usdPerBtc <= 0) {
    throw new Error("Coingecko returned invalid rates");
  }

  return {
    fiat,
    btcPerFiat,
    usdPerBtc,
    fiatToUsd,
    source: "coingecko",
    updatedAt: Date.now(),
    isStale: false,
  };
};

const readPersisted = (fiat: string): BtcRates | null => {
  if (!import.meta.client) return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${fiat}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BtcRates;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.btcPerFiat || !parsed.usdPerBtc) return null;
    return { ...parsed, fiat };
  } catch {
    return null;
  }
};

const persistRates = (rates: BtcRates) => {
  if (!import.meta.client) return;
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${rates.fiat}`,
      JSON.stringify(rates),
    );
  } catch {
    // Ignore storage errors.
  }
};

const fetchWithFallback = async (fiat: string) => {
  try {
    return await fromCoinbase(fiat);
  } catch {
    return await fromCoingecko(fiat);
  }
};

export const useBtcRates = async (fiatInput: string) => {
  const fiat = String(fiatInput || "USD").toUpperCase();

  const persisted = readPersisted(fiat);
  const cached = memoryCache.get(fiat) || persisted || undefined;
  if (cached) {
    memoryCache.set(fiat, cached);
  }

  if (isFresh(cached)) {
    return { ...cached!, isStale: false };
  }

  if (inFlight.has(fiat)) {
    return await inFlight.get(fiat)!;
  }

  const request = (async () => {
    try {
      const fresh = await fetchWithFallback(fiat);
      memoryCache.set(fiat, fresh);
      persistRates(fresh);
      return fresh;
    } catch {
      if (cached) {
        return { ...cached, source: "cache", isStale: true };
      }
      return defaultRates(fiat);
    } finally {
      inFlight.delete(fiat);
    }
  })();

  inFlight.set(fiat, request);
  return await request;
};
