<script setup lang="ts">
const isDark = useDark();

function toggleTheme() {
  isDark.value = !isDark.value;
}
</script>

<template>
  <body
    class="container mx-auto"
    :class="isDark ? 'dark' : ''"
  >
    <div class="flex-center justify-between py-2">
      <div
        class="flex justify-center items-center gap-1 hover:cursor-pointer"
        @click="toggleTheme"
      >
        <Icon
          v-if="isDark"
          name="lucide:sun"
        />
        <Icon
          v-else
          name="lucide:moon"
        />
      </div>
    </div>
    <slot />
  </body>
</template>
