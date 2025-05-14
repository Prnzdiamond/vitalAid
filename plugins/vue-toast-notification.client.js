// ~/plugins/vue-toast-notification.client.js
import { defineNuxtPlugin } from '#app';
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css'; // Import the theme

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(ToastPlugin, {
        position: 'top-right', // You can adjust the global position here
        duration: 3000, // You can adjust the global duration here
    });
});