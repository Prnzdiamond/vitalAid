<template>
  <div class="max-w-4xl mx-auto py-10">
    <h1 class="text-3xl font-bold text-blue-800 mb-6">Edit Volunteer Event</h1>
    <div v-if="event">
      <EventForm :initialEvent="event" @event-submitted="updateThisEvent" />
    </div>
    <div v-else class="text-center text-gray-500">
      Loading event details...
    </div>
    <NuxtLink to="/my-events/created" class="inline-block mt-4 text-blue-600 hover:underline">
      Back to My Created Events
    </NuxtLink>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEventStore } from '@/stores/eventStore';
import { useToken } from '@/composables/useToken';
import { useSwal } from '@/composables/useSwal';
import EventForm from '@/components/EventForm.vue';

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const token = useToken();
const eventId = route.params.id;
const event = ref(null);
const { swal } = useSwal();

onMounted(async () => {
  if (!token.get()) {
    swal.fire({
      icon: 'warning',
      title: 'Unauthorized',
      text: 'You must be logged in to edit an event.',
    }).then(() => {
      router.push('/login');
    });
    return;
  }
  
  try {
    event.value = await eventStore.fetchEvent(eventId);
  } catch (error) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while fetching event details.',
    }).then(() => {
      router.push('/my-events/created');
    });
    console.error("Error fetching event:", error);
  }
});

const updateThisEvent = async (updatedEventData) => {
  if (!token.get()) {
    swal.fire({
      icon: 'warning',
      title: 'Unauthorized',
      text: 'You must be logged in to edit an event.',
    });
    return;
  }
  
  try {
    await eventStore.updateEvent(eventId, updatedEventData);
    swal.fire({
      icon: 'success',
      title: 'Event Updated',
      text: 'Event updated successfully!',
    }).then(() => {
      router.push(`/events/${eventId}`);
    });
  } catch (error) {
    swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: error.response?.data?.message || 'Failed to update event.',
    });
    console.error("Error updating event:", error);
  }
};
</script>