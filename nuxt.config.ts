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
      apiBase: "https://relation-leu-personalized-polish.trycloudflare.com/api",
      reverbAppKey: "fwz3lcuedhtxbptxrbjx",
      reverbHost: "tions-rates-lonely-organizations.trycloudflare.com",
      reverbPort: 8080,
    },
  },
});