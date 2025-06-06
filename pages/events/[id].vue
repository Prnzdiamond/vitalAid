<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="event" class="space-y-8">
      <button class="inline-flex items-center text-green-600 hover:text-green-700 font-medium" @click="router.back()">
        <i class="fas fa-arrow-left mr-2"></i>
        Back
      </button>

      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="h-64 bg-gray-100 relative">
          <img
            v-if="event.banner_url"
            :src="event.banner_url"
            :alt="event.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <i class="fas fa-image text-6xl"></i>
          </div>
          
          <!-- Event Status Badge -->
          <div v-if="isEventCompleted" class="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full font-medium shadow-md">
            <i class="fas fa-check-circle mr-1"></i> Completed
          </div>
        </div>

        <div class="p-6">
          <div class="flex items-center mb-2">
            <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {{ event.category || 'General' }}
            </span>
          </div>

          <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ event.title }}</h1>

          <div v-if="event.event_manager_name" class="flex items-center text-sm text-gray-500 mb-6">
            <i class="fas fa-user mr-2"></i>
            Organized by {{ event.event_manager_name }}
          </div>

          <div class="mb-6">
            <div class="flex items-center text-gray-600 mb-2">
              <i class="fas fa-clock text-green-500 mr-2"></i>
              {{ new Date(event.start_time).toLocaleString() }} - {{ new Date(event.end_time).toLocaleString() }}
            </div>
            <div class="flex items-center text-gray-600">
              <i class="fas fa-map-marker-alt text-green-500 mr-2"></i>
              {{ event.location }}
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button
              v-if="token.get() && !isEventCreator && !hasJoinedEvent && !isEventCompleted"
              class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg flex items-center justify-center transition-colors shadow-md"
              @click="joinThisEvent(event.id)"
            >
              <i class="fas fa-user-plus mr-2"></i>
              Join Event
            </button>
            <button
              v-if="token.get() && !isEventCreator && hasJoinedEvent && !isEventCompleted"
              class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg flex items-center justify-center transition-colors shadow-md"
              @click="leaveThisEvent(event.id)"
            >
              <i class="fas fa-user-minus mr-2"></i>
              Leave Event
            </button>
            <NuxtLink
              v-if="token.get() && isEventCreator && !isEventCompleted"
              :to="`/events/edit/${event.id}`"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-md"
            >
              <i class="fas fa-edit mr-2"></i>
              Edit Event
            </NuxtLink>
            <button
              v-if="token.get() && isEventCreator && !isEventCompleted"
              class="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-md"
              @click="deleteThisEvent(event.id)"
            >
              <i class="fas fa-trash-alt mr-2"></i>
              Delete Event
            </button>
            <button
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-3 rounded-lg transition-colors shadow-md"
              @click="getParticipants(event.id)"
            >
              <i class="fas fa-users mr-2"></i>
              {{ showParticipants ? 'Hide Participants' : 'View Participants' }}
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">About this event</h2>
        <div class="prose max-w-none text-gray-700 whitespace-pre-line">{{ event.description }}</div>
      </div>

      <div v-if="showParticipants && participants.length" class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Participants</h2>
        <div class="max-h-60 overflow-y-auto">
          <ul class="divide-y divide-gray-200">
            <li v-for="participant in participants" :key="participant._id" class="py-4">
              <div class="flex items-center">
                <i class="fas fa-user-circle text-gray-400 mr-3 text-xl"></i>
                <p class="font-medium text-gray-800">User ID: {{ participant.user_tag }}</p>
              </div>
            </li>
          </ul>
          <div v-if="participants.length > 5" class="mt-4 text-sm text-gray-500 text-center">
            Showing top 5 participants. <button @click="fetchAllParticipants" class="text-green-600 hover:underline">View All</button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <EventReaction :eventId="eventId" :event="event" />
      </div>

      <NuxtLink to="/event" class="inline-block mt-6 text-green-600 hover:underline font-medium">
        <i class="fas fa-arrow-left mr-2"></i>
        Back to Events
      </NuxtLink>
    </div>
    <div v-else class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
      Loading event details...
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth-optional'
})
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEventStore } from '@/stores/eventStore';
import { useToken } from '@/composables/useToken';
import { useAuthStore } from '@/stores/authStore';
import { useSwal } from '@/composables/useSwal';
import EventReaction from '~/components/EventReaction.vue';

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const token = useToken();
const authStore = useAuthStore();
const event = ref(null);
const eventId = route.params.id;
const participants = ref([]);
const showParticipants = ref(false);
const loading = ref(true);
const error = ref(null);
const userJoinedEvents = ref([]);
const { swal, toast } = useSwal();

const isEventCreator = computed(() => {
  return token.get() && event.value && authStore.user?.id === event.value.event_manager;
});

const hasJoinedEvent = computed(() => {
  return userJoinedEvents.value.some(joinedEvent => 
    joinedEvent.id === eventId || joinedEvent === eventId
  );
});

// New computed property to check if event is completed
const isEventCompleted = computed(() => {
  if (!event.value) return false;
  
  // Check if event status is explicitly marked as 'completed'
  if (event.value.status === 'completed') return true;
  
  // Check if end time has passed (as a fallback)
  const now = new Date();
  const endTime = new Date(event.value.end_time);
  return endTime < now;
});

onMounted(async () => {
  try {
    // Load the event data
    event.value = await eventStore.fetchEvent(eventId);
    
    // If user is logged in, fetch their joined events
    if (token.get()) {
      userJoinedEvents.value = await eventStore.fetchUserEvents();
    }
  } catch (err) {
    swal.fire({
      icon: 'error',
      title: 'Fetch Error',
      text: 'Unable to fetch event details. Please try again later.',
    });
    error.value = 'Unable to fetch event details. Please try again later.';
    console.error('Error fetching event:', err);
  } finally {
    loading.value = false;
  }
});

const getParticipants = async (eventId) => {
  if (!showParticipants.value) {
    try {
      participants.value = await eventStore.getEventParticipants(eventId);
    } catch (err) {
      console.error('Error fetching participants:', err);
      swal.fire({
        icon: 'error',
        title: 'Fetch Error',
        text: 'Failed to fetch participants.',
      });
    }
  }
  showParticipants.value = !showParticipants.value;
};

const fetchAllParticipants = async () => {
  try {
    // We're keeping the same function signature but adding a note that 
    // currently the API doesn't support pagination for participants
    participants.value = await eventStore.getEventParticipants(eventId);
  } catch (err) {
    console.error('Error fetching all participants:', err);
    swal.fire({
      icon: 'error',
      title: 'Fetch Error',
      text: 'Failed to fetch all participants.',
    });
  }
};

const joinThisEvent = async (eventId) => {
  if (!token.get()) {
    swal.fire({
      icon: 'warning',
      title: 'Unauthorized',
      text: 'You must be logged in to join an event.',
    });
    return;
  }
  
  // Extra check to prevent joining completed events
  if (isEventCompleted.value) {
    swal.fire({
      icon: 'warning',
      title: 'Event Completed',
      text: 'This event has already been completed and is no longer accepting new participants.',
    });
    return;
  }
  
  try {
    await eventStore.joinEvent(eventId);
    // Refresh user joined events list
    userJoinedEvents.value = await eventStore.fetchUserEvents();
    
    swal.fire({
      icon: 'success',
      title: 'Joined Event',
      text: 'Successfully joined event!',
    });
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to join event.';
    swal.fire({
      icon: 'error',
      title: 'Join Error',
      text: errorMessage,
    });
    console.error('Error joining event:', err);
  }
};

const leaveThisEvent = async (eventId) => {
  if (!token.get()) {
    swal.fire({
      icon: 'warning',
      title: 'Unauthorized',
      text: 'You must be logged in to leave an event.',
    });
    return;
  }
  
  // Extra check to prevent leaving completed events
  if (isEventCompleted.value) {
    swal.fire({
      icon: 'warning',
      title: 'Event Completed',
      text: 'This event has already been completed. You cannot leave a completed event.',
    });
    return;
  }

  swal.fire({
    title: 'Are you sure?',
    text: "Are you sure you want to leave this event?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, leave it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await eventStore.leaveEvent(eventId);
        // Refresh user joined events list
        userJoinedEvents.value = await eventStore.fetchUserEvents();
        
        swal.fire({
          icon: 'success',
          title: 'Left Event',
          text: 'Successfully left the event.',
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to leave event.';
        swal.fire({
          icon: 'error',
          title: 'Leave Error',
          text: errorMessage,
        });
        console.error('Error leaving event:', err);
      }
    }
  });
};

const deleteThisEvent = async (eventId) => {
  if (!token.get()) {
    swal.fire({
      icon: 'warning',
      title: 'Unauthorized',
      text: 'You must be logged in to delete an event.',
    });
    return;
  }
  
  // Extra check to prevent deleting completed events
  if (isEventCompleted.value) {
    swal.fire({
      icon: 'warning',
      title: 'Event Completed',
      text: 'This event has already been completed and cannot be deleted.',
    });
    return;
  }

  swal.fire({
    title: 'Are you sure?',
    text: "Are you sure you want to delete this event?",
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
        }).then(() => {
          router.push('/event');
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete event.';
        swal.fire({
          icon: 'error',
          title: 'Delete Error',
          text: errorMessage,
        });
        console.error('Error deleting event:', err);
      }
    }
  });
};
</script>