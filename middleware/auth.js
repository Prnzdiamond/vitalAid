// export default defineNuxtRouteMiddleware((to, from) => {
//     const store = useAuthStore();
//     const publicPages = ['/login', '/register']

//     if (publicPages.includes(to.path)) {
//         return // skip auth check for login and register
//     }

//     if (!store.loggedIn) {
//         return navigateTo('/login')
//     }
// })