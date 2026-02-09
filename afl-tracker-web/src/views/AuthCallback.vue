<template>
  <div class="min-h-screen h-full flex items-center justify-center">
    <Card class="max-w-md">
      <template #content>
        <div class="text-center py-8">
          <ProgressSpinner v-if="isProcessing" />
          <div v-else-if="error">
            <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p class="text-lg font-medium secondary mb-2">Authentication Failed</p>
            <p class="text-gray-600 mb-4">{{ error }}</p>
            <Button label="Return Home" @click="router.push('/')" />
          </div>
          <div v-else>
            <i class="pi pi-check-circle text-4xl mb-4"></i>
            <p class="text-lg font-medium secondary mb-2">Authentication successful!</p>
            <p class="text-gray-600">Redirecting...</p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isProcessing = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const hash = window.location.hash;

    if (!hash) {
      throw new Error('No authentication data received');
    }

    await authStore.handleCallback(hash);

    // Redirect to home page after successful authentication
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Authentication failed';
  } finally {
    isProcessing.value = false;
  }
});
</script>
