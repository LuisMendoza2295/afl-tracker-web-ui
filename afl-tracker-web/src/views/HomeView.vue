<template>
  <div class="flex flex-col h-full">
    <div class="container mx-auto px-4 py-4 md:py-8 flex flex-col h-full relative">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-0 mb-2">AFL Tracker Map</h1>
        <p class="text-surface-600 dark:text-surface-400">View all uploaded images on the map.</p>
      </div>

      <!-- Error State -->
      <Message v-if="error" severity="error" class="mb-4 flex-shrink-0">
        Error loading images: {{ error.message }}
      </Message>

      <!-- Map -->
      <div v-else class="bg-teal-500 rounded-md shadow-md p-1 md:p- relative h-[65vh] w-full">
        <MapView :images="images" :loading="isLoading" class="w-full h-full rounded-md overflow-hidden" />
      </div>

      <!-- Upload Button for authenticated users -->
      <div v-if="isAuthenticated" class="mt-4 flex-shrink-0">
        <Button label="Upload New Image" icon="pi pi-upload mr-3" class="w-full !border-none !py-3 md:!py-4"
          severity="primary" size="large" @click="router.push('/upload')">
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Message from 'primevue/message';
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
