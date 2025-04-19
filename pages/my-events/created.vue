<template>
  <div class="max-w-4xl mx-auto py-8">
    <h1 class="text-3xl font-bold text-blue-800 mb-6">My Created Events</h1>

    <div v-if="createdEvents.length === 0" class="text-center text-gray-500">
      You haven't created any events yet.
    </div>

    <div
      v-for="event in createdEvents"
      :key="event.id"
      class="bg-white border border-blue-200 p-4 rounded-lg shadow hover:shadow-md transition mb-4"
    >
      <NuxtLink :to="`/events/${event._id}`" class="block hover:bg-blue-50 p-2 rounded-md">
        <h2 class="text-xl font-semibold text-blue-800">{{ event.title }}</h2>
        <p class="text-gray-700">{{ event.description?.substring(0, 100) }}...</p>
        <p class="text-gray-600 text-sm italic">{{ event.location }} | {{ new Date(event.start_time).toLocaleDateString() }}</p>
      </NuxtLink>
      <div class="mt-3 flex justify-end space-x-2">
        <NuxtLink :to="`/events/edit/${event.id}`" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
          Edit
        </NuxtLink>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          @click="deleteEvent(event.id)"
        >
          Delete
        </button>
        <NuxtLink :to="`/events/${event.id}`" class="px-3 py-1 text-blue-600 hover:underline text-sm">
          Details
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useEventStore } from "@/stores/eventStore";
import { useToken } from "@/composables/useToken";

const eventStore = useEventStore();
const token = useToken();
const createdEvents = ref([]);

onMounted(async () => {
  if (token.get()) {
    await eventStore.fetchUserCreatedEvents();
    createdEvents.value = eventStore.events.filter(event => event.event_manager === useAuthStore().user?.id);
  }
});


const deleteEvent = async (eventId) => {
  if (!token.get()) {
    alert("You must be logged in to delete an event.");
    return;
  }
  if (confirm("Are you sure you want to delete this event?")) {
    try {
      await eventStore.deleteEvent(eventId);
      alert("Event deleted successfully!");
      // Optionally refresh the list
      await eventStore.fetchUserCreatedEvents();
      createdEvents.value = eventStore.events.filter(event => event.event_manager === useAuthStore().user?.id);
    } catch (error) {
      alert("Failed to delete event.");
      console.error("Error deleting event:", error);
    }
  }
};
</script>