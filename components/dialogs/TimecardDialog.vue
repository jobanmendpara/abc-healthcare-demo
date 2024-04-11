<script setup lang="ts">
import queries from '~/queries';

const props = defineProps({
  timecard: {
    type: Object as PropType<Timecard>,
    required: true,
  },
  name: {
    type: String,
    default: '',
  },
});

const { $api, $toast, $user } = useNuxtApp();
const queryClient = useQueryClient();
const isOpen = ref(false);

const { mutate, isPending } = useMutation({
  mutationFn: async (id: string) => await $api.timecards.clockOut.mutate({
    timecardId: id,
  }),
  onSuccess: () => {
    $toast.success('Clocked out successfully');
    isOpen.value = false;
  },
  onError: (error) => {
    $toast.error(error.message);
  },
  onSettled: () => {
    queryClient.invalidateQueries(queries.timecards.active($user.value!.id));
  },
});

const localTimecard = computed(() => props.timecard);
const elapsedTime = ref('00:00:00');
const updateTimer = localTimecard.value.is_active
  ? setInterval(() => {
    elapsedTime.value = calculateTimeElapsed(localTimecard.value.started_at);
  }, 1000)
  : undefined;

onBeforeUnmount(() => {
  clearInterval(updateTimer);
});
</script>

<template>
  <div class="flex md:flex-row md:space-y-0 flex-col space-y-4 justify-between items-center p-4 text-lg border border-gray-500">
    <p class="text-2xl">
      {{ props.name }}
    </p>
    <p class="text-xl font-bold text-red-400">
      {{ elapsedTime }}
    </p>
    <AlertDialog v-model:open="isOpen">
      <AlertDialogTrigger>
        <Button>
          Clock Out
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will clock you out and end your shift.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p class="w-full text-center text-xl font-bold">
          {{ elapsedTime }}
        </p>
        <AlertDialogFooter>
          <AlertDialogAction
            variant="destructive"
            :disabled="isPending"
            @click="mutate(timecard.id)"
          >
            Clock Out
          </AlertDialogAction>
          <AlertDialogCancel variant="outline">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
