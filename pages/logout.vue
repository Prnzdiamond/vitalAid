<template>
  <div class="text-center">Logging out...</div>
</template>

<script setup>
import { useRouter, useRuntimeConfig, onMounted } from "#imports";
import { useAuthStore } from "@/stores/authStore"; // Ensure this import is correct
import { useSwal } from "@/composables/useSwal"; // Import useSwal

const router = useRouter();
const store = useAuthStore();
const { swal } = useSwal();

const logout = async () => {
  try {
    await store.logout(); // Call logout from AuthStore
    swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have been successfully logged out.',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      router.push("/login"); // Redirect after logout
    });
  } catch (error) {
    console.error("Logout error:", error);
    swal.fire({
      icon: 'error',
      title: 'Logout Failed',
      text: 'An error occurred during logout.',
    }).then(() => {
      router.push("/dashboard"); // Redirect to dashboard on failure
    });
  }
};

// Call logout function when component mounts
onMounted(() => {
  logout();
});
</script>