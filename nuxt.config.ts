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
      apiBase: "https://1313-102-89-34-174.ngrok-free.app/api",
      reverbAppKey: "fwz3lcuedhtxbptxrbjx",
      reverbHost: "cabb-102-89-34-174.ngrok-free.app",
      reverbPort: 443,
    },
  },
});