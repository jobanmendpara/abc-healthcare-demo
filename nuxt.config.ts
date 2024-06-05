// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          href: 'manifest.webmanifest',
          rel: 'manifest',
        }
      ]
    }
  },
  srcDir: 'src/',
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
    "@vite-pwa/nuxt",
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
  pwa: {
    strategies: 'injectManifest',
    srcDir: 'public',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    manifest: {
      name: 'ABC Healthcare',
      short_name: 'ABC',
      description: 'ABC Healthcare HRIS application',
      display: 'standalone',
      icons: [
        {
          src: 'favicon/favicon.png',
          sizes: '1024x1024',
          type: 'image/png',
        },
        {
          src: 'favicon/favicon-144x144.ico',
          sizes: '144x144',
          type: 'icon',
        },
        {
          src: 'favicon/favicon-48x48.ico',
          sizes: '48x48',
          type: 'icon',
        },
        {
          src: 'favicon/favicon-32x32.ico',
          sizes: '32x32',
          type: 'icon',
        },
        {
          src: 'favicon/favicon-16x16.ico',
          sizes: '16x16',
          type: 'icon',
        }
      ],
      screenshots: [
        {
          src: 'screenshots/wide.png',
          sizes: '1698x963',
          type: 'image/png',
          form_factor: 'wide',
        },
        {
          src: 'screenshots/mobile.png',
          sizes: '903x940',
          type: 'image/png',
        }
      ],
      theme_color: 'rgb(16 23 37)',
      background_color: 'rgb(255 255 255)'
    },
    client: {
      installPrompt: true,
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    devOptions: {
      enabled: true,
      type: 'module',
      suppressWarnings: true,
    },
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
