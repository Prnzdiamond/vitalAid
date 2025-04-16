// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@pinia/nuxt','pinia-plugin-persistedstate/nuxt'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  plugins: [
      '~/plugins/echo.client'
  ],
  runtimeConfig: {
    public: {
      apiBase: "http://ec2-3-87-112-153.compute-1.amazonaws.com/api",
      reverbAppKey: "fwz3lcuedhtxbptxrbjx",
      reverbHost: "3.87.112.153",
      reverbPort: 8080,
    },
  },
});