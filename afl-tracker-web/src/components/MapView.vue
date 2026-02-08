<template>
  <div class="map-container">
    <div ref="mapContainer" class="map h-full w-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import L from 'leaflet';
import type { ImageData } from '@/types';

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
}

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  center: () => [-37.8136, 144.9631], // Melbourne, Australia (AFL city!)
  zoom: 12,
});

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
const markers: L.Marker[] = [];

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

watch(() => props.images, () => {
  addMarkers();
}, { deep: true });

function addMarkers() {
  if (!map) {
    console.debug('MapView: Map not initialized yet');
    return;
  }

  console.log('MapView: Adding markers for', props.images.length, 'images');

  // Clear existing markers
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

    const marker = L.marker([lat, lng])
      .addTo(map);

    // Create popup with image thumbnail
    const popupContent = `
      <div class="text-center">
        <img 
          src="${image.url}" 
          alt="Uploaded image" 
          class="w-32 h-32 object-cover rounded mb-2"
        />
        <p class="text-sm font-medium">${image.uploadedByName}</p>
        <p class="text-xs text-gray-500">${new Date(image.uploadedAt).toLocaleDateString()}</p>
      </div>
    `;
    marker.bindPopup(popupContent);

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
  min-height: 500px;
}

.map {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  z-index: 1;
  /* Ensure map is above standard flow but respecting overlays */
}
</style>
