// ~/plugins/init-echo.client.js
import initEcho from "~/plugins/echo.client";
import { useAuthStore } from "@/stores/authStore";

export default defineNuxtPlugin(() => {
    if (process.client) {
        const authStore = useAuthStore();

        watch(
            () => authStore.token,
            (newToken) => {
                // Check if the new token is truthy (not null, undefined, or an empty string)
                if (newToken) {
                    // Basic check: You might want to add more sophisticated validation here
                    if (typeof newToken === 'string' && newToken.length > 0) {
                        initEcho(newToken);
                    } else {
                        console.warn("Attempted to initialize Echo with an invalid token:", newToken);
                        // Optionally, you could disconnect Echo here if it was previously initialized
                        initEcho("");
                    }
                } else {
                    // Handle the case where the token becomes empty (e.g., after logout)
                    initEcho("");
                }
            },
            { immediate: true } // Initialize on first load
        );
    }
});