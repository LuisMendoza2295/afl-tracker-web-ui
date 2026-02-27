<template>
  <div class="flex items-center space-x-3">
    <Avatar v-if="user?.picture" :image="user.picture" shape="circle" class="!w-12 !h-12" />
    <Avatar v-else :label="user?.name?.charAt(0).toUpperCase()" shape="circle" class="!w-12 !h-12" />
    <div class="hidden md:block">
      <p class="text-sm font-medium">{{ user?.name }}</p>
    </div>
    <div class="flex items-center">
      <Button @click="handleLogout" label="Logout" icon="pi pi-sign-out" severity="danger"
        class="px-4 py-2 h-12 md:px-0 md:w-24">
      </Button>
    </div>
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
