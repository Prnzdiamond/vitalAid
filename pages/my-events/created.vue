<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-blue-700">My Created Events</h1>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <button
              @click="activeTab = 'upcoming'"
              class="px-4 py-2 rounded-md transition-colors"
              :class="activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'"
            >
              Upcoming
            </button>
            <button
              @click="activeTab = 'past'"
              class="px-4 py-2 rounded-md transition-colors"
              :class="activeTab === 'past' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'"
            >
              Past
            </button>
          </div>
          <NuxtLink
            to="/events/create"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <i class="fas fa-plus w-5 h-5"></i>
            Create New Event
          </NuxtLink>
        </div>
      </div>

      <div v-if="loading" class="col-span-full text-center py-8">
        <i class="fas fa-spinner fa-spin h-8 w-8 mx-auto text-blue-600"></i>
        <p class="mt-2 text-gray-600">Loading created events...</p>
      </div>

      <div v-else-if="filteredEvents.length === 0" class="bg-white rounded-xl shadow p-10 text-center">
        <div class="flex justify-center mb-4">
          <i class="fas fa-plus w-16 h-16 mx-auto text-gray-400 mb-4"></i>
        </div>
        <p class="text-xl font-medium text-gray-700">No {{ activeTab }} events created yet</p>
        <p class="text-gray-500 mt-2">
          {{ activeTab === 'upcoming' ? 'Start planning your next volunteer opportunity!' : 'You haven\'t completed any events yet.' }}
        </p>
        <NuxtLink to="/events/create" class="mt-4 inline-block px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Create Event
        </NuxtLink>
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
        >
          <div
            class="h-48 bg-gray-100 relative"
            :class="{'opacity-75': isEventCompleted(event)}"
          >
            <img
              v-if="event.banner_url"
              :src="event.banner_url"
              :alt="event.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <i class="fas fa-image h-12 w-12"></i>
            </div>
            <div v-if="isEventCompleted(event)" class="absolute top-2 right-2 bg-gray-800 text-white px-3 py-1 rounded-full text-xs">
              Completed
            </div>
          </div>
          <div class="p-5 flex flex-col flex-grow">
            <div class="text-sm font-medium mb-2"
              :class="isEventCompleted(event) ? 'text-gray-500' : 'text-blue-600'"
            >
              {{ event.category || 'General' }}
            </div>
            <h2 class="text-xl font-semibold mb-2 line-clamp-2"
              :class="isEventCompleted(event) ? 'text-gray-600' : 'text-gray-800'"
            >
              {{ event.title }}
            </h2>
            <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ event.description }}</p>
            <div class="mt-auto">
              <div class="text-sm text-gray-600 space-y-1 mb-3">
                <div class="flex items-center">
                  <i class="fas fa-map-marker-alt w-4 h-4 mr-2 text-blue-600"></i>
                  {{ event.location }}
                </div>
                <div class="flex items-center">
                  <i class="fas fa-calendar-alt w-4 h-4 mr-2 text-blue-600"></i>
                  {{ formatDate(event.start_time) }}
                </div>
              </div>
              <div class="flex justify-end items-center mt-4 pt-3 border-t border-gray-100 space-x-2">
                <NuxtLink
                  v-if="!isEventCompleted(event)"
                  :to="`/events/edit/${event.id}`"
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Edit
                </NuxtLink>
                <button
                  v-if="!isEventCompleted(event)"
                  class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  @click="deleteEvent(event.id)"
                >
                  Delete
                </button>
                <button
                  v-if="!isEventCompleted(event) && isPastEndTime(event)"
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  @click="markAsCompleted(event.id)"
                >
                  Mark as Completed
                </button>
                <NuxtLink :to="`/events/${event.id}`" class="px-3 py-1 text-blue-600 hover:underline text-sm">
                  Details
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
import { onMounted, ref, computed } from "vue";
import { useEventStore } from "@/stores/eventStore";
import { useToken } from "@/composables/useToken";
import { useAuthStore } from "@/stores/authStore"; // Assuming you have an auth store
import { useRouter } from "vue-router";
import { useSwal } from "@/composables/useSwal"; // Import useSwal

const eventStore = useEventStore();
const token = useToken();
const createdEvents = ref([]);
const authStore = useAuthStore();
const router = useRouter();
const { swal } = useSwal(); // Destructure swal
const loading = ref(true);
const activeTab = ref('upcoming');

onMounted(async () => {
  if (token.get()) {
    try {
      // Fetch user created events directly from the store
      const events = await eventStore.fetchUserCreatedEvents();
      createdEvents.value = events;
    } catch (error) {
      console.error("Error loading created events:", error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load your created events.',
      });
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
});

const isEventCompleted = (event) => {
  const now = new Date();
  const endTime = new Date(event.end_time);
  return event.status === 'completed' || endTime < now;
};

const isPastEndTime = (event) => {
  const now = new Date();
  const endTime = new Date(event.end_time);
  return endTime < now && event.status !== 'completed';
};

const filteredEvents = computed(() => {
  if (activeTab.value === 'upcoming') {
    return createdEvents.value.filter(event => !isEventCompleted(event));
  } else {
    return createdEvents.value.filter(event => isEventCompleted(event));
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const markAsCompleted = async (eventId) => {
  if (!token.get()) {
    swal.fire({
      icon: 'warning',
      title: 'Unauthorized',
      text: 'You must be logged in to mark an event as completed.',
    });
    return;
  }

  swal.fire({
    title: 'Mark as Completed?',
    text: 'This will mark the event as completed and notify participants. This action cannot be undone.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#4CAF50',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, complete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await eventStore.completeEvent(eventId);
        
        // Update the local event status
        const event = createdEvents.value.find(e => e.id === eventId);
        if (event) {
          event.status = 'completed';
        }
        
        swal.fire({
          icon: 'success',
          title: 'Event Completed',
          text: 'Event has been marked as completed and participants have been notified.',
        });
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Action Failed',
          text: error.response?.data?.message || 'Failed to mark event as completed.',
        });
        console.error("Error completing event:", error);
      }
    }
  });
};

const deleteEvent = async (eventId) => {
  if (!token.get()) {
    swal.fire({
      icon: 'warning',
      title: 'Unauthorized',
      text: 'You must be logged in to delete an event.',
    });
    return;
  }

  swal.fire({
    title: 'Are you sure?',
    text: 'Are you sure you want to delete this event?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await eventStore.deleteEvent(eventId);
        swal.fire({
          icon: 'success',
          title: 'Event Deleted',
          text: 'Event deleted successfully!',
        });
        // Refresh the list by removing the deleted event from the array
        createdEvents.value = createdEvents.value.filter(event => event.id !== eventId);
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: error.response?.data?.message || 'Failed to delete event.',
        });
        console.error("Error deleting event:", error);
      }
    }
  });
};
</script>