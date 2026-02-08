import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import HomeView from '@/views/HomeView.vue';
import UploadView from '@/views/UploadView.vue';
import AuthCallback from '@/views/AuthCallback.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView,
      meta: { requiresAuth: true },
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallback,
    },
  ],
});

// Navigation guard for protected routes
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to home if not authenticated
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;
