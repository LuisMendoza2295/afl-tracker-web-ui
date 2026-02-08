<template>
  <Card class="location-picker-card">
    <template #title>
      <div class="flex items-center justify-between">
        <span>Confirm Upload Location</span>
        <i class="pi pi-map-marker text-blue-600"></i>
      </div>
    </template>
    <template #content>
      <div class="space-y-4">
        <!-- Map -->
        <div ref="mapContainer" class="map-small"></div>

        <!-- Location Info -->
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="flex items-start space-x-2">
            <i class="pi pi-info-circle text-blue-600 mt-1"></i>
            <div class="text-sm">
              <p class="font-medium">Location Details</p>
              <p class="text-gray-600">
                Latitude: {{ selectedLocation.latitude.toFixed(6) }}<br>
                Longitude: {{ selectedLocation.longitude.toFixed(6) }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Drag the marker to adjust the location
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <Button label="Cancel" severity="secondary" text @click="emit('cancel')" />
          <Button label="Confirm Location" icon="pi pi-check" @click="confirmLocation" />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import L from 'leaflet';
import Card from 'primevue/card';
import Button from 'primevue/button';
import type { Location } from '@/types';

interface Props {
  initialLocation: Location;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  confirm: [location: Location];
  cancel: [];
}>();

const mapContainer = ref<HTMLElement | null>(null);
const selectedLocation = ref<Location>({ ...props.initialLocation });
let map: L.Map | null = null;
let marker: L.Marker | null = null;

onMounted(() => {
  if (!mapContainer.value) return;

  // Initialize map
  map = L.map(mapContainer.value).setView(
    [props.initialLocation.latitude, props.initialLocation.longitude],
    15
  );

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  // Add draggable marker
  marker = L.marker(
    [props.initialLocation.latitude, props.initialLocation.longitude],
    { draggable: true }
  ).addTo(map);

  // Update location when marker is dragged
  marker.on('dragend', () => {
    if (!marker) return;
    const pos = marker.getLatLng();
    selectedLocation.value = {
      latitude: pos.lat,
      longitude: pos.lng,
    };
  });
});

watch(() => props.initialLocation, (newLocation) => {
  selectedLocation.value = { ...newLocation };
  if (map && marker) {
    map.setView([newLocation.latitude, newLocation.longitude], 15);
    marker.setLatLng([newLocation.latitude, newLocation.longitude]);
  }
}, { deep: true });

const confirmLocation = () => {
  emit('confirm', selectedLocation.value);
};
</script>

<style scoped>
.location-picker-card {
  max-width: 600px;
  margin: 0 auto;
}

.map-small {
  height: 300px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}
</style>
