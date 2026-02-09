<template>
  <button @click="toggleTheme"
    class="p-2 rounded-lg transition-colors hover:bg-surface-900/10 focus:outline-none focus:ring-2 focus:ring-surface-900/20"
    :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'" aria-label="Toggle theme">
    <i :class="['pi text-xl', isDark ? 'pi-sun' : 'pi-moon']"></i>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  updateTheme();
};

const updateTheme = () => {
  const html = document.documentElement;
  if (isDark.value) {
    html.classList.add('my-app-dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('my-app-dark');
    localStorage.setItem('theme', 'light');
  }
};

onMounted(() => {
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
  } else {
    isDark.value = false;
  }
  updateTheme();
});
</script>
