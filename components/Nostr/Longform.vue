<script setup>
import { ref, onMounted } from "vue";
import setup from "~/config/setup";
import { bech32 } from "bech32";
const { queryEvents } = useNostrCache();

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
const page = ref(0);
const pageSize = 3; // Number of events per page

const extractMediaUrl = (content) => {
  const regex = /(https?:\/\/[^\s]+(?:png|jpg|mp4))/g;
  const matches = content.match(regex);
  return matches ? matches[0] : null;
};

const cleanedContent = (content) => {
  const mediaRegex = /(https?:\/\/[^\s]+(?:png|jpg|mp4))/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const cleaned = content.replace(mediaRegex, "").replace(urlRegex, "").trim();
  return cleaned;
};

const fetchEvents = async (pageNumber) => {
  isLoading.value = true;
  try {
    const fetchedEvents = await queryEvents({
      key: `longform:${skHex}`,
      relays: setup.relays,
      filter: { kinds: [30023], authors: [skHex], limit: 30 },
      ttlMs: 300_000,
      timeoutMs: 10_000,
    });

    const newEvents = Array.from(fetchedEvents)
      .slice(pageNumber * pageSize, (pageNumber + 1) * pageSize)
      .map((event) => {
        const imageTag = event.tags.find((tag) => tag[0] === "image");
        const summaryTag = event.tags.find((tag) => tag[0] === "summary");
        const titleTag = event.tags.find((tag) => tag[0] === "title");
        return {
          ...event,
          image: imageTag ? imageTag[1] : null,
          summary: summaryTag ? summaryTag[1] : null,
          title: titleTag ? titleTag[1] : null,
        };
      });

    if (pageNumber === 0) {
      events.value = newEvents;
    } else {
      events.value = [...events.value, ...newEvents];
    }
  } catch {
    if (pageNumber === 0) {
      events.value = [];
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchEvents(page.value);
});

const loadMore = async () => {
  page.value += 1;
  await fetchEvents(page.value);
};

const { t } = useI18n({ useScope: "local" });
</script>

<i18n lang="json">
{
  "da": {
    "title": "OPSKRIFTER",
    "subtitle": "Udviklingsnotater med emner fra projekter, men også generelle ting om Bitcoin, Lightning, Nostr, Relay Setup, E-cash, DVM things, udvikling,.."
  },
  "de": {
    "title": "REZEPTE",
    "subtitle": "Entwicklungsnotizen mit Themen aus Projekten, aber auch allgemeine Sachen über Bitcoin, Lightning, Nostr, Nostr, Relay Setup, E-cash, DVM things, Entwicklung,.."
  },
  "en": {
    "title": "RECIPES",
    "subtitle": "Development notes with topics from projects but also general stuff about Bitcoin, Lightning, Nostr, Nostr, Relay Setup, E-cash, DVM things, Development,.. "
  },
  "es": {
    "title": "RECETAS",
    "subtitle": "Notas de desarrollo con temas de proyectos pero también cosas generales sobre Bitcoin, Lightning, Nostr, Nostr, Relay Setup, E-cash, DVM things, desarrollo,.."
  },
  "fr": {
    "title": "RECETTES",
    "subtitle": "Notes de développement avec des sujets provenant de projets mais aussi des choses générales sur Bitcoin, Lightning, Nostr, Nostr, Relay Setup, E-cash, DVM things, développement,.."
  },
  "nl": {
    "title": "RECEPTEN",
    "subtitle": "Ontwikkelingsnotities met onderwerpen van projecten maar ook algemene dingen over Bitcoin, Lightning, Nostr, Nostr, Relay Setup, E-cash, DVM things, ontwikkeling,.."
  },
  "pt": {
    "title": "RECEITAS",
    "subtitle": "Notas de desenvolvimento com tópicos de projetos, mas também coisas gerais sobre Bitcoin, Lightning, Nostr, Nostr, Relay Setup, E-cash, DVM things, desenvolvimento,.."
  }
}
</i18n>

<template>
  <div class="bg-colorBgLight dark:bg-colorBgDark farm-grain-bg my-24">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center px-6 py-4">
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl farm-title">
          {{ t("title") }}
        </h2>
        <!-- <p class="mt-2 text-lg leading-8 text-gray-900 dark:text-gray-100">
          {{ t("subtitle") }}
        </p> -->
      </div>
      <UiLoadingBuffer v-if="isLoading" />
      <div v-else>
        <div v-if="events.length === 0" class="text-center mt-12">
          <p>No Notes found</p>
        </div>
        <div
          v-else
          class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 mt-12"
        >
          <article
            v-for="(event, index) in events"
            :key="index"
            class="flex flex-col items-start"
          >
            <NuxtLink :to="localePath('/note/' + event.id)">
              <div class="relative w-full">
                <img
                  :src="event.image || '/placeholder-img.png'"
                  alt="Event Image"
                  class="aspect-[16/9] w-full object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                />
              </div>
            </NuxtLink>
            <div class="max-w-xl px-4 pb-4 w-full">
              <div class="mt-8 flex items-center gap-x-4 text-xs">
                <time
                  :datetime="new Date(event.created_at * 1000).toISOString()"
                  class="farm-subtitle"
                >
                  {{ new Date(event.created_at * 1000).toLocaleDateString() }}
                </time>
              </div>
              <div class="group relative">
                <h3 class="mt-3 text-lg font-semibold leading-6 farm-title">
                  <NuxtLink :to="localePath('/note/' + event.id)">
                    <span class="absolute inset-0"></span>
                    {{ event.title }}
                  </NuxtLink>
                </h3>
                <p class="mt-5 line-clamp-3 text-sm leading-6 farm-subtitle">
                  {{ event.summary }}
                </p>
              </div>
            </div>
          </article>
        </div>
        <div class="text-center mt-8" v-if="!events.length === 0">
          <button
            @click="loadMore"
            class="farm-button-primary text-white px-4 py-2"
          >
            Load More
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
