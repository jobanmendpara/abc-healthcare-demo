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
    './plugins/vue-query.ts',
  ],
  css: ['~/assets/global.css'],
  typescript: {
    shim: false,
  },
  build: {
    transpile: ['trpc-nuxt'],
  },
  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'shadcn-nuxt',
    'nuxt-icon',
  ],
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
      login: '/login',
      callback: '/confirm',
      // TODO: Find a better way to pass these in to allow for easier refactor
      exclude: ['/', '404', '/login', '/signup', '/verify']
    },
  },
  pinia: {
    storesDirs: ['./stores/**'],
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
      {
        path: '~/components/ui/',
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
