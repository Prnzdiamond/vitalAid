<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-green-700">My Joined Events</h1>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <button
              @click="activeTab = 'upcoming'"
              class="px-4 py-2 rounded-md transition-colors"
              :class="activeTab === 'upcoming' ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-50'"
            >
              Upcoming
            </button>
            <button
              @click="activeTab = 'past'"
              class="px-4 py-2 rounded-md transition-colors"
              :class="activeTab === 'past' ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-50'"
            >
              Past
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="col-span-full text-center py-8">
        <i class="fas fa-spinner fa-spin h-8 w-8 mx-auto text-green-600"></i>
        <p class="mt-2 text-gray-600">Loading joined events...</p>
      </div>

      <div v-else-if="filteredEvents.length === 0" class="bg-white rounded-xl shadow p-10 text-center">
        <div class="flex justify-center mb-4">
          <i class="fas fa-paper-plane w-16 h-16 mx-auto text-gray-400 mb-4"></i>
        </div>
        <p class="text-xl font-medium text-gray-700">No {{ activeTab }} events found</p>
        <p class="text-gray-500 mt-2">
          {{ activeTab === 'upcoming' ? 'Browse available events and join the ones that interest you!' : 'You haven\'t participated in any past events yet.' }}
        </p>
        <NuxtLink to="/events" class="mt-4 inline-block px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
          Explore Events
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
              :class="isEventCompleted(event) ? 'text-gray-500' : 'text-green-600'"
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
                  <i class="fas fa-map-marker-alt w-4 h-4 mr-2 text-green-600"></i>
                  {{ event.location }}
                </div>
                <div class="flex items-center">
                  <i class="fas fa-calendar-alt w-4 h-4 mr-2 text-green-600"></i>
                  {{ formatDate(event.start_time) }}
                </div>
              </div>

              <div class="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <NuxtLink :to="`/events/${event.id}`" class="text-green-600 hover:text-green-800 text-sm font-medium">
                  View Details
                </NuxtLink>
                <button
                  v-if="!isEventCompleted(event)"
                  class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  @click="leaveEvent(event.id)"
                >
                  Leave Event
                </button>
                <span v-else class="text-sm text-gray-500 italic">Event completed</span>
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
import { useRouter } from "vue-router";
import { useSwal } from "@/composables/useSwal"; // Import useSwal

const eventStore = useEventStore();
const token = useToken();
const router = useRouter();
const { swal } = useSwal(); // Destructure swal
const joinedEvents = ref([]);
const loading = ref(true);
const activeTab = ref('upcoming');

onMounted(async () => {
  if (token.get()) {
    try {
      // Fetch the user's joined events
      joinedEvents.value = await eventStore.fetchUserEvents();
    } catch (error) {
      console.error("Error loading joined events:", error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load your joined events.',
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

const filteredEvents = computed(() => {
  if (activeTab.value === 'upcoming') {
    return joinedEvents.value.filter(event => !isEventCompleted(event));
  } else {
    return joinedEvents.value.filter(event => isEventCompleted(event));
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

const leaveEvent = async (eventId) => {
  if (!token.get()) {
    swal.fire({
      icon: 'warning',
      title: 'Unauthorized',
      text: 'You must be logged in to leave an event.',
    }).then(() => {
      router.push("/login");
    });
    return;
  }

  swal.fire({
    title: 'Are you sure?',
    text: 'Are you sure you want to leave this event?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, leave it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await eventStore.leaveEvent(eventId);
        // Remove the event from the local array without needing to refetch
        joinedEvents.value = joinedEvents.value.filter(event => event.id !== eventId);
        swal.fire({
          icon: 'success',
          title: 'Left Event',
          text: 'You have successfully left the event.',
        });
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Leave Failed',
          text: error.response?.data?.message || 'Failed to leave event.',
        });
        console.error("Error leaving event:", error);
      }
    }
  });
};
</script>