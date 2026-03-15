<template>
  <div class="isolate px-6 py-24 sm:py-24 lg:px-8 farm-grain-bg rounded-2xl">
    <div
      class="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
      aria-hidden="true"
    >
      <div
        class="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
        style="
          clip-path: polygon(
            74.1% 44.1%,
            100% 61.6%,
            97.5% 26.9%,
            85.5% 0.1%,
            80.7% 2%,
            72.5% 32.5%,
            60.2% 62.4%,
            52.4% 68.1%,
            47.5% 58.3%,
            45.2% 34.5%,
            27.5% 76.7%,
            0.1% 64.9%,
            17.9% 100%,
            27.6% 76.8%,
            76.1% 97.7%,
            74.1% 44.1%
          );
        "
      />
    </div>
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl farm-title">
        {{ t("title") }}
      </h2>
    </div>

    <div
      class="mt-12 farm-status-note farm-status-note--error max-w-4xl mx-auto"
      v-if="warning === 'error'"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <ExclamationTriangleIcon
            class="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">{{ t("line1") }}</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>{{ statusMessage }}</p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="mt-12 farm-status-note farm-status-note--success max-w-4xl mx-auto"
      v-if="warning === 'success'"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <PaperAirplaneIcon
            class="h-5 w-5 text-green-400"
            aria-hidden="true"
          />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-gray-800">{{ t("line3") }}</h3>
          <div class="mt-2 text-sm text-gray-700">
            <p>{{ statusMessage || t("line4") }}</p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="mx-auto mt-16 max-w-6xl sm:mt-20 grid grid-cols-1 lg:grid-cols-5 gap-10 items-start"
    >
      <div class="lg:col-span-3 farm-panel p-6 sm:p-8">
        <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <label
              for="first-name"
              class="block text-sm font-semibold leading-6 text-gray-900 dark:text-white"
              >{{ t("firstname") }}</label
            >
            <div class="mt-2.5">
              <input
                type="text"
                name="first-name"
                v-model="firstname"
                autocomplete="given-name"
                class="block w-full px-3.5 py-2 shadow-sm sm:text-sm sm:leading-6 farm-input"
              />
            </div>
          </div>

          <div class="sm:col-span-2">
            <label
              for="email"
              class="block text-sm font-semibold leading-6 text-gray-900 dark:text-white"
              >{{ t("email") }}</label
            >
            <div class="mt-2.5">
              <input
                type="email"
                name="email"
                v-model="email"
                required
                autocomplete="email"
                class="block w-full px-3.5 py-2 shadow-sm sm:text-sm sm:leading-6 farm-input"
              />
            </div>
          </div>

          <div class="sm:col-span-2">
            <label
              for="npub"
              class="block text-sm font-semibold leading-6 text-gray-900 dark:text-white"
              >{{ t("npub") }}</label
            >
            <div class="mt-2.5">
              <input
                type="text"
                name="npub"
                v-model="npub"
                autocomplete="npub"
                class="block w-full px-3.5 py-2 shadow-sm sm:text-sm sm:leading-6 farm-input"
              />
            </div>
          </div>

          <div class="sm:col-span-2">
            <label
              for="message"
              class="block text-sm font-semibold leading-6 text-gray-900 dark:text-white"
              >{{ t("message") }}</label
            >
            <div class="mt-2.5">
              <textarea
                name="message"
                v-model="message"
                rows="4"
                class="block w-full px-3.5 py-2 shadow-sm sm:text-sm sm:leading-6 farm-input"
              />
            </div>
          </div>
        </div>

        <div class="mt-10">
          <button
            @click="sendForm()"
            :disabled="isSubmitting"
            class="block w-full px-3.5 py-2.5 text-center text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed farm-button-primary"
          >
            {{ isSubmitting ? "Sending..." : t("letsTalk") }}
          </button>
        </div>
      </div>

      <aside class="lg:col-span-2">
        <div class="farm-panel p-6 lg:sticky lg:top-24">
          <p
            class="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400"
          >
            Contact Details
          </p>
          <div class="mt-4 space-y-3">
            <p
              v-for="(line, index) in formattedContactLines"
              :key="index"
              class="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed"
            >
              {{ line }}
            </p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

import {
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
} from "@heroicons/vue/20/solid";

const firstname = ref("");
const email = ref("");
const npub = ref("");
const message = ref("");
const warning = ref("");
const statusMessage = ref("");
const isSubmitting = ref(false);

import data from "~/config/setup";
import { bech32 } from "bech32";
import { wrapEvent } from "nostr-tools/nip17";
import { SimplePool } from "nostr-tools/pool";
import { generateSecretKey } from "nostr-tools/pure";

const contactLines = computed(() => {
  const configured = data.contactdetails || {};
  const fallback = [
    `Nostr: ${data.nostradmin || ""}`,
    `Lightning: ${data.lightningaddress || ""}`,
    `Profile: ${data.socialnavigation?.nostr || ""}`,
  ];

  return [configured.line1, configured.line2, configured.line3]
    .map((line, index) => line || fallback[index])
    .filter(Boolean)
    .slice(0, 3);
});

const cropNpub = (value) => {
  if (!value.startsWith("npub1") || value.length <= 28) return value;
  return `${value.slice(0, 14)}...${value.slice(-10)}`;
};

const formattedContactLines = computed(() => {
  return contactLines.value.map((line) => {
    if (!line.toLowerCase().startsWith("nostr:")) return line;
    const value = line.split(":").slice(1).join(":").trim();
    return `Nostr: ${cropNpub(value)}`;
  });
});

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

const buildMessage = () => {
  return [
    `name: ${firstname.value || ""}`,
    `email: ${email.value || ""}`,
    `sender npub: ${npub.value || ""}`,
    `message: ${message.value || ""}`,
  ].join("\n");
};

const sendNostrDm = async (payload) => {
  const inboxRelays = (data.nostrInboxRelays || []).filter(Boolean);
  if (!inboxRelays.length) {
    throw new Error("No inbox relays configured for NIP-17 DM.");
  }

  const recipientHex = npubToHex(data.nostradmin);

  const senderSecretKey = generateSecretKey();
  const wrappedEvent = wrapEvent(
    senderSecretKey,
    { publicKey: recipientHex, relayUrl: inboxRelays[0] },
    payload,
    "Cypher Contact",
  );

  const pool = new SimplePool();
  try {
    await Promise.any(pool.publish(inboxRelays, wrappedEvent));
    return true;
  } catch {
    throw new Error("Unable to publish NIP-17 DM to inbox relays.");
  } finally {
    pool.close(inboxRelays);
  }
};

const sendWebhook = async (payload) => {
  const response = await fetch(data.orderwebhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "The Contact Bot",
      avatar_url: "https://i.imgur.com/zI4lCCJ.jpeg",
      content: payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`Webhook HTTP error: ${response.status}`);
  }
};

async function sendForm() {
  warning.value = "";
  statusMessage.value = "";

  const emailValue = email.value.trim();
  const messageValue = message.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (messageValue === "" || emailValue === "") {
    window.scrollTo(0, 0);
    warning.value = "error";
    if (emailValue === "") {
      statusMessage.value = "Email is required.";
    } else if (messageValue === "") {
      statusMessage.value = t("line2");
    }
    return;
  }

  if (!emailPattern.test(emailValue)) {
    window.scrollTo(0, 0);
    warning.value = "error";
    statusMessage.value = "Please enter a valid email address.";
    return;
  }

  isSubmitting.value = true;
  const payload = buildMessage();
  let dmSent = false;
  let webhookSent = false;
  let dmError = null;
  let webhookError = null;

  try {
    await sendNostrDm(payload);
    dmSent = true;
  } catch (error) {
    dmError = error;
    console.error("NIP-17 DM send failed", error);
  }

  try {
    await sendWebhook(payload);
    webhookSent = true;
  } catch (error) {
    webhookError = error;
    console.error("Webhook fallback failed", error);
  }

  try {
    if (dmSent) {
      warning.value = "success";
      statusMessage.value = "Message sent over Nostr DM.";
      window.scrollTo(0, 0);
      return;
    }

    if (webhookSent) {
      warning.value = "success";
      statusMessage.value =
        "DM failed, but your message was delivered via backup webhook.";
      window.scrollTo(0, 0);
      return;
    }

    const primaryError = dmError || webhookError;
    throw primaryError instanceof Error
      ? primaryError
      : new Error("Failed to send message.");
  } catch (error) {
    console.error("Contact send failed", error);
    warning.value = "error";
    statusMessage.value =
      error instanceof Error ? error.message : "Failed to send message.";
    window.scrollTo(0, 0);
  } finally {
    isSubmitting.value = false;
  }
}

const { t } = useI18n({ useScope: "local" });
</script>
<i18n lang="json">
{
  "da": {
    "title": "Kontaktformular",
    "subtitle": "Vælg hvilke oplysninger du vil tilføje",
    "firstname": "Fornavn",
    "lastname": "Efternavn",
    "company": "Virksomhed",
    "email": "E-mail",
    "message": "Besked",
    "npub": "Npub",
    "consent": "Ved at vælge dette accepterer du vores",
    "letsTalk": "Lad os tale",
    "termsOfService": "Servicevilkår",
    "line1": "Noget gik galt 🤯",
    "line2": "Det ser ud til, at din besked er tom...",
    "line3": "Tak for din henvendelse!",
    "line4": "Din besked blev succesfuldt sendt til ejeren",
    "line5": "Du skal acceptere servicevilkårene"
  },
  "de": {
    "title": "Kontaktformular",
    "subtitle": "Wählen Sie aus, welche Informationen Sie hinzufügen möchten",
    "firstname": "Vorname",
    "lastname": "Nachname",
    "company": "Unternehmen",
    "email": "E-Mail",
    "message": "Nachricht",
    "npub": "Npub",
    "consent": "Durch Auswahl dieser Option stimmen Sie unseren zu",
    "letsTalk": "Lass uns reden",
    "termsOfService": "Nutzungsbedingungen",
    "line1": "Etwas ist schief gelaufen 🤯",
    "line2": "Es scheint, als wäre Ihre Nachricht leer...",
    "line3": "Danke, dass Sie uns erreicht haben!",
    "line4": "Ihre Nachricht wurde erfolgreich an den Eigentümer übermittelt",
    "line5": "Sie müssen den Nutzungsbedingungen zustimmen"
  },
  "en": {
    "title": "Contact Form",
    "subtitle": "Email and message are required",
    "firstname": "Name",
    "lastname": "Last Name",
    "company": "Company",
    "email": "E-mail",
    "message": "Message",
    "npub": "Npub (optional)",
    "consent": "By selecting this, you agree to our",
    "letsTalk": "Let's talk",
    "termsOfService": "Terms of service: GFY",
    "line1": "Something Went Wrong 🤯",
    "line2": "Looks like your Message is empty...",
    "line3": "Thanks for reaching out!",
    "line4": "Your message was successfully delivered to the owner",
    "line5": "You have to agree with the terms of service"
  },
  "es": {
    "title": "Formulario de Contacto",
    "subtitle": "Elija la información que desea agregar",
    "firstname": "Nombre",
    "lastname": "Apellido",
    "company": "Empresa",
    "email": "Correo Electrónico",
    "message": "Mensaje",
    "npub": "Npub",
    "consent": "Al seleccionar esto, usted acepta nuestros",
    "letsTalk": "Hablemos",
    "termsOfService": "Términos de servicio",
    "line1": "Algo salió mal 🤯",
    "line2": "Parece que tu mensaje está vacío...",
    "line3": "¡Gracias por contactarnos!",
    "line4": "Tu mensaje fue entregado exitosamente al dueño",
    "line5": "Debes aceptar los términos del servicio"
  },
  "fr": {
    "title": "Formulaire de Contact",
    "subtitle": "Choisissez les informations que vous souhaitez ajouter",
    "firstname": "Prénom",
    "lastname": "Nom de famille",
    "company": "Société",
    "email": "E-mail",
    "message": "Message",
    "npub": "Npub",
    "consent": "En sélectionnant ceci, vous acceptez nos",
    "letsTalk": "Parlons-en",
    "termsOfService": "Conditions d'utilisation",
    "line1": "Quelque chose a mal tourné 🤯",
    "line2": "Il semble que votre message soit vide...",
    "line3": "Merci de nous avoir contactés !",
    "line4": "Votre message a été transmis avec succès au propriétaire",
    "line5": "Vous devez accepter les conditions d'utilisation"
  },
  "nl": {
    "title": "Contactformulier",
    "subtitle": "Kies welke informatie u wilt toevoegen",
    "firstname": "Voornaam",
    "lastname": "Achternaam",
    "company": "Bedrijf",
    "email": "E-mail",
    "message": "Bericht",
    "npub": "Npub",
    "consent": "Door dit te selecteren gaat u akkoord met onze",
    "letsTalk": "Laten we praten",
    "termsOfService": "Servicevoorwaarden",
    "line1": "Er is iets misgegaan 🤯",
    "line2": "Het lijkt erop dat uw bericht leeg is...",
    "line3": "Bedankt voor uw bericht!",
    "line4": "Uw bericht is succesvol afgeleverd aan de eigenaar",
    "line5": "U moet akkoord gaan met de servicevoorwaarden"
  },
  "pt": {
    "title": "Formulário de Contato",
    "subtitle": "Escolha quais informações você quer adicionar",
    "firstname": "Primeiro Nome",
    "lastname": "Último Nome",
    "company": "Empresa",
    "email": "E-mail",
    "message": "Mensagem",
    "npub": "Npub",
    "consent": "Ao selecionar esta opção, você concorda com nossos",
    "letsTalk": "Vamos conversar",
    "termsOfService": "Termos de serviço",
    "line1": "Algo deu errado 🤯",
    "line2": "Parece que sua mensagem está vazia...",
    "line3": "Obrigado por entrar em contato!",
    "line4": "Sua mensagem foi entregue com sucesso ao proprietário",
    "line5": "Você deve concordar com os termos de serviço"
  }
}
</i18n>
