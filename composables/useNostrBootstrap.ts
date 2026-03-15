import setup from "../config/setup.json";
import { bech32 } from "bech32";

const LOG_PREFIX = "[nostr-bootstrap]";

let coreWarmInFlight: Promise<void> | null = null;
let heavyWarmInFlight: Promise<void> | null = null;

const toHex = (npub: string) => {
  const decoded = bech32.decode(npub);
  const pubkeyBytes = bech32.fromWords(decoded.words);
  return Array.from(pubkeyBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const adminHex = toHex(setup.nostradmin);

const logInfo = (message: string, details?: unknown) => {
  if (!import.meta.client) return;
  if (details !== undefined) {
    console.info(`${LOG_PREFIX} ${message}`, details);
    return;
  }
  console.info(`${LOG_PREFIX} ${message}`);
};

export const useNostrBootstrap = () => {
  const { queryEvent, queryEvents } = useNostrCache();
  const { getShopProducts } = useShopData();

  const warmProfile = async () => {
    await queryEvent({
      key: `profile:${adminHex}`,
      relays: setup.relays,
      filter: { kinds: [0], authors: [adminHex] },
      ttlMs: 600_000,
      timeoutMs: 10_000,
    });
  };

  const warmShop = async () => {
    await getShopProducts(setup.shopsource);
  };

  const warmLongform = async () => {
    await queryEvents({
      key: `longform:${adminHex}`,
      relays: setup.relays,
      filter: { kinds: [30023], authors: [adminHex], limit: 30 },
      ttlMs: 300_000,
      timeoutMs: 10_000,
    });
  };

  const warmGallery = async () => {
    await queryEvents({
      key: `gallery:${adminHex}`,
      relays: setup.relays,
      filter: { kinds: [20], authors: [adminHex], limit: 60 },
      ttlMs: 300_000,
      timeoutMs: 10_000,
    });
  };

  const warmFeed = async () => {
    await queryEvents({
      key: `feed:${adminHex}`,
      relays: setup.relays,
      filter: { kinds: [1], authors: [adminHex], limit: 40 },
      ttlMs: 120_000,
      timeoutMs: 10_000,
    });
  };

  const warmCoreData = async () => {
    if (coreWarmInFlight) return await coreWarmInFlight;

    coreWarmInFlight = (async () => {
      logInfo("Warming core data (profile, shop, longform)");
      await Promise.allSettled([warmProfile(), warmShop(), warmLongform()]);
    })().finally(() => {
      coreWarmInFlight = null;
    });

    return await coreWarmInFlight;
  };

  const warmHeavyData = async () => {
    if (heavyWarmInFlight) return await heavyWarmInFlight;

    heavyWarmInFlight = (async () => {
      logInfo("Warming heavy data (gallery, feed)");
      await Promise.allSettled([warmGallery(), warmFeed()]);
    })().finally(() => {
      heavyWarmInFlight = null;
    });

    return await heavyWarmInFlight;
  };

  const warmRouteData = async (path: string) => {
    const normalized = String(path || "");
    if (normalized.includes("/shop") || normalized.includes("/item/")) {
      await Promise.allSettled([warmShop(), warmProfile()]);
      return;
    }

    if (normalized.includes("/notes") || normalized.includes("/note/")) {
      await Promise.allSettled([warmLongform(), warmProfile()]);
      return;
    }

    if (normalized.includes("/gallery")) {
      await Promise.allSettled([warmGallery(), warmProfile()]);
      return;
    }

    if (normalized.includes("/contact")) {
      await Promise.allSettled([warmProfile(), warmFeed()]);
      return;
    }
  };

  return {
    warmCoreData,
    warmHeavyData,
    warmRouteData,
  };
};
