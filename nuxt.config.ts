// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {},
  },
  css: ['~/assets/global.css'],
  typescript: {
    shim: false,
  },
  build: {
    transpile: ['trpc-nuxt', 'vue-sonner'],
  },
  imports: {
    autoImport: true,
    dirs: ['types/*.ts', 'types/**/*.ts'],
  },
  modules: [
    '@hebilicious/vue-query-nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@vueuse/nuxt',
    'nuxt-viewport',
    'dayjs-nuxt',
    'shadcn-nuxt',
    'nuxt-icon',
    'nuxt-typed-router',
  ],
  vite: {},
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      nodeEnv: process.env.NODE_ENV,
      baseUrl: process.env.BASE_URL || 'http://localhost:3000/',
      gmapsApiKey: process.env.NUXT_PUBLIC_GMAPS_API_KEY,
      adminEmail: process.env.ADMIN_EMAIL,
      adminPassword: process.env.ADMIN_PASSWORD,
      employeeEmail: process.env.EMPLOYEE_EMAIL,
      employeePassword: process.env.EMPLOYEE_PASSWORD,
      timeZone: process.env.TZ,
    },
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhone: process.env.TWILIO_PHONE,
  },
  ssr: false,
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
  dayjs: {
    locales: ['en'],
    plugins: ['duration', 'isLeapYear', 'relativeTime', 'utc', 'timezone'],
    defaultLocale: 'en',
    defaultTimezone: 'Etc/GMT',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    redirect: true,
    redirectOptions: {
      login: '/Login',
      callback: '/Confirm',
      // TODO: Find a better way to pass these in to allow for easier refactor
      exclude: [
        '/',
        '404',
        'Confirm',
        '/MagicLink',
        '/Login',
        '/SignUp',
        '/PasswordlessLogin'
      ]
    },
  },
  viewport: {
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
  },
});
