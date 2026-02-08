<template>
  <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo/Title -->
        <div class="flex items-center space-x-3">
          <i class="pi pi-map-marker text-2xl"></i>
          <h1 class="text-xl font-bold">AFL Tracker</h1>
        </div>

        <!-- Navigation Links -->
        <div class="flex items-center space-x-6">
          <RouterLink to="/" class="hover:text-blue-200 transition-colors flex items-center space-x-1">
            <i class="pi pi-map"></i>
            <span>Map</span>
          </RouterLink>

          <RouterLink v-if="isAuthenticated" to="/upload"
            class="hover:text-blue-200 transition-colors flex items-center space-x-1">
            <i class="pi pi-upload"></i>
            <span>Upload</span>
          </RouterLink>

          <!-- Auth Section -->
          <div v-if="isAuthenticated" class="flex items-center space-x-3">
            <UserProfile />
          </div>
          <div v-else>
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import LoginButton from './LoginButton.vue';
import UserProfile from './UserProfile.vue';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>
