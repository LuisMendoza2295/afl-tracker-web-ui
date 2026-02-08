<template>
  <div class="max-w-2xl mx-auto">
    <Card>
      <template #title>
        <div class="flex items-center space-x-2">
          <i class="pi pi-upload text-blue-600"></i>
          <span>Upload Image</span>
        </div>
      </template>
      <template #content>
        <!-- Not authenticated message -->
        <div v-if="!isAuthenticated" class="text-center py-8">
          <i class="pi pi-lock text-4xl text-gray-400 mb-4"></i>
          <p class="text-lg font-medium text-gray-700 mb-2">Authentication Required</p>
          <p class="text-gray-600 mb-4">Please sign in to upload images</p>
          <LoginButton />
        </div>

        <!-- Upload form -->
        <div v-else class="space-y-6">
          <!-- Step 1: File Selection -->
          <div v-if="!selectedFile" class="text-center py-8">
            <FileUpload mode="basic" accept="image/*" :maxFileSize="4000000" customUpload @select="handleFileSelect"
              :auto="true" chooseLabel="Select Image" class="w-full" />
            <p class="text-sm text-gray-500 mt-2">Max file size: 4MB</p>
          </div>

          <!-- Step 2: Image Preview & Location -->
          <div v-else-if="!locationConfirmed">
            <div class="space-y-4">
              <!-- Image Preview -->
              <div class="relative">
                <img :src="imagePreview" alt="Preview" class="w-full h-64 object-cover rounded-lg" />
                <Button icon="pi pi-times" rounded text severity="danger" class="absolute top-2 right-2 bg-white"
                  @click="resetUpload" />
              </div>

              <!-- Info Message -->
              <Message severity="info">
                <div class="flex items-start space-x-2">
                  <i class="pi pi-info-circle mt-0.5"></i>
                  <div class="text-sm">
                    Select the location where this image was taken by placing the marker on the map below.
                  </div>
                </div>
              </Message>

              <!-- Location Picker -->
              <LocationPicker :initialLocation="defaultLocation" @confirm="handleLocationConfirm"
                @cancel="resetUpload" />
            </div>
          </div>

          <!-- Step 3: Upload -->
          <div v-else class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <i class="pi pi-check-circle text-green-600 text-xl mt-0.5"></i>
                <div>
                  <p class="font-medium text-green-900">Ready to upload</p>
                  <p class="text-sm text-green-700">Image and location confirmed</p>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <Button label="Start Over" severity="secondary" text @click="resetUpload" />
              <Button label="Upload" icon="pi pi-cloud-upload" :loading="uploading" @click="handleUpload" />
            </div>
          </div>

          <!-- Upload Status -->
          <Message v-if="uploadStatus" :severity="uploadStatus.type">
            {{ uploadStatus.message }}
          </Message>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload';
import Message from 'primevue/message';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';
import LocationPicker from './LocationPicker.vue';
import LoginButton from './LoginButton.vue';
import api from '@/services/tracker-api';
import type { Location } from '@/types';

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const isAuthenticated = computed(() => authStore.isAuthenticated);

// Default location (Melbourne, Australia - AFL city!)
const defaultLocation: Location = {
  latitude: -37.8136,
  longitude: 144.9631,
};

const selectedFile = ref<File | null>(null);
const imagePreview = ref<string>('');
const locationConfirmed = ref(false);
const confirmedLocation = ref<Location | null>(null);
const uploading = ref(false);
const uploadStatus = ref<{ type: 'success' | 'error'; message: string } | null>(null);

const handleFileSelect = (event: FileUploadSelectEvent) => {
  const file = event.files[0];
  if (file) {
    selectedFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const handleLocationConfirm = (location: Location) => {
  confirmedLocation.value = location;
  locationConfirmed.value = true;
};

const handleUpload = async () => {
  if (!selectedFile.value || !confirmedLocation.value) {
    return;
  }

  uploading.value = true;
  uploadStatus.value = null;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);

    await api.uploadImage(formData, confirmedLocation.value);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Image uploaded successfully!',
      life: 3000,
    });

    // Redirect to home page to see the new marker
    setTimeout(() => {
      router.push('/');
    }, 1000);
  } catch (error) {
    console.error('Upload error:', error);
    uploadStatus.value = {
      type: 'error',
      message: 'Failed to upload image. Please try again.',
    };
    uploading.value = false;
  }
};

const resetUpload = () => {
  selectedFile.value = null;
  imagePreview.value = '';
  locationConfirmed.value = false;
  confirmedLocation.value = null;
  uploading.value = false;
  uploadStatus.value = null;
};
</script>
