// middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    // Always restore session first if we're on client side
    if (process.client) {
        // Check if session hasn't been restored yet
        if (!authStore.loggedIn) {
            // Try to restore from localStorage
            authStore.restoreSession();
        }
    }

    // If user is not authenticated after restoration attempt
    if (!authStore.isAuthenticated) {
        // Store the current path for redirect after login
        if (process.client) {
            localStorage.setItem('redirectAfterLogin', to.fullPath);
        }

        // Redirect to login
        return navigateTo('/login');
    }
});