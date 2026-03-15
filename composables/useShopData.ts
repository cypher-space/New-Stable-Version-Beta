import localProducts from "../config/products.json";
import setup from "../config/setup.json";
import { bech32 } from "bech32";

type ShopSourceMode = "nostr" | "local" | "hybrid";

type ShopProduct = {
  id: string;
  title: string;
  summary: string;
  description: string;
  fulldescription: string;
  image: string;
  images: string[];
  price: number;
  denomination: string;
  shipprice: number;
  stock: number;
  category: string[];
  variations: string[];
  features: string[];
  source: "nostr" | "local";
};

const PRODUCTS_KEY = "shop:products:30402";
const PRODUCTS_TTL_MS = 120_000;

const normalizeCategory = (value: string) => {
  if (value === "Food") return "Food & Drink";
  return value;
};

const extractSizeFromTitle = (title: string) => {
  const match = String(title || "").match(/\b(\d+\s?(?:oz|lb|g|kg|ml|l))\b/i);
  const size = match?.[1];
  return size ? size.toUpperCase() : "";
};

const toHex = (npub: string) => {
  const decoded = bech32.decode(npub);
  const pubkeyBytes = bech32.fromWords(decoded.words);
  return Array.from(pubkeyBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const adminHex = toHex(setup.nostradmin);

const mapNostrProduct = (event: any): ShopProduct => {
  const imageTag = event.tags?.find((tag: any[]) => tag[0] === "image");
  const summaryTag = event.tags?.find((tag: any[]) => tag[0] === "summary");
  const titleTag = event.tags?.find((tag: any[]) => tag[0] === "title");
  const priceTag = event.tags?.find((tag: any[]) => tag[0] === "price");
  const stockTag = event.tags?.find((tag: any[]) => tag[0] === "stock") || [
    0, 10,
  ];
  const tTags: string[] = (event.tags || [])
    .filter((tag: any[]) => tag[0] === "t" && tag[1])
    .map((tag: any[]) => normalizeCategory(String(tag[1]).trim()));
  const specValues: string[] = (event.tags || [])
    .filter((tag: any[]) => tag[0] === "spec" && tag[1] && tag[2])
    .map((tag: any[]) => `${tag[1]}: ${tag[2]}`);

  const title = titleTag ? String(titleTag[1]) : "Untitled Product";
  const sizeFromTitle = extractSizeFromTitle(title);

  const variations: string[] = [
    ...new Set([...specValues, ...(sizeFromTitle ? [sizeFromTitle] : [])]),
  ];

  const categories: string[] = [
    ...new Set(tTags.length ? tTags : ["Uncategorized"]),
  ];

  const primaryImage = imageTag ? String(imageTag[1]) : "";

  return {
    id: String(event.id),
    title,
    summary: summaryTag ? String(summaryTag[1]) : String(event.content || ""),
    description: summaryTag
      ? String(summaryTag[1])
      : String(event.content || ""),
    fulldescription: String(event.content || ""),
    image: primaryImage,
    images: primaryImage ? [primaryImage] : [],
    price: Number(priceTag?.[1] || 0),
    denomination: String(priceTag?.[2] || setup.fiat?.denomination || "BTC"),
    shipprice: 0,
    stock: Number(stockTag?.[1] || 0),
    category: categories,
    variations,
    features: [],
    source: "nostr",
  };
};

const mapLocalProduct = (product: any): ShopProduct => {
  const images = Array.isArray(product.images)
    ? product.images
        .map((image: any) => String(image?.src || ""))
        .filter((value: string) => Boolean(value))
    : [];

  return {
    id: String(product.id),
    title: String(product.title || "Untitled Product"),
    summary: String(product.description || ""),
    description: String(product.description || ""),
    fulldescription: String(
      product.fulldescription || product.description || "",
    ),
    image: images[0] || "",
    images,
    price: Number(product.price || 0),
    denomination: String(setup.fiat?.denomination || "BTC"),
    shipprice: Number(product.shipprice || 0),
    stock: Number(product.stock || 0),
    category: Array.isArray(product.category)
      ? product.category.map((item: unknown) => String(item))
      : [],
    variations: Array.isArray(product.variations)
      ? product.variations.map((item: unknown) => String(item))
      : [],
    features: Array.isArray(product.features)
      ? product.features.map((item: unknown) => String(item))
      : [],
    source: "local",
  };
};

export const useShopData = () => {
  const { queryEvent, queryEvents } = useNostrCache();

  const getLocalProducts = () => {
    return (Array.isArray(localProducts) ? localProducts : []).map(
      mapLocalProduct,
    );
  };

  const getNostrProducts = async () => {
    const events = await queryEvents({
      key: PRODUCTS_KEY,
      relays: setup.relays,
      filter: { kinds: [30402], authors: [adminHex], limit: 100 },
      ttlMs: PRODUCTS_TTL_MS,
      timeoutMs: 10_000,
    });

    return events.map(mapNostrProduct);
  };

  const getShopProducts = async (modeInput?: string) => {
    const mode = String(
      modeInput || setup.shopsource || "hybrid",
    ) as ShopSourceMode;

    if (mode === "local") {
      return getLocalProducts();
    }

    if (mode === "nostr") {
      return await getNostrProducts();
    }

    try {
      const nostrProducts = await getNostrProducts();
      if (nostrProducts.length > 0) {
        return nostrProducts;
      }
    } catch {
      // fall through to local fallback
    }

    return getLocalProducts();
  };

  const getShopProductById = async (id: string, modeInput?: string) => {
    const normalizedId = String(id);
    const mode = String(
      modeInput || setup.shopsource || "hybrid",
    ) as ShopSourceMode;

    if (mode === "local") {
      return (
        getLocalProducts().find((product) => product.id === normalizedId) ||
        null
      );
    }

    if (mode === "nostr") {
      const event = await queryEvent({
        key: `shop:product:30402:${normalizedId}`,
        relays: setup.relays,
        filter: { kinds: [30402], authors: [adminHex], ids: [normalizedId] },
        ttlMs: PRODUCTS_TTL_MS,
        timeoutMs: 10_000,
      });

      return event ? mapNostrProduct(event) : null;
    }

    const cachedList = await getShopProducts("hybrid");
    const fromList = cachedList.find((product) => product.id === normalizedId);
    if (fromList) return fromList;

    try {
      const event = await queryEvent({
        key: `shop:product:30402:${normalizedId}`,
        relays: setup.relays,
        filter: { kinds: [30402], authors: [adminHex], ids: [normalizedId] },
        ttlMs: PRODUCTS_TTL_MS,
        timeoutMs: 10_000,
      });

      if (event) {
        return mapNostrProduct(event);
      }
    } catch {
      // fall through to local fallback
    }

    return (
      getLocalProducts().find((product) => product.id === normalizedId) || null
    );
  };

  return {
    getShopProducts,
    getShopProductById,
  };
};
