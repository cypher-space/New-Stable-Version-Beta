import { bech32 } from "bech32";
import { wrapEvent } from "nostr-tools/nip17";
import { SimplePool } from "nostr-tools/pool";
import { generateSecretKey } from "nostr-tools/pure";

const bytesToHex = (bytes) => {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const npubToHex = (npubValue) => {
  const decoded = bech32.decode(npubValue);
  const pubkeyBytes = bech32.fromWords(decoded.words);
  return bytesToHex(Uint8Array.from(pubkeyBytes));
};

const formatItemLine = (item, index) => {
  const title = item.title || item.name || "Untitled";
  const variation = item.variation ? ` (${item.variation})` : "";
  const qty = Number(item.amount || item.quantity || 1);
  const unit = Number(item.price || 0);
  const subtotal = qty * unit;
  return `${index + 1}. ${title}${variation} | qty: ${qty} | unit: ${unit.toFixed(2)} | subtotal: ${subtotal.toFixed(2)}`;
};

export const buildOrderMessage = ({
  orderId,
  checkoutMode,
  customer,
  items,
  totals,
  timestamp,
}) => {
  const safeItems = Array.isArray(items) ? items : [];
  const itemLines = safeItems.length
    ? safeItems.map(formatItemLine).join("\n")
    : "No cart items found";

  return [
    `Order ID: ${orderId || "unknown"}`,
    `Checkout mode: ${checkoutMode || "unknown"}`,
    `Timestamp: ${new Date(timestamp || Date.now()).toISOString()}`,
    "",
    "Customer",
    `Name: ${customer.name || ""}`,
    `Email: ${customer.email || ""}`,
    `Address: ${customer.address || ""}`,
    `Apartment: ${customer.apartment || ""}`,
    `City: ${customer.city || ""}`,
    `Postal code: ${customer.postalcode || ""}`,
    `Region: ${customer.region || ""}`,
    `Country: ${customer.country || ""}`,
    `Local identity: ${customer.localidentity || ""}`,
    "",
    "Items",
    itemLines,
    "",
    "Totals",
    `Subtotal: ${Number(totals.subtotalFiat || 0).toFixed(2)} ${totals.fiatSymbol || totals.fiatCurrency || ""}`,
    `Shipping: ${Number(totals.shippingFiat || 0).toFixed(2)} ${totals.fiatSymbol || totals.fiatCurrency || ""}`,
    `Total fiat: ${Number(totals.totalFiat || 0).toFixed(2)} ${totals.fiatSymbol || totals.fiatCurrency || ""}`,
    `Total BTC: ${Number(totals.totalBtc || 0).toFixed(8)} BTC`,
  ].join("\n");
};

const sendNostrOrderDm = async (payload, config) => {
  const inboxRelays = (config.nostrInboxRelays || []).filter(Boolean);
  if (!inboxRelays.length) {
    throw new Error("No inbox relays configured for order DM.");
  }

  const recipientHex = npubToHex(config.nostradmin);
  const senderSecretKey = generateSecretKey();

  const wrappedEvent = wrapEvent(
    senderSecretKey,
    { publicKey: recipientHex, relayUrl: inboxRelays[0] },
    payload,
    "Cypher Order",
  );

  const pool = new SimplePool();
  try {
    await Promise.any(pool.publish(inboxRelays, wrappedEvent));
    return true;
  } finally {
    pool.close(inboxRelays);
  }
};

const sendOrderWebhook = async (payload, config) => {
  const webhook = String(config.orderwebhook || "").trim();
  if (!webhook) {
    return false;
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "The Order Bot",
      avatar_url: "https://i.imgur.com/oBPXx0D.png",
      content: payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`Webhook HTTP error: ${response.status}`);
  }

  return true;
};

export const dispatchOrderNotification = async (payload, config) => {
  let dmSent = false;
  let webhookSent = false;
  let dmError = null;
  let webhookError = null;

  try {
    await sendNostrOrderDm(payload, config);
    dmSent = true;
  } catch (error) {
    dmError = error;
  }

  try {
    webhookSent = await sendOrderWebhook(payload, config);
  } catch (error) {
    webhookError = error;
  }

  if (!dmSent && !webhookSent) {
    throw dmError || webhookError || new Error("Order dispatch failed.");
  }

  return { dmSent, webhookSent, dmError, webhookError };
};
