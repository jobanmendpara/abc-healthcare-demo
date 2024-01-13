import path from 'node:path';

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
  plugins: [
    './plugins/toast.ts'
  ],
  css: ['primeicons/primeicons.css', '~/assets/global.css'],
  typescript: {
    shim: false,
  },
  build: {
    transpile: ['trpc-nuxt'],
  },
  modules: ['@nuxtjs/supabase', '@pinia/nuxt', 'nuxt-primevue'],
  vite: {},
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    envType: process.env.NODE_ENV,
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000/',
      gmapsApiKey: process.env.NUXT_PUBLIC_GMAPS_API_KEY,
    },
  },
  ssr: false,
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    redirect: true,
    redirectOptions: {
      login: '/signin',
      callback: '/confirm',
      // TODO: Find a better way to pass these in to allow for easier refactor
      exclude: ['/', '404', '/signin', '/signup']
    },
  },
  pinia: {
    storesDirs: ['./stores/**'],
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
  devtools: {
    timeline: {
      enabled: true,
    },
  },
});
