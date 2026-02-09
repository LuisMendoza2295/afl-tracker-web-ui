<template>
  <Card class="h-full">
    <template #title>
      <div class="flex items-center space-x-2">
        <i class="pi pi-image text-primary-500"></i>
        <span>Image</span>
      </div>
    </template>
    <template #content>
      <div class="flex flex-col h-full justify-between min-h-[300px]">
        <!-- No File Selected -->
        <div v-if="!modelValue"
          class="flex flex-col items-center justify-center flex-grow py-8 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-900 transition-colors hover:border-primary-500">
          <div class="text-center">
            <i class="pi pi-cloud-upload text-4xl text-surface-400 mb-4"></i>
            <p class="text-lg font-medium text-surface-700 dark:text-surface-200 mb-2">Select an Image</p>
            <p class="text-sm text-surface-500 mb-6">Supported formats: PNG, JPG (Max 4MB)</p>
            <div class="flex justify-center">
              <FileUpload mode="basic" accept="image/png, image/jpeg" :maxFileSize="4194304" customUpload
                @select="onFileSelect" :auto="true" chooseLabel="Choose File" class="w-auto" />
            </div>
          </div>
        </div>

        <!-- File Selected (Preview) -->
        <div v-else class="relative flex-grow flex flex-col">
          <div class="relative w-full h-64 md:h-80 bg-surface-900/5 rounded-lg overflow-hidden group">
            <img :src="previewUrl" alt="Preview" class="w-full h-full object-contain" />

            <!-- Overlay actions -->
            <div
              class="absolute inset-x-0 bottom-0 bg-black/60 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center text-white">
              <span class="truncate text-sm mr-2">{{ modelValue.name }}</span>
              <Button icon="pi pi-times" severity="danger" rounded text size="small" @click="clearFile"
                aria-label="Remove image" />
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <Button label="Change Image" icon="pi pi-refresh" severity="secondary" @click="clearFile"
              class="w-full md:w-auto" />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload';

const props = defineProps<{
  modelValue: File | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [file: File | null];
}>();

const previewUrl = ref('');

// Create preview URL when file changes
watch(() => props.modelValue, (newFile) => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }

  if (newFile) {
    previewUrl.value = URL.createObjectURL(newFile);
  }
}, { immediate: true });

// Cleanup
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});

const onFileSelect = (event: FileUploadSelectEvent) => {
  const file = event.files[0];
  if (file) {
    emit('update:modelValue', file);
  }
};

const clearFile = () => {
  emit('update:modelValue', null);
};
</script>
