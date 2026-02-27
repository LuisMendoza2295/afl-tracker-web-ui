<template>
  <div class="text-center min-w-[150px]">
    <!-- preview enables the PrimeVue fullscreen lightbox on click -->
    <Image :src="image.url" alt="Uploaded image" class="w-full cursor-zoom-in"
      imageClass="h-32 w-full object-cover rounded mb-2" preview />
    <div class="flex items-center justify-center gap-2 mb-1">
      <img v-if="image.uploadedByPhotoUrl" :src="image.uploadedByPhotoUrl"
        class="w-6 h-6 rounded-full object-cover border border-gray-200" :alt="image.uploadedByName" />
      <span class="text-sm font-medium truncate max-w-[120px]">{{ image.uploadedByName }}</span>
    </div>
    <p class="text-xs text-gray-500">{{ formattedDate }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Image from 'primevue/image';
import type { ImageData } from '@/types';

interface Props {
  image: ImageData;
}

const props = defineProps<Props>();

const formattedDate = computed(() =>
  new Date(props.image.uploadedAt).toLocaleDateString()
);
</script>
