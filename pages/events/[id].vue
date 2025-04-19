<template>
  <div v-if="event" class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-white shadow-lg rounded-lg">
    <h1 class="text-3xl font-bold text-green-800 mb-4">{{ event.title }}</h1>
    <p class="text-gray-700 mb-4">{{ event.description }}</p>
    <div class="mb-4">
      <strong class="text-green-600">Location:</strong> {{ event.location }}
    </div>
    <div class="mb-4">
      <strong class="text-green-600">Start Time:</strong> {{ new Date(event.start_time).toLocaleString() }}
    </div>
    <div>
      <strong class="text-green-600">End Time:</strong> {{ new Date(event.end_time).toLocaleString() }}
    </div>

    <div class="mt-6 flex items-center space-x-4">
      <button
        v-if="token.get() && !isEventCreator && !eventStore.userEvents.includes(event.id)"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        @click="joinThisEvent(event.id)"
      >
        Join Event
      </button>
      <button
        v-if="token.get() && !isEventCreator && eventStore.userEvents.includes(event.id)"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        @click="leaveThisEvent(event.id)"
      >
        Leave Event
      </button>
      <span v-else-if="token.get() && !isEventCreator && eventStore.userEvents.includes(event.id)" class="inline-block px-4 py-2 bg-gray-400 text-white rounded">
        Joined
      </span>
      <p v-else-if="!token.get() && !isEventCreator" class="text-gray-500">You must be logged in to join or leave events.</p>

      <NuxtLink
        v-if="token.get() && isEventCreator"
        :to="`/events/edit/${event.id}`"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Edit Event
      </NuxtLink>
      <button
        v-if="token.get() && isEventCreator"
        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        @click="deleteThisEvent(event.id)"
      >
        Delete Event
      </button>
    </div>

    <NuxtLink to="/event" class="inline-block mt-4 text-green-600 hover:underline">
      Back to Events
    </NuxtLink>
  </div>
  <div v-else class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
    Loading event details...
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEventStore } from '@/stores/eventStore';
import { useToken } from '@/composables/useToken';
import { useAuthStore } from '@/stores/authStore'; // Assuming you have an auth store with user info

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const token = useToken();
const authStore = useAuthStore(); // Use the auth store
const event = ref(null);
const eventId = route.params.id;

const isEventCreator = computed(() => {
  return token.get() && event.value && authStore.user?.id === event.value.event_manager;
});

onMounted(async () => {
  const fetchedEvent = await eventStore.fetchEvent(eventId);
  if (fetchedEvent) {
    event.value = fetchedEvent.event;
  } else {
    alert('Event not found!');
    router.push('/event');
  }
});

const joinThisEvent = async (eventId) => {
  if (!token.get()) {
    alert("You must be logged in to join an event.");
    return;
  }
  await eventStore.joinEvent(eventId);
  await eventStore.fetchUserEvents();
  if (event.value) {
    event.value = { ...event.value };
  }
};

const leaveThisEvent = async (eventId) => {
  if (!token.get()) {
    alert("You must be logged in to leave an event.");
    return;
  }
  if (confirm("Are you sure you want to leave this event?")) {
    await eventStore.leaveEvent(eventId);
    await eventStore.fetchUserEvents();
    if (event.value) {
      event.value = { ...event.value };
    }
  }
};

const deleteThisEvent = async (eventId) => {
  if (!token.get()) {
    alert("You must be logged in to delete an event.");
    return;
  }
  if (confirm("Are you sure you want to delete this event?")) {
    try {
      await eventStore.deleteEvent(eventId);
      alert("Event deleted successfully!");
      router.push('/event');
    } catch (error) {
      alert("Failed to delete event.");
      console.error("Error deleting event:", error);
    }
  }
};
</script>