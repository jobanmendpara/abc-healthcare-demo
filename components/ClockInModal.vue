<script setup lang="ts">
import { useGeolocation } from '@vueuse/core';

const props = defineProps({
  user: {
    type: Object as PropType<User>,
    default: () => initUser(),
  },
});

const emit = defineEmits(['update:open', 'submit']);

const { coords, resume, pause } = useGeolocation();
const localUser = computed(() => props.user);
const isOpen = ref(false);

async function onSubmit() {
  isOpen.value = false;
  emit('submit', {
    latitude: coords.value.latitude,
    longitude: coords.value.longitude,
  });
}

watch(
  () => isOpen.value,
  (newVal) => {
    if (newVal) {
      resume();
    }
    else {
      pause();
    }
  },
);
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <Button>
        Clock In
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogTitle>
        {{ localUser.first_name }} {{ localUser.last_name }}
      </DialogTitle>
      <DialogDescription>
        Please confirm your location.
      </DialogDescription>
      <div class="space-y-5">
        <p>Address: <span>{{ localUser.geopoint.formatted_address }}</span></p>
        <Button
          class="w-full"
          @click="onSubmit"
        >
          Verify Location
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
