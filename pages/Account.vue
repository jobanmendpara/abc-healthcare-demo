<script setup lang="ts">
import queries from '~/queries';

definePageMeta({
  layout: 'main',
  name: 'account',
});

const { $user } = useNuxtApp();

const queryClient = useQueryClient();
const user = await queryClient.fetchQuery({
  ...queries.app.user($user.value!.id),
});
</script>

<template>
  <div class="space-y-3">
    <section class="space-y-3">
      <div>
        <h1 class="text-left text-2xl font-semibold">
          Account
        </h1>
        <p>
          {{ user.role === 'employee' ? 'The information in this section is visible to your admins' : '' }}
        </p>
      </div>
      <EditAccountForm
        :user="user"
      />
    </section>
    <Separator />
    <section class="text-left space-y-3">
      <div>
        <h2 class="text-xl font-semibold">
          Change Password
        </h2>
        <p>
          Passwords must contain 1 lowercase letter, 1 uppercase letter, 1 number, 1 symbol, and be a minimum length of
          8 characters.
        </p>
      </div>
      <UpdatePasswordForm
        :username="user.email"
      />
    </section>
  </div>
</template>
