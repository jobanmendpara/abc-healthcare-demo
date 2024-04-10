<script setup lang="ts">
import { useDark, useVModel } from '@vueuse/core';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { queries } from '~/queries';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  timecardId: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:open', 'submit']);

const { $api, $toast, $user } = useNuxtApp();
const queryClient = useQueryClient();

const isDark = useDark();
const isOpen = useVModel(props, 'open', emit);
const localTimecardId = computed(() => props.timecardId);

const formSchema = toTypedSchema(z.object({
  pin: z.array(z.coerce.string()).length(4, { message: 'Invalid input' }),
}));

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    pin: [],
  },
});

const { mutate } = useMutation({
  mutationFn: async (pin: string) => await $api.timecards.verifyClockIn.mutate({
    timecardId: localTimecardId.value,
    verificationCode: pin,
  }),
  onSuccess: () => {
    $toast.success('Clocked in');
  },
  onError: (error) => {
    $toast.error(error.message);
  },
  onSettled: () => {
    queryClient.invalidateQueries(queries.timecards.active($user.value!.id));
    isOpen.value = false;
    form.resetForm();
  },
});

async function onSubmit() {
  const { valid, values } = await form.validate();

  if (!valid) {
    form.resetForm();
    $toast.error('Invalid pin');
    return;
  }

  const { pin } = values!;

  const joinedPin = pin.join('');

  mutate(joinedPin);
};
</script>

<template>
  <AlertDialog v-model:open="isOpen">
    <AlertDialogContent>
      <AlertDialogTitle>
        Verify Clock In
      </AlertDialogTitle>
      <AlertDialogDescription>
        Please enter the verification code sent to the client.
      </AlertDialogDescription>
      <div class="w-full flex justify-center items-center">
        <form
          class="space-y-4"
        >
          <FormField
            v-slot="{ componentField }"
            name="pin"
          >
            <FormItem>
              <FormLabel for="pin" />
              <FormControl>
                <PinInput
                  id="pin-input"
                  placeholder="○"
                  class="flex gap-2 items-center mt-1"
                  otp
                  type="number"
                  :name="componentField.name"
                  @complete="onSubmit"
                  @update:model-value="(arrStr: string[]) => {
                    form.setValues({
                      pin: arrStr.filter(Boolean),
                    })
                  }"
                >
                  <PinInputGroup>
                    <PinInputInput
                      v-for="(id, index) in 4"
                      :key="id"
                      :class="`${isDark ? 'bg-secondary text-secondary-foreground' : 'text-secondary-foreground'}`"
                      :index="index"
                    />
                  </PinInputGroup>
                </PinInput>
              </FormControl>
            </FormItem>
          </FormField>
          <AlertDialogFooter>
            <AlertDialogCancel
              variant="default"
              class="w-full"
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </form>
      </div>
    </AlertDialogContent>
  </AlertDialog>
</template>
