<script setup lang="ts">
watchEffect(() => {
  const user = useSupabaseUser();

  if (user.value)
    navigateTo('/home');
});
</script>

<template>
  <div>
    <p class="u-text-black">
      Redirecting...
    </p>
  </div>
</template>
