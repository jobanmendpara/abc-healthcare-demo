<script setup lang="ts">
import { Loader } from '@googlemaps/js-api-loader';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { Geopoint } from '~/types';

const emits = defineEmits(['select']);

const loader = new Loader({
  apiKey: useRuntimeConfig().public.gmapsApiKey,
  version: 'weekly',
  libraries: ['places'],
  region: 'US',
});
const places = await loader
  .importLibrary('places')
  .then((res) => {
    return res;
  });
const autocompleteService = new places.AutocompleteService();
const geocoderService = new google.maps.Geocoder();
const localValue = ref<Geopoint | undefined>();
let predictions: google.maps.places.QueryAutocompletePrediction[] | null = [];
let geopoints: Geopoint[] = [];

async function autocomplete(event: AutoCompleteCompleteEvent) {
  geopoints = [];

  const { query } = event;
  if (!query) {
    predictions = [];
    return;
  }

  autocompleteService.getQueryPredictions({ input: query }, (results) => {
    predictions = results ?? [];
  });

  if (!predictions)
    return;

  predictions.forEach(async (prediction) => {
    const geolocation = await geocoderService.geocode({ placeId: prediction.place_id }, (results) => {
      if (results)
        return results;
    });

    geopoints.push({
      id: geolocation.results[0].place_id,
      aptNumber: '',
      formattedAddress: geolocation.results[0].formatted_address,
      latitude: geolocation.results[0].geometry.location.lat(),
      longitude: geolocation.results[0].geometry.location.lng(),
    });
  });

  return geopoints;
}
</script>

<template>
  <span class="p-float-label">
    <AutoComplete
      id="address"
      v-model="localValue"
      class="w-full"
      :class="localValue ? 'p-valid border-green-500' : 'p-invalid border-red-500'"
      input-id="address"
      :input-class="`${localValue ? 'p-valid border-green-500' : 'p-invalid border-red-500'} px-3 py-2 leading-tight shadow focus:outline-none w-full`"
      option-label="formattedAddress"
      :suggestions="geopoints"
      @complete="autocomplete"
      @item-select="(address) => $emit('select', address.value)"
    />
    <label
      class="mb-2 block text-sm font-bold"
      for="address"
    >
      Address
    </label>
  </span>
</template>

<style scoped></style>
