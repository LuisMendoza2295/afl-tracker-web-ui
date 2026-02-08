import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';

// Import CSS
import 'leaflet/dist/leaflet.css';
import 'primeicons/primeicons.css';
import './assets/main.css';


const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  unstyled: false  // Use default PrimeVue styling
});
app.use(ToastService);
app.directive('tooltip', Tooltip);

// Initialize auth store
const authStore = useAuthStore();
authStore.init();

app.mount('#app');
