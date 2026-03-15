// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/content",
    "@nuxtjs/i18n",
    "@nuxtjs/color-mode",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
  ],

  css: ["@/assets/css/main.css"],

  components: {
    global: true,
    dirs: ["~/components"],
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => tag === "lightning-donate",
    },
  },

  i18n: {
    // baseUrl: process.env.BASE_URL || "http://localhost:3000",
    defaultLocale: "en",
    detectBrowserLanguage: false,
    locales: [
      {
        code: "da",
        language: "da-DA",
        name: "Dansk",
        file: "da-DA.json",
      },
      {
        code: "de",
        language: "de-DE",
        name: "Deutsch",
        file: "de-DE.json",
      },
      {
        code: "en",
        language: "en-GB",
        name: "English",
        file: "en-GB.json",
      },
      {
        code: "es",
        language: "es-ES",
        name: "Español",
        file: "es-ES.json",
      },
      {
        code: "fr",
        language: "fr-FR",
        name: "Français",
        file: "fr-FR.json",
      },
      {
        code: "pt",
        language: "pt-PT",
        name: "Português",
        file: "pt-PT.json",
      },
      {
        code: "nl",
        language: "nl-NL",
        name: "Nederlands",
        file: "nl-NL.json",
      },
    ],
    langDir: "../locales",
  },

  colorMode: {
    preference: "system", // default value of $colorMode.preference
    fallback: "dark", // fallback value if no system preference found
    classSuffix: "", // This removed the classSuffix provided by Color Mode / Tailwind Darkmode Hookup
  },

  devtools: { enabled: true },
  experimental: {
    appManifest: false,
  },
  compatibilityDate: "2024-08-01",
});
