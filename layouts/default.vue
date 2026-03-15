<template>
  <div class="bg-colorBgLight dark:bg-colorBgDark farm-grain-bg min-h-screen">
    <Maintenance v-if="data.maintenancemode" />
    <!-- <AdminSetup v-if="!data.initsetup" /> -->
    <Header />

    <main class="min-h-screen py-6 bg-transparent pt-18 dark:text-white">
      <slot />
    </main>
    <Footer />
  </div>
</template>
<script setup>
import data from "~/config/setup";
</script>
