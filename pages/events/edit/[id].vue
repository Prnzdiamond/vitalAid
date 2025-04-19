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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEventStore } from '@/stores/eventStore';
import { useToken } from '@/composables/useToken';
import EventForm from '@/components/EventForm.vue'; // Assuming you'll reuse or adapt your EventForm

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const token = useToken();
const eventId = route.params.id;
const event = ref(null);

onMounted(async () => {
  const fetchedEvent = await eventStore.fetchEvent(eventId);
  if (fetchedEvent) {
    event.value = fetchedEvent.event;
  } else {
    alert('Event not found!');
    router.push('/my-events/created');
  }
});

const updateThisEvent = async (updatedEventData) => {
  if (!token.get()) {
    alert("You must be logged in to edit an event.");
    return;
  }
  try {
    await eventStore.updateEvent(eventId, updatedEventData);
    alert("Event updated successfully!");
    router.push(`/events/${eventId}`); // Redirect to the event details page
  } catch (error) {
    alert("Failed to update event.");
    console.error("Error updating event:", error);
  }
};
</script>