export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    // Always restore session if on client side
    if (process.client && !authStore.loggedIn) {
        authStore.restoreSession();
    }

    // Don't redirect, just ensure session is restored
});
