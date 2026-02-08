<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
import Toast from 'primevue/toast';
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <AppHeader />
    <main>
      <RouterView />
    </main>
    <Toast />
  </div>
</template>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

#app {
  min-height: 100vh;
}
</style>
