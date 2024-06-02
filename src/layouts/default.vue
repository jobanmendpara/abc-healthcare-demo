<script setup lang="ts">
const isDark = useDark();
</script>

<template>
  <body
    class="container mx-auto"
    :class="isDark ? 'dark' : ''"
  >
    <slot />
  </body>
</template>
