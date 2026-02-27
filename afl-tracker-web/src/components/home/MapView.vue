<template>
  <div class="map-container relative">
    <div ref="mapContainer" class="map h-full w-full"></div>

    <!-- Loading Overlay -->
    <div v-if="loading"
      class="absolute inset-0 z-[1000] bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import MyPreset from '@/config/primevue-preset';
import L from 'leaflet';
import ProgressSpinner from 'primevue/progressspinner';
import { DEFAULT_MAP_CENTER, DEFAULT_ZOOM_LEVEL } from '@/config/map';
import type { ImageData } from '@/types';
import ImageMarkerPopup from './ImageMarkerPopup.vue';

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  images?: ImageData[];
  center?: [number, number];
  zoom?: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  center: () => DEFAULT_MAP_CENTER,
  zoom: DEFAULT_ZOOM_LEVEL,
  loading: false,
});

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
const markers: L.Marker[] = [];
// Track mounted Vue app instances so we can unmount them when markers are cleared
const popupApps: ReturnType<typeof createApp>[] = [];

onMounted(() => {
  if (!mapContainer.value) return;

  // Initialize map
  map = L.map(mapContainer.value).setView(props.center, props.zoom);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  // Add markers for images
  addMarkers();
});

onUnmounted(() => {
  // Clean up all mounted popup Vue app instances
  popupApps.forEach(app => app.unmount());
  popupApps.length = 0;
});

watch(() => props.images, () => {
  addMarkers();
}, { deep: true });

function addMarkers() {
  if (!map) {
    console.debug('MapView: Map not initialized yet');
    return;
  }

  console.log('MapView: Adding markers for', props.images.length, 'images');

  // Unmount existing popup Vue apps and clear markers
  popupApps.forEach(app => app.unmount());
  popupApps.length = 0;
  markers.forEach(marker => marker.remove());
  markers.length = 0;

  // Add new markers
  props.images.forEach(image => {
    const lat = parseFloat(String(image.latitude));
    const lng = parseFloat(String(image.longitude));

    if (isNaN(lat) || isNaN(lng) || !map) {
      console.warn('Skipping image due to invalid coordinates:', image);
      return;
    }

    const marker = L.marker([lat, lng]).addTo(map);

    // Mount ImageMarkerPopup as a live Vue component into a real DOM node.
    // This is required for PrimeVue Image's preview/lightbox to work correctly
    // since it registers reactive click handlers and teleports the overlay to <body>.
    const popupEl = document.createElement('div');
    const popupApp = createApp(ImageMarkerPopup, { image });
    popupApp.use(PrimeVue, { theme: { preset: MyPreset, options: { darkModeSelector: '.my-app-dark' } } });
    popupApp.mount(popupEl);

    marker.bindPopup(popupEl);
    popupApps.push(popupApp);
    markers.push(marker);
  });

  // Fit map to markers if there are any
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });
  }
}
</script>


<style scoped>
.map-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-height: 400px;
  /* Default minimum height for mobile */
}

@media (min-width: 768px) {
  .map-container {
    min-height: 500px;
  }
}

.map {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  z-index: 1;
  /* Ensure map is above standard flow but respecting overlays */
}
</style>
