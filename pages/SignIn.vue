<script setup lang="ts">
// TODO: Move logic to store and server
definePageMeta({
  layout: 'default',
});
const { auth } = useSupabaseClient();
const store = useAppStore();
const user = useSupabaseUser();

const redirectTo = `${useRuntimeConfig().public.baseUrl}/confirm`;

// WARN: Remove before Prod
const email = ref<string>('app@utyme.io');
const password = ref<string>('dev');
const phone = ref<string>('6208039700');

async function signInWithCredentials() {
  const { error } = await auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error)
    toastError({ detail: error.message });

  const user = useSupabaseUser();
  if (user.value)
    await store.hydrate(user.value.id);
}

async function signInWithPhone() {
  const { error } = await auth.signInWithOtp({
    phone: `+1${phone.value}`,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error)
    toastError({ detail: error.message });

  navigateTo({
    path: '/verifysignin',
    query: {
      phone: phone.value,
    },
  });
}

async function signInWithGoogle() {
  const { error } = await auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });

  if (error)
    toastError({ detail: error.message });
}

// WARN: Consider a moving redirection to sign in methods
watchEffect(() => {
  if (user.value)
    navigateTo('/home');
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md sm:w-full md:w-1/3">
    <div class="mb-4">
      <label
        class="mb-2 block text-sm font-bold"
        for="email"
      >
        Email
      </label>
      <InputText
        id="email"
        v-model="email"
        class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
        type="email"
        placeholder="johndoe@acme.org"
      />
    </div>
    <div class="mb-6">
      <label
        class="mb-2 block text-sm font-bold"
        for="password"
      >
        Password
      </label>
      <InputText
        id="password"
        v-model="password"
        class="focus:shadow-outline mb-3 w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
        type="password"
        placeholder="********"
      />
    </div>
    <Button
      class="focus:shadow-outline mb-4 w-full rounded bg-primary-500 px-4 py-2 font-bold hover:bg-primary-700 focus:outline-none"
      label="Sign In"
      @click="signInWithCredentials"
    />
    <p class="my-2 text-center">
      or
    </p>
    <div class="mb-4">
      <label
        class="mb-2 block text-sm font-bold"
        for="phone"
      >
        Phone Number
      </label>
      <InputText
        id="phone"
        v-model="phone"
        class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
        type="tel"
        placeholder="1235559999"
      />
    </div>
    <Button
      class="focus:shadow-outline mb-4 w-full rounded bg-slate-400 px-4 py-2 font-bold hover:bg-slate-700 focus:outline-none"
      label="Sign In with Phone"
      @click="signInWithPhone"
    />
    <p class="my-2 text-center">
      or
    </p>
    <div class="p-button-icon-center mx-auto w-full text-center">
      <Button
        class="mt-4 h-12 w-12 rounded-lg bg-red-500 p-4 transition hover:bg-red-700"
        icon="pi pi-google"
        icon-pos="left"
        @click="signInWithGoogle"
      />
    </div>
  </div>
</template>

<style scoped></style>
