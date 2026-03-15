<template>
  <main
    class="bg-colorBgLight dark:bg-colorBgDark farm-grain-bg min-h-screen py-16"
  >
    <section class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="text-center">
        <h1
          class="text-4xl sm:text-5xl font-black tracking-tight uppercase farm-title"
        >
          Gallery
        </h1>
      </div>

      <UiLoadingBuffer v-if="isLoading" />

      <div v-else>
        <div
          v-if="tagBuckets.length"
          class="mt-10 flex flex-wrap justify-center gap-2"
        >
          <button
            class="rounded-full px-4 py-2 text-sm font-semibold transition farm-chip"
            :class="selectedTag === 'all' ? 'farm-chip-active' : ''"
            @click="selectedTag = 'all'"
          >
            All ({{ items.length }})
          </button>

          <button
            v-for="bucket in tagBuckets"
            :key="bucket.tag"
            class="rounded-full px-4 py-2 text-sm font-semibold transition farm-chip"
            :class="selectedTag === bucket.tag ? 'farm-chip-active' : ''"
            @click="selectedTag = bucket.tag"
          >
            #{{ bucket.tag }} ({{ bucket.items.length }})
          </button>
        </div>

        <div
          v-if="!items.length"
          class="text-center mt-16 text-gray-600 dark:text-gray-300"
        >
          No pictures found.
        </div>

        <div v-else class="mt-12 space-y-14">
          <section v-for="bucket in visibleBuckets" :key="bucket.tag">
            <h2
              class="text-2xl font-extrabold text-gray-900 dark:text-white mb-6"
            >
              {{ bucket.title }}
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <article
                v-for="item in bucket.items"
                :key="item.id"
                class="farm-card"
              >
                <button
                  type="button"
                  class="block w-full"
                  @click="openLightbox(item.id)"
                >
                  <img
                    :src="item.imageUrl"
                    :alt="item.alt"
                    class="h-72 w-full object-cover transition duration-200 hover:scale-[1.03]"
                    loading="lazy"
                  />
                </button>
                <div class="p-4 farm-label-strip">
                  <p
                    v-if="item.caption"
                    class="text-sm line-clamp-3 farm-subtitle"
                  >
                    {{ item.caption }}
                  </p>
                  <time
                    class="mt-3 block text-xs text-gray-500 dark:text-gray-400"
                  >
                    {{ new Date(item.created_at * 1000).toLocaleString() }}
                  </time>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </section>

    <div
      v-if="activeLightboxItem"
      class="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      @click.self="closeLightbox"
    >
      <button
        type="button"
        class="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-1 text-white hover:bg-white/30"
        @click="closeLightbox"
      >
        Close
      </button>

      <div class="h-full w-full flex items-center justify-center px-4 sm:px-10">
        <button
          v-if="lightboxItems.length > 1"
          type="button"
          class="mr-3 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
          @click.stop="showPrev"
        >
          ◀
        </button>

        <figure class="max-w-6xl w-full">
          <img
            :src="activeLightboxItem.imageUrl"
            :alt="activeLightboxItem.alt"
            class="max-h-[75vh] w-full object-contain rounded-xl"
          />
          <figcaption class="mt-4 text-center text-gray-200">
            <p v-if="activeLightboxItem.caption" class="text-sm sm:text-base">
              {{ activeLightboxItem.caption }}
            </p>
            <time class="mt-2 block text-xs text-gray-400">
              {{
                new Date(activeLightboxItem.created_at * 1000).toLocaleString()
              }}
            </time>
          </figcaption>
        </figure>

        <button
          v-if="lightboxItems.length > 1"
          type="button"
          class="ml-3 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
          @click.stop="showNext"
        >
          ▶
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { bech32 } from "bech32";
import setup from "~/config/setup";
const { queryEvents } = useNostrCache();

const items = ref([]);
const isLoading = ref(true);
const selectedTag = ref("all");
const activeImageId = ref("");

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

const parseImetaPairs = (tag) => {
  if (!Array.isArray(tag) || tag[0] !== "imeta") return {};
  const pairs = {};
  for (const segment of tag.slice(1)) {
    const idx = String(segment).indexOf(" ");
    if (idx <= 0) continue;
    const key = String(segment).slice(0, idx).toLowerCase();
    const value = String(segment)
      .slice(idx + 1)
      .trim();
    if (!pairs[key]) pairs[key] = value;
  }
  return pairs;
};

const normalizeKind20Event = (event) => {
  const tags = Array.isArray(event.tags) ? event.tags : [];
  const imetaTag = tags.find((tag) => tag[0] === "imeta");
  const imeta = parseImetaPairs(imetaTag);

  const imageFromImeta = imeta.url || imeta.image || imeta.thumb || "";
  const imageFromTag = tags.find((tag) => tag[0] === "url")?.[1] || "";
  const imageUrl = imageFromImeta || imageFromTag;

  if (!imageUrl) return null;

  const altFromTag = tags.find((tag) => tag[0] === "alt")?.[1] || "";
  const alt = altFromTag || imeta.alt || "Nostr picture";

  const hashtags = tags
    .filter((tag) => tag[0] === "t" && tag[1])
    .map((tag) => String(tag[1]).trim().toLowerCase())
    .filter(Boolean);

  return {
    id: event.id,
    created_at: event.created_at || 0,
    caption: event.content || "",
    imageUrl,
    alt,
    hashtags,
  };
};

const tagBuckets = computed(() => {
  const bucketMap = new Map();

  for (const item of items.value) {
    const tags = item.hashtags.length ? item.hashtags : ["untagged"];
    for (const tag of tags) {
      if (!bucketMap.has(tag)) bucketMap.set(tag, []);
      bucketMap.get(tag).push(item);
    }
  }

  return Array.from(bucketMap.entries())
    .map(([tag, bucketItems]) => ({
      tag,
      title: tag === "untagged" ? "Untagged" : `#${tag}`,
      items: bucketItems.sort((a, b) => b.created_at - a.created_at),
    }))
    .sort((a, b) => {
      if (b.items.length !== a.items.length)
        return b.items.length - a.items.length;
      return a.tag.localeCompare(b.tag);
    });
});

const visibleBuckets = computed(() => {
  if (selectedTag.value === "all") return tagBuckets.value;
  return tagBuckets.value.filter((bucket) => bucket.tag === selectedTag.value);
});

const lightboxItems = computed(() => {
  return visibleBuckets.value.flatMap((bucket) => bucket.items);
});

const activeLightboxIndex = computed(() => {
  return lightboxItems.value.findIndex(
    (item) => item.id === activeImageId.value,
  );
});

const activeLightboxItem = computed(() => {
  if (activeLightboxIndex.value < 0) return null;
  return lightboxItems.value[activeLightboxIndex.value] || null;
});

const openLightbox = (id) => {
  activeImageId.value = id;
};

const closeLightbox = () => {
  activeImageId.value = "";
};

const showPrev = () => {
  if (!lightboxItems.value.length) return;
  const current = activeLightboxIndex.value;
  const target = current <= 0 ? lightboxItems.value.length - 1 : current - 1;
  activeImageId.value = lightboxItems.value[target].id;
};

const showNext = () => {
  if (!lightboxItems.value.length) return;
  const current = activeLightboxIndex.value;
  const target =
    current >= lightboxItems.value.length - 1 || current < 0 ? 0 : current + 1;
  activeImageId.value = lightboxItems.value[target].id;
};

const onKeydown = (event) => {
  if (!activeLightboxItem.value) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showPrev();
  if (event.key === "ArrowRight") showNext();
};

watch(activeLightboxItem, (item) => {
  if (import.meta.client) {
    document.body.style.overflow = item ? "hidden" : "";
  }
});

watch(selectedTag, () => {
  if (
    activeImageId.value &&
    !lightboxItems.value.some((item) => item.id === activeImageId.value)
  ) {
    closeLightbox();
  }
});

onMounted(async () => {
  if (import.meta.client) {
    window.addEventListener("keydown", onKeydown);
  }

  isLoading.value = true;
  try {
    const fetchedEvents = await queryEvents({
      key: `gallery:${skHex}`,
      relays: setup.relays,
      filter: { kinds: [20], authors: [skHex], limit: 60 },
      ttlMs: 60_000,
      timeoutMs: 10_000,
    });

    items.value = Array.from(fetchedEvents)
      .map(normalizeKind20Event)
      .filter(Boolean)
      .sort((a, b) => b.created_at - a.created_at);
  } catch {
    items.value = [];
  } finally {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener("keydown", onKeydown);
    document.body.style.overflow = "";
  }
});
</script>
