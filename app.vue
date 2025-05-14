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
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
    }
  ]
});

const hideheader = () => {
  return this.route.path == "/login" || this.route.path == "/register"
}




</script>

