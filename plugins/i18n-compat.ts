export default defineNuxtPlugin((nuxtApp) => {
  const localePath = useLocalePath();
  const localeRoute = useLocaleRoute();
  const switchLocalePath = useSwitchLocalePath();

  nuxtApp.vueApp.config.globalProperties.localePath = localePath;
  nuxtApp.vueApp.config.globalProperties.localeRoute = localeRoute;
  nuxtApp.vueApp.config.globalProperties.switchLocalePath = switchLocalePath;
});
