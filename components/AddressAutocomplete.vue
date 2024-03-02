<script setup lang="ts">
import { Loader } from '@googlemaps/js-api-loader';
import type { Geopoint } from '~/types';

const props = defineProps({
  value: {
    type: Object as PropType<Partial<Geopoint>>,
    required: true,
  },
});
const emits = defineEmits(['select']);

const {
  autocomplete,
  buttonText,
  currentValue,
  geopoints,
  reset,
  searchTerm,
  selectGeopoint,
} = await useAutocomplete();
const { isOpen } = usePopover();

function usePopover() {
  const isOpen = ref(false);

  return {
    isOpen,
  };
}

async function useAutocomplete() {
  const buttonText = ref('Select Address');
  const currentValue = ref<Partial<Geopoint> | null>(props.value);
  const searchTerm = ref('');
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
  let predictions: google.maps.places.QueryAutocompletePrediction[] | null = [];
  const geopoints = ref<Set<Geopoint>>(new Set());

  async function autocomplete(event: Event) {
    if (!event.target)
      return;

    const { value: input } = event.target as HTMLInputElement;
    geopoints.value = new Set<Geopoint>();

    if (input.length < 3) {
      predictions = [];
      return;
    }

    autocompleteService.getQueryPredictions({ input }, (results) => {
      predictions = results ?? [];
    });

    if (!predictions)
      return;

    const newGeopoints = ref(new Set<Geopoint>());
    predictions.forEach(async (prediction) => {
      const geolocation = await geocoderService.geocode({ placeId: prediction.place_id }, (results) => {
        if (results)
          return results;
      });

      newGeopoints.value.add({
        id: geolocation.results[0].place_id,
        latitude: geolocation.results[0].geometry.location.lat(),
        longitude: geolocation.results[0].geometry.location.lng(),
        formatted_address: geolocation.results[0].formatted_address,
      });
    });

    geopoints.value = newGeopoints.value;
  }

  function reset() {
    currentValue.value = null;
    buttonText.value = 'Select Address';
  }

  function selectGeopoint(geopoint: Geopoint) {
    emits('select', geopoint);
    currentValue.value = geopoint;
    buttonText.value = currentValue.value.formatted_address ?? 'Select Address';
    isOpen.value = false;
    geopoints.value = new Set<Geopoint>();
  }

  return {
    autocomplete,
    buttonText,
    currentValue,
    geopoints,
    reset,
    searchTerm,
    selectGeopoint,
  };
}

onMounted(() => {
  if (props.value) {
    currentValue.value = props.value;
    buttonText.value = currentValue.value.formatted_address ?? 'Select Address';
  }
});
</script>

<template>
  <Popover v-model:open="isOpen">
    <div class="w-full text-center">
      <PopoverTrigger>
        <div class="space-x-2 mb-4">
          <Button
            :class="(currentValue ?? initGeopoint()).formatted_address ? '' : 'bg-red-500 hover:bg-red-700'"
            @click.prevent=""
          >
            {{ buttonText }}
          </Button>
          <Button
            variant="outline"
            @click.prevent="reset"
          >
            Reset
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <Command v-model:search-term="searchTerm">
          <CommandInput @input="async (event: Event) => await autocomplete(event)" />
          <CommandEmpty>No Address Found</CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem
                v-for="(geopoint, index) in geopoints"
                :key="geopoint.id"
                :value="geopoint.formatted_address ?? ''"
                @select="selectGeopoint(geopoint)"
              >
                <span v-if="index < 5">
                  {{ geopoint.formatted_address }}
                </span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </div>
  </Popover>
</template>

<style scoped></style>
