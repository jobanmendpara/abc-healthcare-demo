<script setup lang="ts">
watchEffect(() => {
  console.log(useSupabaseUser().value);
  if (useSupabaseUser().value)
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
