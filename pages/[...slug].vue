<template>
  <main>
    <ContentRenderer v-if="page" :value="page" />
    <SettingsError v-else />
  </main>
</template>

<script setup>
const route = useRoute();
const routePath = computed(() => {
  const raw = route.params.slug;
  if (!raw || (Array.isArray(raw) && raw.length === 0)) {
    return "/";
  }

  return Array.isArray(raw) ? `/${raw.join("/")}` : `/${raw}`;
});

const { data: page } = await useAsyncData(
  () => `content-${routePath.value}`,
  () => queryCollection("content").path(routePath.value).first(),
);
</script>
