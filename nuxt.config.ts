// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@pinia/nuxt','pinia-plugin-persistedstate/nuxt'],

  vite: {
    plugins: [tailwindcss()],
  },

  plugins: [
    "~/plugins/init-echo.client.js",
    '~/plugins/echo.client'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NODE_ENV === 'development' 
        ? "http://localhost:8000/api" 
        : "https://vitalaid.duckdns.org/api",

      reverbAppKey: "fwz3lcuedhtxbptxrbjx",

      reverbHost: process.env.NODE_ENV === 'development'
        ? "localhost" 
        : "vitalaid.duckdns.org",

      reverbPort: 8080,
    },
  },
});
