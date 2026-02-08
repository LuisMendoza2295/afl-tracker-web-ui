<template>
  <div class="flex items-center space-x-3">
    <Avatar v-if="user?.picture" :image="user.picture" shape="circle" class="border-2 border-white" />
    <Avatar v-else :label="user?.name?.charAt(0).toUpperCase()" shape="circle" class="border-2 border-white" />
    <div class="hidden md:block">
      <p class="text-sm font-medium">{{ user?.name }}</p>
    </div>
    <Button @click="handleLogout" icon="pi pi-sign-out" severity="secondary" text rounded v-tooltip.bottom="'Logout'" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const handleLogout = () => {
  authStore.logout();
};
</script>
