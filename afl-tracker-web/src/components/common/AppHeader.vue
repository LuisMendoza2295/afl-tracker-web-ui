<template>
  <header class="bg-primary-500 text-surface-900 shadow-lg sticky top-0 z-50">
    <nav class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- Logo/Title -->
        <RouterLink to="/" class="flex items-center hover:opacity-90 transition-opacity">
          <img :src="logo" alt="AFL Tracker" class="h-14 w-auto" />
        </RouterLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-6">
          <RouterLink to="/" class="hover:text-surface-700 transition-colors flex items-center space-x-1"
            active-class="text-black font-medium">
            <i class="pi pi-map"></i>
            <span>Map</span>
          </RouterLink>

          <RouterLink v-if="isAuthenticated" to="/upload"
            class="hover:text-surface-700 transition-colors flex items-center space-x-1"
            active-class="text-black font-medium">
            <i class="pi pi-upload"></i>
            <span>Upload</span>
          </RouterLink>

          <ThemeToggle />

          <!-- Auth Section -->
          <div v-if="isAuthenticated" class="flex items-center space-x-3 ml-4 border-l border-surface-900/20 pl-4">
            <UserProfile />
          </div>
          <div v-else>
            <LoginButton />
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button class="md:hidden p-2 rounded-lg hover:bg-surface-900/10 transition-colors focus:outline-none"
          @click="isMenuOpen = !isMenuOpen" aria-label="Toggle menu">
          <i :class="['pi text-xl', isMenuOpen ? 'pi-times' : 'pi-bars']"></i>
        </button>
      </div>

      <!-- Mobile Navigation Menu -->
      <div v-show="isMenuOpen"
        class="md:hidden mt-4 pb-4 space-y-4 border-t border-surface-900/20 pt-4 animate-in fade-in slide-in-from-top-4 duration-200">
        <RouterLink to="/"
          class="px-4 py-2 hover:bg-surface-900/10 rounded-lg transition-colors flex items-center space-x-3"
          active-class="bg-surface-900/10 font-medium" @click="isMenuOpen = false">
          <i class="pi pi-map"></i>
          <span>Map</span>
        </RouterLink>

        <RouterLink v-if="isAuthenticated" to="/upload"
          class="px-4 py-2 hover:bg-surface-900/10 rounded-lg transition-colors flex items-center space-x-3"
          active-class="bg-surface-900/10 font-medium" @click="isMenuOpen = false">
          <i class="pi pi-upload"></i>
          <span>Upload</span>
        </RouterLink>

        <div class="pt-2 border-t border-surface-900/20 px-2">
          <div class="flex justify-end mb-2">
            <ThemeToggle />
          </div>
          <div v-if="isAuthenticated" class="flex justify-between items-center py-2">
            <UserProfile />
          </div>
          <div v-else class="py-2">
            <div class="w-full flex justify-center">
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import LoginButton from './LoginButton.vue';
import UserProfile from './UserProfile.vue';
import ThemeToggle from './ThemeToggle.vue';
import logo from '@/assets/logo.png';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isMenuOpen = ref(false);
</script>
