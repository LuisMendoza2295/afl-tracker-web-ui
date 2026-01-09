<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import api from './services/tracker-api'

  const title = import.meta.env.VITE_APP_TITLE || '';
  const items = ref<Array<string>>([]);
  const isLoading = ref<boolean>(true);
  const error = ref<Error | null>(null);

  onMounted(async () => {
    try {
      items.value = await api.getTrackerData();
      console.log('API status fetched successfully', items.value);
    } catch (err) {
      error.value = err as Error;
      console.error('Error fetching API status:', err);
    } finally {
      isLoading.value = false;
    }
  });
</script>

<template>
  <h1>{{ title }}</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>

  <p v-if="isLoading">Loading data...</p>
  <p v-else-if="error">Error loading data: {{ error.message }}</p>
  <div v-else>
    <div v-for="(item, index) in items" :key="index">
      <img :src="item" alt="Tracker item">
    </div>
  </div>
</template>

<style scoped></style>
