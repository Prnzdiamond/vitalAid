<template>
  
  <NuxtLayout>
    <NuxtPage />
    
  </NuxtLayout>
<div>
  
</div>


</template>
<script setup lang="js">


onMounted(() => {
    useAuthStore().restoreSession();
});

const hideheader = () => {
  return this.route.path == "/login" || this.route.path == "/register"
}




</script>

