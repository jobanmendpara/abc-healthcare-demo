<script setup lang="ts">
const props = defineProps({
  timecard: {
    type: Object as PropType<Timecard>,
    required: true,
  },
});
</script>

<template>
  <Dialog>
    <DialogTrigger>
      <Button variant="outline">
        Edit
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogTitle>
        Edit Timecard
      </DialogTitle>
      <DialogDescription>
        Update the current timecard details
      </DialogDescription>
      <EditTimecardForm
        :timecard="props.timecard"
      />
    </DialogContent>
  </Dialog>
</template>
