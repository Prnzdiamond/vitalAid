<template>
  <div class="max-w-4xl mx-auto py-8">
    <h1 class="text-3xl font-bold text-green-800 mb-6">My Joined Events</h1>

    <div v-if="eventStore.userEvents.length === 0" class="text-center text-gray-500">
      You haven't joined any events yet.
    </div>

    <div
      v-for="eventId in eventStore.userEvents"
      :key="eventId"
      class="bg-white border border-green-200 p-4 rounded-lg shadow hover:shadow-md transition mb-4"
    >
      <NuxtLink :to="`/events/${eventId}`" v-if="getJoinedEvent(eventId)" class="block hover:bg-green-50 p-2 rounded-md">
        <h2 class="text-xl font-semibold text-green-800">{{ getJoinedEvent(eventId).title }}</h2>
        <p class="text-gray-700">{{ getJoinedEvent(eventId).description?.substring(0, 100) }}...</p>
        <p class="text-gray-600 text-sm italic">{{ getJoinedEvent(eventId).location }} | {{ new Date(getJoinedEvent(eventId).start_time).toLocaleDateString() }}</p>
      </NuxtLink>
      <div v-else class="text-gray-500 italic">Loading event details...</div>
      <div class="mt-3 flex justify-end">
        <button
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
          @click="leaveEvent(eventId)"
        >
          Leave Event
        </button>
        <NuxtLink :to="`/events/${eventId}`" class="px-3 py-1 text-green-600 hover:underline text-sm">
          Details
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useEventStore } from "@/stores/eventStore";
import { useToken } from "@/composables/useToken";

const eventStore = useEventStore();
const token = useToken();

onMounted(async () => {
  if (token.get()) {
    await eventStore.fetchUserEvents();
    // Optionally fetch all events to have details readily available
    await eventStore.fetchEvents();
  }
});

const getJoinedEvent = (eventId) => {
  return eventStore.events.find(event => event._id === eventId);
};

const leaveEvent = async (eventId) => {
  if (!token.get()) {
    alert("You must be logged in to leave an event.");
    return;
  }
  if (confirm("Are you sure you want to leave this event?")) {
    await eventStore.leaveEvent(eventId);
    await eventStore.fetchUserEvents(); // Refresh the list
  }
};
</script>