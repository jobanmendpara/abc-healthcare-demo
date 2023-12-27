<script setup lang="ts">
definePageMeta({
  layout: 'default',
});
const user = useSupabaseUser();
const { auth } = useSupabaseClient();

const redirectTo = `${useRuntimeConfig().public.baseUrl}/confirm`;

const email = ref<string>('');
const password = ref<string>('');
const phone = ref<string>('');

async function signInWithCredentials() {
  const { error } = await auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error)
    console.log(error);
}

async function signInWithPhone() {
  const { error } = await auth.signInWithOtp({
    phone: `+1${phone.value}`,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error)
    console.log(error);
}

async function signInWithGoogle() {
  const { error } = await auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });

  if (error)
    console.log(error);
}

watchEffect(() => {
  if (user.value)
    navigateTo('/home');
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md sm:w-full md:w-1/3">
    <div class="mb-4">
      <label
        class="mb-2 block text-sm font-bold text-gray-700"
        for="email"
      >
        Email
      </label>
      <InputText
        id="email"
        v-model="email"
        class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
        type="email"
        placeholder="johndoe@acme.org"
      />
    </div>
    <div class="mb-6">
      <label
        class="mb-2 block text-sm font-bold text-gray-700"
        for="password"
      >
        Password
      </label>
      <InputText
        id="password"
        v-model="password"
        class="focus:shadow-outline mb-3 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
        type="password"
        placeholder="********"
      />
    </div>
    <Button
      class="focus:shadow-outline mb-4 w-full rounded bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-700 focus:outline-none"
      label="Sign In"
      @click="signInWithCredentials"
    />
    <p class="my-2 text-center">
      or
    </p>
    <div class="mb-4">
      <label
        class="mb-2 block text-sm font-bold text-gray-700"
        for="phone"
      >
        Phone Number
      </label>
      <InputText
        id="phone"
        v-model="phone"
        class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
        type="tel"
        placeholder="1235559999"
      />
    </div>
    <Button
      class="focus:shadow-outline mb-4 w-full rounded bg-slate-400 px-4 py-2 font-bold text-white hover:bg-slate-700 focus:outline-none"
      label="Sign In with Phone"
      @click="signInWithPhone"
    />
    <p class="my-2 text-center">
      or
    </p>
    <div class="p-button-icon-center mx-auto w-full text-center">
      <Button
        class="mt-4 h-12 w-12 rounded-lg bg-red-500 p-4 text-white transition hover:bg-red-700"
        icon="pi pi-google"
        icon-pos="left"
        @click="signInWithGoogle"
      />
    </div>
  </div>
</template>

<style scoped></style>
