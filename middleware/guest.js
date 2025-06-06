export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    // Restore session if on client side
    if (process.client) {
        if (!authStore.loggedIn) {
            authStore.restoreSession();
        }
    }

    // If user is authenticated, redirect to dashboard
    if (authStore.isAuthenticated) {
        return navigateTo('/dashboard');
    }
});
