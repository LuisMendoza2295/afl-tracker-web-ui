<template>
  <div class="min-h-screen pb-24">
    <div class="container mx-auto px-4 py-6 md:py-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-0 mb-2">Upload New Image</h1>
        <p class="text-surface-600 dark:text-surface-400">Select an image and verify the location on the map.</p>
      </div>

      <!-- Auth Check -->
      <div v-if="isAuthenticated">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <!-- Step 1: Image Selection -->
          <div class="h-full">
            <ImageSelector v-model="file" />
          </div>

          <!-- Step 2: Location Selection -->
          <div class="h-full">
            <LocationPicker v-model="location" />
          </div>
        </div>
      </div>

      <!-- Not Authenticated State -->
      <div v-else class="flex justify-center py-12">
        <Card class="max-w-md w-full">
          <template #content>
            <div class="text-center py-6">
              <i class="pi pi-lock text-4xl text-surface-400 mb-4"></i>
              <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">Authentication Required</h2>
              <p class="text-surface-600 dark:text-surface-400 mb-6">Please sign in to upload images.</p>
              <LoginButton />
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Floating Action Bar -->
    <div v-if="isAuthenticated"
      class="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-t border-surface-200 dark:border-surface-700 p-4 z-50 shadow-up-lg">
      <div class="container mx-auto flex items-center justify-between md:justify-end gap-4">
        <div class="hidden md:block text-sm text-surface-500 mr-auto">
          <span v-if="file && location"><i class="pi pi-check-circle text-green-500 mr-1"></i> Ready to upload</span>
          <span v-else><i class="pi pi-info-circle mr-1"></i> Select an image and location</span>
        </div>

        <Button label="Reset" icon="pi pi-refresh" severity="secondary" text @click="resetForm" :disabled="uploading" />
        <Button label="Upload Image" icon="pi pi-cloud-upload" :loading="uploading" :disabled="!file || uploading"
          @click="handleUpload" class="w-full md:w-auto min-w-[150px]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { Location } from '@/types';
import { DEFAULT_MAP_CENTER } from '@/config/map';
import api from '@/services/tracker-api';
import { useToast } from 'primevue/usetoast';

// Components
import Button from 'primevue/button';
import Card from 'primevue/card';

import LoginButton from '@/components/LoginButton.vue';
import ImageSelector from '@/components/ImageSelector.vue';
import LocationPicker from '@/components/LocationPicker.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const isAuthenticated = computed(() => authStore.isAuthenticated);

// State
const file = ref<File | null>(null);
const location = ref<Location>({
  latitude: DEFAULT_MAP_CENTER[0],
  longitude: DEFAULT_MAP_CENTER[1]
});
const uploading = ref(false);

const resetForm = () => {
  file.value = null;
  location.value = {
    latitude: DEFAULT_MAP_CENTER[0],
    longitude: DEFAULT_MAP_CENTER[1]
  };
};

const handleUpload = async () => {
  if (!file.value) return;

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file.value);

    await api.uploadImage(formData, location.value);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Image uploaded successfully!',
      life: 3000
    });

    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (error: any) {
    console.error('Upload failed:', error);

    const errorMessage = error.response?.data || 'Failed to upload image. Please try again.';

    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: typeof errorMessage === 'string' ? errorMessage : 'Failed to upload image. Please try again.',
      life: 5000
    });
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.shadow-up-lg {
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
