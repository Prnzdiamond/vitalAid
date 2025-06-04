export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()
    
    // Define public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/']
    
    // Restore session first if on client side
    if (process.client) {
      authStore.restoreSession()
    }
    
    // Check if current route is public
    if (publicRoutes.includes(to.path)) {
      return
    }
    
    // Check if user is authenticated for protected routes
    if (!authStore.isAuthenticated) {
      return navigateTo('/login')
    }
  })