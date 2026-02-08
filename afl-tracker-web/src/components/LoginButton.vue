<template>
  <Button @click="handleLogin" icon="pi pi-google" label="Sign in with Google" class="p-button-outlined"
    severity="secondary" />
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const handleLogin = () => {
  authStore.login();
};
</script>
