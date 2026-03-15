<template>
  <div class="container mx-auto p-4 max-w-7xl mt-12">
    <!-- <p class="text-center">
        <RelayIcon class="w-16 h-16 dark:text-gray-200 inline" />
      </p>
      <h1 class="text-2xl text-center dark:text-white mb-6">
        Straight of the Relay
      </h1> -->

    <UiLoadingBuffer v-if="isLoading" />

    <div v-else class="flex items-center justify-center">
      <button
        @click="prev"
        :disabled="startIndex === 0"
        class="p-2 bg-gray-300 rounded-full disabled:opacity-50"
      >
        <svg
          class="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
      </button>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-4 overflow-hidden"
      >
        <div
          v-for="(event, index) in displayedEvents"
          :key="index"
          class="w-full p-4 bg-white rounded-lg shadow-2xl dark:bg-black dark:shadow-lg dark:shadow-gray-700"
        >
          <p>
            <CalendarDaysIcon
              class="-mt-1 w-7 h-7 text-gray-500 dark:text-gray-300 inline"
            />
            {{ new Date(event.created_at * 1000).toLocaleString() }}
          </p>
          <p><strong></strong> {{ cleanedContent(event.content) }}</p>
          <p v-if="extractMediaUrl(event.content)">
            <img
              v-if="isImage(extractMediaUrl(event.content))"
              :src="extractMediaUrl(event.content)"
              alt="Event Media"
              class="mt-2 rounded-lg shadow-md max-w-full h-auto"
            />
            <video
              v-if="isVideo(extractMediaUrl(event.content))"
              :src="extractMediaUrl(event.content)"
              controls
              class="mt-2 rounded-lg shadow-md max-w-full h-auto"
            ></video>
          </p>
          <p v-else-if="extractUrl(event.content)">
            <a
              :href="extractUrl(event.content)"
              target="_blank"
              class="text-blue-500 underline"
              >{{ extractUrl(event.content) }}</a
            >
          </p>
        </div>
      </div>

      <button
        @click="next"
        :disabled="startIndex + eventsPerPage >= events.length"
        class="p-2 bg-gray-300 rounded-full disabled:opacity-50"
      >
        <svg
          class="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import setup from "~/config/setup";

import { bech32 } from "bech32";
const { queryEvents } = useNostrCache();

import { CalendarDaysIcon } from "@heroicons/vue/24/outline";

import { RelayIcon } from "@bitcoin-design/bitcoin-icons-vue/filled";

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

const events = ref([]);
const isLoading = ref(true);
const startIndex = ref(0);

const extractMediaUrl = (content) => {
  const regex = /(https?:\/\/[^\s]+(?:png|jpg|mp4|gif))/g;
  const matches = content.match(regex);
  return matches ? matches[0] : null;
};

const extractUrl = (content) => {
  const regex = /(https?:\/\/[^\s]+)/g;
  const matches = content.match(regex);
  return matches ? matches[0] : null;
};

const cleanedContent = (content) => {
  const mediaRegex = /(https?:\/\/[^\s]+(?:png|jpg|mp4|gif))/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const cleaned = content.replace(mediaRegex, "").replace(urlRegex, "").trim();
  return cleaned;
};

const isImage = (url) => {
  return (
    url &&
    (url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".gif"))
  );
};

const isVideo = (url) => {
  return url && url.endsWith(".mp4");
};

const isNotReply = (event) => {
  return !event.tags.some((tag) => tag[0] === "e");
};

const eventsPerPage = computed(() => {
  if (import.meta.server) return 3;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
});

const displayedEvents = computed(() => {
  return events.value.slice(
    startIndex.value,
    startIndex.value + eventsPerPage.value,
  );
});

const prev = () => {
  if (startIndex.value > 0) {
    startIndex.value -= eventsPerPage.value;
  }
};

const next = () => {
  if (startIndex.value + eventsPerPage.value < events.value.length) {
    startIndex.value += eventsPerPage.value;
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const fetchedEvents = await queryEvents({
      key: `feed:${skHex}`,
      relays: setup.relays,
      filter: { kinds: [1], authors: [skHex], limit: 40 },
      ttlMs: 120_000,
      timeoutMs: 10_000,
    });

    events.value = Array.from(fetchedEvents).filter(isNotReply).slice(0, 10);
  } catch {
    events.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>
