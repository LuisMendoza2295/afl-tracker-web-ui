<script setup lang="ts">
import AppHeader from './components/common/AppHeader.vue';
import Toast from 'primevue/toast';
</script>

<template>
  <div id="app" class="min-h-screen">
    <AppHeader />
    <main>
      <RouterView />
    </main>
    <Toast :breakpoints="{ '960px': '75vw', '640px': '90vw' }" />
  </div>
</template>

<style>
/* Global styles */
:root {
  --app-bg: #f9fafb;
  --app-text: #374151;
}

:root.my-app-dark {
  --app-bg: #111827;
  --app-text: #f3f4f6;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: var(--app-bg);
  color: var(--app-text);
  transition: background-color 0.2s, color 0.2s;
}

#app {
  min-height: 100vh;
}

/* Make Toast responsive globally */
.p-toast {
  max-width: 90vw !important;
}

/* On very small screens, center it better */
@media screen and (max-width: 640px) {
  .p-toast {
    width: 100% !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
  }
}
</style>
