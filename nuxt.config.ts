import path from 'node:path';

import eslintPlugin from 'vite-plugin-eslint';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          id: 'theme',
          rel: 'stylesheet',
          href: 'themes/lara-dark-green/theme.css',
        },
      ],
    },
  },
  css: ['primeicons/primeicons.css', '~/assets/global.css'],
  typescript: {
    shim: false,
  },
  build: {
    transpile: ['trpc-nuxt'],
  },
  modules: ['@nuxtjs/supabase', '@pinia/nuxt', 'nuxt-primevue'],
  vite: {
    plugins: [eslintPlugin()],
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000/',
    },
  },
  ssr: false,
  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/register'],
    },
  },
  primevue: {
    usePrimeVue: true,
    options: {
      ripple: true,
    },
    cssLayerOrder: 'tailwind-base, primevue, tailwind-utilities',
    importPT: { as: 'Lara', from: path.resolve(__dirname, './presets/lara/') },
  },
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
      {
        path: '~/components/forms',
        pathPrefix: false,
      },
    ],
  },
});
