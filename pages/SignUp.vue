<script setup lang="ts">
import type { Geopoint, Role, SignUpFormData, User } from '~/types';

const { $api, $toast } = useNuxtApp();
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

function signUpFormDataToUserObject(userId: string, role: Role, formData: SignUpFormData): User {
  return {
    id: userId,
    first_name: formData.first_name,
    middle_name: formData.middle_name,
    last_name: formData.last_name,
    email: formData.credentials.email,
    is_active: true,
    role,
    geopoint_id: formData.geopoint.id,
    phone_number: formData.credentials.phone,
  };
}

const signUpMutation = useMutation({
  mutationFn: async (data: SignUpFormData) => await $api.auth.signUp.mutate(data.credentials),
  onMutate: async (data) => {
    if (!validateEmail(data.credentials.email))
      throw new Error('Please enter a valid email.');

    if (!validatePhone(data.credentials.phone))
      throw new Error('Please enter a valid phone number.');

    if (!validatePassword(data.credentials.password))
      throw new Error('Passwords must contain 1 lowercase, 1 uppercase, and 1 numerical character.');
  },
  onSuccess: async (data) => {
    if (!data.role)
      throw new Error('No role returned from Supabase');
    if (!data.userId)
      throw new Error('No userId returned from Supabase');

    $toast.success('Check your email for a confirmation link.');
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

const createUserMutation = useMutation({
  mutationFn: async (user: User) => await $api.users.create.mutate({ users: [user] }),
  onSuccess: () => {
    $toast.success('User created');
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

async function submit(localData: SignUpFormData) {
  const newData = localData;
  newData.credentials.phone = `1${localData.credentials.phone}`;

  signUpMutation.mutate(newData, {
    onSuccess: async (data) => {
      if (!data.role)
        throw new Error('No role returned from Supabase');
      if (!data.userId)
        throw new Error('No userId returned from Supabase');

      const newUser = signUpFormDataToUserObject(data.userId, data.role, newData);

      createUserMutation.mutate(newUser);
    },
    onSettled: () => {
      localData = initSignUpFormData();

      navigateTo({ name: 'index' });
    },
  });
}

definePageMeta({
  layout: 'default',
  middleware: ['verify-invite'],
  name: 'SignUp',
});

onBeforeMount(() => {
  formData.value.credentials.email = route.query.email as string;
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md sm:w-full md:w-2/3">
    <form
      class="mb-4 space-y-8"
      @submit.prevent="submit(formData)"
    >
      <div class="inline-flex gap-4 w-full">
        <span class="w-full">
          <Input
            id="firstName"
            v-model="formData.first_name"
            class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
            :class="isFirstNameValid ? 'border-green-500' : 'border-red-500'"
            type="text"
          />
          <Label
            class="mb-2 block text-sm font-bold"
            for="firstName"
          >
            First Name
          </Label>
        </span>
        <span class="w-full">
          <Input
            id="middleName"
            v-model="formData.middle_name"
            class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
            type="text"
          />
          <Label
            class="mb-2 block text-sm font-bold"
            for="middleName"
          >
            Middle Name
          </Label>
        </span>
        <span class="w-full">
          <Input
            id="lastName"
            v-model="formData.last_name"
            class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
            :class="isLastNameValid ? 'border-green-500' : 'border-red-500'"
            type="text"
          />
          <Label
            class="mb-2 block text-sm font-bold"
            for="lastName"
          >
            Last Name
          </Label>
        </span>
      </div>
      <AddressAutocomplete
        :value="formData.geopoint"
        @select="(geopoint: Geopoint) => formData.geopoint = geopoint"
      />
      <span>
        <Input
          id="aptNumber"
          v-model="formData.geopoint.apt_number"
          class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          type="text"
        />
        <Label
          class="mb-2 block text-sm font-bold"
          for="aptNumber"
        >
          Apt Number
        </Label>
      </span>
      <span>
        <Input
          id="phone"
          v-model="formData.credentials.phone"
          class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          :class="isPhoneValid ? 'border-green-500' : 'border-red-500'"
          type="text"
        />
        <Label
          class="mb-2 block text-sm font-bold"
          for="phone"
        >
          Phone
        </Label>
      </span>
      <span>
        <Input
          id="email"
          v-model="formData.credentials.email"
          class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          :class="isEmailValid ? 'border-green-500' : 'border-red-500'"
          :disabled="true"
          type="email"
          autocomplete="username"
        />
        <div class="leading-3">
          <Label
            class="mb-2 block text-sm font-bold"
            for="email"
          >
            Email
          </Label>
          <small
            id="email-help"
            class="text-gray-500"
          >
            If you'd like to use a different email, please contact your admin.
          </small>
        </div>
      </span>
      <div>
        <Input
          id="password"
          v-model="formData.credentials.password"
          class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          :class="isPasswordValid ? 'border-green-500' : 'border-red-500'"
          type="password"
          autocomplete="new-password"
        />
        <div class="leading-3">
          <Label
            class="mb-2 block text-sm font-bold"
            for="password"
          >
            Password
          </Label>
          <small
            id="password-help"
            class="text-gray-500"
          >
            Passwords must contain 1 lowercase, 1 uppercase, and 1 numerical character and be a minimum of 8 characters.
          </small>
        </div>
      </div>
      <div>
        <Input
          id="confirmPassword"
          v-model="confirmPassword"
          class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          :class="confirmPassword === formData.credentials.password && isPasswordValid ? 'border-green-500' : 'border-red-500'"
          type="password"
          autocomplete="password"
        />
        <Label
          class="mb-2 block text-sm font-bold"
          for="confirmPassword"
        >
          Confirm Password
        </Label>
        <div class="leading-3">
          <small
            id="password-help"
            class="text-gray-500"
          >
            Both passwords must match.
          </small>
        </div>
      </div>
      <Button
        class="focus:shadow-outline mb-4 w-full rounded px-4 py-2 font-bold focus:outline-none"
        :disabled="isFormDataValid"
        type="submit"
      >
        Sign Up
      </Button>
    </form>
  </div>
</template>

<style scoped></style>
