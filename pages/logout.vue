<template>
  <div class="text-center">Logging out...</div>
</template>

<script setup>
import { useRouter, useRuntimeConfig, onMounted } from "#imports";

definePageMeta({
  middleware: "auth",
});

const router = useRouter();
const store = useAuthStore();

const logout = async () => {
  try {
    await store.logout(); // Call logout from AuthStore
    router.push("/login"); // Redirect after logout
  } catch (error) {
    console.error("Logout error:", error);
    router.push("/dashboard"); // Redirect to dashboard on failure
  }
};

// Call logout function when component mounts
onMounted(() => {
  logout();
});
</script>
