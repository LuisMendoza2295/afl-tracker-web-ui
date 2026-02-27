<template>
  <Card class="h-full">
    <template #title>
      <div class="flex items-center space-x-2">
        <i class="pi pi-map-marker text-primary-500"></i>
        <span>Location</span>
      </div>
    </template>
    <template #content>
      <div class="flex flex-col h-full min-h-[300px]">

        <!-- Location Info -->
        <div
          class="bg-surface-50 dark:bg-surface-800 p-3 rounded-lg mb-4 border border-surface-200 dark:border-surface-700">
          <div class="flex items-start space-x-2">
            <i class="pi pi-info-circle text-primary-500 mt-1"></i>
            <div class="text-sm">
              <p class="font-medium text-surface-900 dark:text-surface-0">Selected Coordinates</p>
              <p class="text-surface-600 dark:text-surface-300 font-mono text-xs mt-1">
                Lat: {{ modelValue.latitude.toFixed(6) }}<br>
                Lng: {{ modelValue.longitude.toFixed(6) }}
              </p>
              <p class="text-xs text-surface-500 mt-2">
                Drag the marker to adjust position.
              </p>
            </div>
          </div>
        </div>

        <!-- Map -->
        <div ref="mapContainer"
          class="flex-grow w-full rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 min-h-[250px] relative z-0">
        </div>

      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import L from 'leaflet';
import Card from 'primevue/card';
import type { Location } from '@/types';

const props = defineProps<{
  modelValue: Location;
}>();

const emit = defineEmits<{
  'update:modelValue': [location: Location];
}>();

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let marker: L.Marker | null = null;

onMounted(() => {
  if (!mapContainer.value) return;

  // Initialize map
  map = L.map(mapContainer.value).setView(
    [props.modelValue.latitude, props.modelValue.longitude],
    15
  );

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  // Add draggable marker
  marker = L.marker(
    [props.modelValue.latitude, props.modelValue.longitude],
    { draggable: true }
  ).addTo(map);

  // Update location when marker is dragged
  marker.on('dragend', () => {
    if (!marker) return;
    const pos = marker.getLatLng();
    emit('update:modelValue', {
      latitude: pos.lat,
      longitude: pos.lng,
    });
  });

  // Attempt detection if this is the initial load
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { latitude, longitude };

        // Emit update
        emit('update:modelValue', newLocation);

        // Update map view
        if (map && marker) {
          map.setView([latitude, longitude], 15);
          marker.setLatLng([latitude, longitude]);
        }
      },
      (error) => {
        console.warn('Geolocation failed or denied:', error);
      }
    );
  }
});

watch(() => props.modelValue, (newLocation) => {
  if (map && marker) {
    const currentLatLng = marker.getLatLng();
    // Only update marker/map if significantly different to verify dragging didn't cause loop
    if (Math.abs(currentLatLng.lat - newLocation.latitude) > 0.000001 ||
      Math.abs(currentLatLng.lng - newLocation.longitude) > 0.000001) {
      marker.setLatLng([newLocation.latitude, newLocation.longitude]);
      map.panTo([newLocation.latitude, newLocation.longitude]);
    }
  }
}, { deep: true });
</script>
