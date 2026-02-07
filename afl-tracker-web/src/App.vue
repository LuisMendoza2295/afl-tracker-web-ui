<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from './services/tracker-api'

const title = import.meta.env.VITE_APP_TITLE || '';
const items = ref<Array<string>>([]);
const isLoading = ref<boolean>(true);
const error = ref<Error | null>(null);
const selectedFile = ref<File | null>(null);
const uploadStatus = ref<string>('');

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

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;
  if (file) {
    selectedFile.value = file;
    console.log('Selected file:', file.name);
  }
}

function uploadImage() {
  if (!selectedFile.value) {
    console.warn('No file selected for upload.');
    return;
  }

  uploadStatus.value = 'Uploading...';
  const formData = new FormData();
  formData.append('file', selectedFile.value);

  api.uploadImage(formData)
    .then(response => {
      console.log('Image uploaded successfully:', response);
      uploadStatus.value = 'Upload successful!';

      return api.getTrackerData();
    })
    .then(updatedItems => {
      items.value = updatedItems;
    })
    .catch(err => {
      console.error('Error uploading image:', err);
      uploadStatus.value = 'Upload failed.';
    });
}
</script>

<template>
  <h1>{{ title }}</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
  <p>Upload Image</p>
  <div>
    <input type="file" accept="image/*" @change="handleFileChange" />
    <button @click="uploadImage" :disabled="!selectedFile">Upload</button>
    <p v-if="uploadStatus">{{ uploadStatus }}</p>
  </div>

  <p v-if="isLoading">Loading data...</p>
  <p v-else-if="error">Error loading data: {{ error.message }}</p>
  <div v-else>
    <div class="image-container" v-for="(item, index) in items" :key="index">
      <img class="responsive-image" :src="item" alt="Tracker item">
    </div>
  </div>
</template>

<style scoped>
.image-container {
  width: 100%;
  /* The container dictates the maximum width */
  max-width: 150px;
  /* Optional: Sets a maximum display size */
  height: auto;
  /* Maintains aspect ratio */
}

.responsive-image {
  width: 100%;
  /* Image takes the full width of its container */
  height: auto;
  /* Automatically adjust height to maintain aspect ratio */
  display: block;
  /* Helps with layout issues */
  object-fit: contain;
  /* Optional: Scales the image to fit within the container while maintaining its aspect ratio. Use 'cover' to fill the container, potentially cropping the image. */
}
</style>
