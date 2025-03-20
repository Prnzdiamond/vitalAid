export default defineNuxtRouteMiddleware((to, from) => {
    const store = useAuthStore();

    console.log(store)

    store.isAuthenticated;

    if (!store.isAuthenticated) {
        navigateTo("/login")
    }
})