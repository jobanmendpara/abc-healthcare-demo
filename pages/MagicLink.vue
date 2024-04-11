<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const formSchema = z.object({
  token: z.string(),
});

const form = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    token: '',
  },
});

definePageMeta({
  name: 'magicLink',
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md sm:w-full md:w-1/3">
    <form
      class="space-y-4"
    >
      <FormField
        v-slot="{ componentField }"
        name="token"
      >
        <FormItem>
          <FormLabel for="token">
            Token
          </FormLabel>
          <FormControl>
            <Input
              id="token"
              v-bind="componentField"
              class="focus:shadow-outline mb-3 w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
            />
          </FormControl>
        </FormItem>
      </FormField>
      <Button
        class="focus:shadow-outline mb-4 w-full rounded px-4 py-2 font-bold hover:bg-primary-700 focus:outline-none"
        label="Verify"
        type="submit"
      >
        Verify OTP
      </Button>
    </form>
  </div>
</template>

<style scoped></style>
