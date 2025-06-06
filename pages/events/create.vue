<template>
  <div class="max-w-4xl mx-auto py-10">
    <h1 class="text-3xl font-bold text-green-800 mb-6">Create a Volunteer Event</h1>
    <EventForm />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
import EventForm from "@/components/EventForm.vue";
</script>
