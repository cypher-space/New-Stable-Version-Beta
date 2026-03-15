export default defineNuxtPlugin(() => {
  const { warmCoreData, warmHeavyData, warmRouteData } = useNostrBootstrap();
  const router = useRouter();

  void warmCoreData();

  if (import.meta.client && "requestIdleCallback" in window) {
    window.requestIdleCallback(() => {
      void warmHeavyData();
    });
  } else {
    setTimeout(() => {
      void warmHeavyData();
    }, 1200);
  }

  router.afterEach((to) => {
    void warmRouteData(to.path);
  });
});
