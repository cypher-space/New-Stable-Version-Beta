<template>
  <div class="farm-grain-bg min-h-screen py-20">
    <MDC
      v-if="eventContent"
      :value="eventContent"
      tag="article"
      class="farm-prose px-6 mt-8 prose dark:prose-invert mx-auto py-8 max-w-3xl"
    />
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import setup from "~/config/setup";
import { bech32 } from "bech32";
const { queryEvent, queryEvents } = useNostrCache();

const bytesToHex = (bytes) => {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const npubToHex = (npub) => {
  const decoded = bech32.decode(npub);
  const pubkeyBytes = bech32.fromWords(decoded.words);
  return bytesToHex(Uint8Array.from(pubkeyBytes));
};

const skHex = npubToHex(setup.nostradmin);

const route = useRoute();
const slugroute = route.params.slug;
const event = ref(null);
const eventContent = ref("");

onBeforeMount(async () => {
  try {
    const longformEvents = await queryEvents({
      key: `longform:${skHex}`,
      relays: setup.relays,
      filter: { kinds: [30023], authors: [skHex], limit: 30 },
      ttlMs: 60_000,
      timeoutMs: 10_000,
    });

    const fromList = longformEvents.find(
      (entry) => entry.id === String(slugroute),
    );
    event.value =
      fromList ||
      (await queryEvent({
        key: `note:${slugroute}`,
        relays: setup.relays,
        filter: {
          kinds: [30023],
          authors: [skHex],
          ids: [slugroute],
        },
        ttlMs: 60_000,
        timeoutMs: 10_000,
      }));

    if (event.value && event.value.content) {
      eventContent.value = event.value.content;
    }
  } catch {
    event.value = null;
    eventContent.value = "";
  }
});

// const { t } = useI18n({ useScope: "local" });
</script>
