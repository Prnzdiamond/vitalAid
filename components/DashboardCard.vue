
<template>
  <div class="bg-white p-6 shadow-md rounded-lg hover:shadow-xl transition duration-300">
    <div class="flex items-center space-x-3">
      <span class="text-2xl">{{ icon }}</span>
      <h3 class="text-lg font-semibold text-gray-800">{{ title }}</h3>
    </div>
    <p class="text-gray-600 mt-2">{{ content }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  content: String,
  icon: String,
});
</script>

<style scoped>
/* Adds a subtle hover effect to the card */
.dashboard-card:hover {
  transform: translateY(-5px);
}
</style>
