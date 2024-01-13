<script setup lang="ts">
import type { Geopoint, SignUpFormData } from '~/types';

const authStore = useAuthStore();
const route = useRoute();

// WARN: Remove before Prod
const formData = ref<SignUpFormData>(initSignUpFormData());
const confirmPassword = ref<string>('');

const isEmailValid = computed(() => validateEmail(formData.value.credentials.email));
const isPhoneValid = computed(() => validatePhone(formData.value.credentials.phone ?? ''));
const isPasswordValid = computed(() => validatePassword(formData.value.credentials.password));
const isFirstNameValid = computed(() => validateName(formData.value.first_name));
const isLastNameValid = computed(() => validateName(formData.value.last_name));
const isAddressValid = computed(() => (formData.value.geopoint.latitude && formData.value.geopoint.longitude) == null);
const isFormDataValid = computed(() => {
  return isEmailValid.value
    && isPhoneValid.value
    && isPasswordValid.value
    && isFirstNameValid.value
    && isLastNameValid.value
    && isAddressValid.value;
});

function initSignUpFormData(): SignUpFormData {
  return {
    credentials: {
      email: '',
      password: '',
      phone: '',
    },
    first_name: '',
    middle_name: '',
    last_name: '',
    geopoint: initGeopoint(),
  };
}

async function submit(data: SignUpFormData) {
  await authStore.signUp(data);

  data = initSignUpFormData();
}

definePageMeta({
  layout: 'default',
  middleware: ['verify-invite'],
});

onBeforeMount(() => {
  formData.value.credentials.email = route.query.email as string;
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md sm:w-full md:w-1/3">
    <form
      class="mb-4 space-y-8"
      @submit.prevent="submit(formData)"
    >
      <div class="inline-flex gap-4 w-full">
        <span class="p-float-label w-full">
          <InputText
            id="firstName"
            v-model="formData.first_name"
            class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
            :class="isFirstNameValid ? 'p-valid border-green-500' : 'p-invalid border-red-500'"
            type="text"
          />
          <label
            class="mb-2 block text-sm font-bold"
            for="firstName"
          >
            First Name
          </label>
        </span>
        <span class="p-float-label w-full">
          <InputText
            id="middleName"
            v-model="formData.middle_name"
            class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
            type="text"
          />
          <label
            class="mb-2 block text-sm font-bold"
            for="middleName"
          >
            Middle Name
          </label>
        </span>
        <span class="p-float-label w-full">
          <InputText
            id="lastName"
            v-model="formData.last_name"
            class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
            :class="isLastNameValid ? 'p-valid border-green-500' : 'p-invalid border-red-500'"
            type="text"
          />
          <label
            class="mb-2 block text-sm font-bold"
            for="lastName"
          >
            Last Name
          </label>
        </span>
      </div>
      <AddressAutocomplete
        class="w-full"
        :value="formData.geopoint"
        @select="(geopoint: Geopoint) => {
          formData.geopoint = geopoint
        }"
      />
      <span class="p-float-label">
        <InputText
          id="phone"
          v-model="formData.credentials.phone"
          class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          :class="isPhoneValid ? 'p-valid border-green-500' : 'p-invalid border-red-500'"
          type="text"
        />
        <label
          class="mb-2 block text-sm font-bold"
          for="phone"
        >
          Phone
        </label>
      </span>
      <span class="p-float-label">
        <InputText
          id="email"
          v-model="formData.credentials.email"
          class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          :class="isEmailValid ? 'p-valid border-green-500' : 'p-invalid border-red-500'"
          :disabled="true"
          type="email"
        />
        <label
          class="mb-2 block text-sm font-bold"
          for="email"
        >
          Email
        </label>
        <small
          id="email-help"
          class="text-gray-500"
        >
          If you'd like to use a different email, please contact your admin.
        </small>
      </span>
      <div>
        <span class="p-float-label">
          <InputText
            id="password"
            v-model="formData.credentials.password"
            class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
            :class="isPasswordValid ? 'p-valid border-green-500' : 'p-invalid border-red-500'"
            type="password"
          />
          <label
            class="mb-2 block text-sm font-bold"
            for="password"
          >
            Password
          </label>
        </span>
        <small
          id="password-help"
          class="text-gray-500"
        >
          Passwords must contain 1 lowercase, 1 uppercase, and 1 numerical character and be a minimum of 8 characters.
        </small>
      </div>
      <div>
        <span class="p-float-label">
          <InputText
            id="confirmPassword"
            v-model="confirmPassword"
            class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
            :class="confirmPassword === formData.credentials.password && isPasswordValid ? 'p-valid border-green-500' : 'p-invalid border-red-500'"
            type="password"
          />
          <label
            class="mb-2 block text-sm font-bold"
            for="confirmPassword"
          >
            Confirm Password
          </label>
        </span>
        <small
          id="password-help"
          class="text-gray-500"
        >
          Both passwords must match.
        </small>
      </div>
      <Button
        class="focus:shadow-outline mb-4 w-full rounded bg-primary-500 px-4 py-2 font-bold hover:bg-primary-700 focus:outline-none"
        label="Sign Up"
        :disabled="isFormDataValid"
        type="submit"
      />
    </form>
  </div>
</template>

<style scoped></style>
