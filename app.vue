<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="js">
const authStore = useAuthStore();

// Restore session immediately when app loads
if (process.client) {
  authStore.restoreSession();
}

onMounted(() => {
  // Ensure session is restored on mount as well
  authStore.restoreSession();
});

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
    }
  ]
});
</script>