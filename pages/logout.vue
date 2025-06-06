<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Logging out...</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter, onMounted } from "#imports";
import { useAuthStore } from "@/stores/authStore";
import { useSwal } from "@/composables/useSwal";

// Set page meta to prevent middleware from running
definePageMeta({
  middleware: [] // No middleware for logout page
});

const router = useRouter();
const store = useAuthStore();
const { swal } = useSwal();

const performLogout = async () => {
  try {
    // Call logout from AuthStore (this will always succeed now)
    const result = await store.logout();
    
    // Show success message
    await swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have been successfully logged out.',
      timer: 1500,
      showConfirmButton: false,
    });
    
    // Always redirect to login after logout
    await router.push("/login");
    
  } catch (error) {
    console.error("Logout error:", error);
    
    // Even if there's an error, clear state and redirect
    store.clearAuthState();
    
    await swal.fire({
      icon: 'warning',
      title: 'Logged Out',
      text: 'You have been logged out (with some connection issues).',
      timer: 2000,
      showConfirmButton: false,
    });
    
    await router.push("/login");
  }
};

// Call logout function when component mounts
onMounted(() => {
  performLogout();
});
</script>