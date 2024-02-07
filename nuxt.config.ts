// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {},
  },
  plugins: [],
  css: ['~/assets/global.css'],
  typescript: {
    shim: false,
  },
  build: {
    transpile: ['trpc-nuxt'],
  },
  imports: {
    autoImport: true,
    dirs: [ 'types/*.ts', 'types/**/*.ts'],
  },
  modules: [
    '@hebilicious/vue-query-nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'shadcn-nuxt',
    'nuxt-icon',
    'nuxt-typed-router',
  ],
  nuxtTypedRouter: {
    plugin: true,
  },
  vite: {},
  vueQuery: {
    autoImports: [
      'useQuery',
      'useQueries',
      'useInfiniteQuery',
      'useMutation',
      'useIsFetching',
      'useIsMutating',
      'useQueryClient'
    ],
  },
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
