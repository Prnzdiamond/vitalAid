// ~/middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()
    
    // Restore session first if on client side
    if (process.client) {
      authStore.restoreSession()
    }
    
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      // Redirect to login page
      return navigateTo('/login')
    }
  })
  
  // ~/middleware/guest.js - For login/register pages (optional)
  export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()
    
    // Restore session first if on client side
    if (process.client) {
      authStore.restoreSession()
    }
    
    // If user is already authenticated, redirect to dashboard/home
    if (authStore.isAuthenticated) {
      return navigateTo('/dashboard') // or wherever you want authenticated users to go
    }
  })