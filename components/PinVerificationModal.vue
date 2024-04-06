<script setup lang="ts">
import { useVModel, useDark } from '@vueuse/core';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:open', 'submit']);

const { $toast } = useNuxtApp();

const isDark = useDark();
const isOpen = useVModel(props, 'open', emit);

const formSchema = toTypedSchema(z.object({
  pin: z.array(z.coerce.string()).length(4, { message: 'Invalid input' }),
}));

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    pin: [],
  },
});

async function onSubmit() {
  const validationResults = await form.validate();

  if (!validationResults.valid) {
    $toast.error('Pin is invalid');
    return;
  }
  if (!validationResults.values)
    return;

  const joinedPin = validationResults.values.pin.join('');

  isOpen.value = false;
  emit('submit', joinedPin);
}

watchEffect(() => {
  if (isOpen.value) {
    form.resetForm();
  }
});
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
          @submit.prevent="onSubmit()"
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
