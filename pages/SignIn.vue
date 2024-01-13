<script setup lang="ts">
definePageMeta({
  layout: 'default',
});

const authStore = useAuthStore();

// WARN: Remove before Prod
const email = ref<string>('app@utyme.io');
const password = ref<string>('dev');
const phone = ref<string>('6208039700');

async function signInWithCredentials(localEmail: string, localPassword: string) {
  await authStore.signInWithCredentials({ email: localEmail, password: localPassword, phone: '' });
}

async function signInWithPhone(localPhone: string) {
  await authStore.signInWithPhone(localPhone);
}
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md sm:w-full md:w-1/3">
    <form>
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
        @click="signInWithCredentials(email, password)"
      />
    </form>
    <p class="my-2 text-center">
      or
    </p>
    <form>
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
        @click="signInWithPhone(phone)"
      />
    </form>
  </div>
</template>

<style scoped></style>
