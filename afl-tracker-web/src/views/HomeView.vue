<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">AFL Tracker Map</h1>
        <p class="text-gray-600">View all uploaded images on the map</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-96">
        <ProgressSpinner />
      </div>

      <!-- Error State -->
      <Message v-else-if="error" severity="error" class="mb-4">
        Error loading images: {{ error.message }}
      </Message>

      <!-- Map -->
      <div v-else class="bg-white rounded-lg shadow-lg p-4">
        <MapView :images="images" />
      </div>

      <!-- Upload FAB for authenticated users -->
      <Button v-if="isAuthenticated" icon="pi pi-plus" rounded class="fixed bottom-8 right-8 shadow-lg" size="large"
        @click="router.push('/upload')" v-tooltip.left="'Upload Image'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import MapView from '@/components/MapView.vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/tracker-api';
import type { ImageData } from '@/types';

const router = useRouter();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const images = ref<ImageData[]>([]);
const isLoading = ref(true);
const error = ref<Error | null>(null);

onMounted(async () => {
  try {
    images.value = await api.getTrackerData();
  } catch (err) {
    error.value = err as Error;
    console.error('Error fetching images:', err);
  } finally {
    isLoading.value = false;
  }
});
</script>
