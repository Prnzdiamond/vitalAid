<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-green-700 mb-2">Volunteer Events</h1>
          <p class="text-gray-600">Discover opportunities to contribute and make a difference</p>
        </div>

        <NuxtLink
          :to="token.get() ? '/events/create' : '/login'"
          class="mt-4 md:mt-0 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-md"
        >
          <i class="fas fa-plus mr-2"></i>
          {{ token.get() ? 'Create Event' : 'Sign in to Create' }}
        </NuxtLink>
      </div>

      <div class="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-grow">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search events..."
              class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              @input="debounceSearch"
            />
          </div>
          <div class="flex flex-wrap gap-2">
            <select
              v-model="categoryFilter"
              class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              @change="applyFilters"
            >
              <option value="">All Categories</option>
              <option value="environment">Environment</option>
              <option value="community">Community</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
              <option value="animal-welfare">Animal Welfare</option>
              <option value="other">Other</option>
            </select>
            
            <select
              v-model="timeFrameFilter"
              class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              @change="applyFilters"
            >
              <option value="upcoming">Upcoming Events</option>
              <option value="past">Past Events</option>
              <option value="">All Events</option>
            </select>
            
            <button
              @click="toggleMyEvents"
              :class="[
                'px-3 py-2 rounded-md transition-colors',
                showMyEvents
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
              v-if="token.get()"
            >
              My Events
            </button>  
            <NuxtLink
      to="/my-events/joined"
      class="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors flex items-center text-sm font-medium"
      v-if="token.get()"
      >
      <i class="fas fa-bookmark mr-1"></i>
      Joined Events
      </NuxtLink>
      
      <NuxtLink
      to="/my-events/created"
      class="px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md transition-colors flex items-center text-sm font-medium"
      v-if="token.get()"
      >
      <i class="fas fa-plus-circle mr-1"></i>
      Created Events
      </NuxtLink>
          </div>
          
        </div>
      </div>
      <!-- Community filter indicator -->
<div v-if="hasCommunityFilter" class="mt-2 bg-blue-50 p-3 rounded-md flex items-center justify-between">
  <div class="flex items-center">
    <i class="fas fa-filter text-green-600 mr-2"></i>
    <span class="text-green-800">Showing events from community</span>
  </div>
  <button
    @click="clearCommunityFilter"
    class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
  >
    <i class="fas fa-times mr-1"></i>
    Show All Communities
  </button>
</div>

      <div v-if="loading" class="text-center py-8">
        <i class="fas fa-spinner fa-spin fa-2x text-green-600"></i>
        <p class="mt-2 text-gray-600">Loading events...</p>
      </div>

      <div v-else-if="filteredEvents.length === 0" class="bg-white rounded-xl shadow p-10 text-center">
        <div class="flex justify-center mb-4">
          <i class="fas fa-calendar-alt fa-4x text-gray-400 mb-4"></i>
        </div>
        <h3 class="text-xl font-medium text-gray-700">No events found</h3>
        <p class="text-gray-500 mt-2">
          {{ searchQuery || categoryFilter || timeFrameFilter || showMyEvents
            ? 'Try adjusting your filters or search terms'
            : 'Be the first to create a volunteer event!' }}
        </p>
        <NuxtLink
          v-if="token.get() && !searchQuery && !categoryFilter && !timeFrameFilter"
          to="/events/create"
          class="mt-4 inline-block px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Create an Event
        </NuxtLink>
      </div>

      <div v-else>
        <!-- Time frame header -->
        <div v-if="timeFrameFilter !== 'past'" class="mb-4">
          <h2 class="text-xl font-semibold text-green-700 border-b border-green-200 pb-2">
            {{ timeFrameFilter === 'upcoming' ? 'Upcoming Events' : 'All Events' }}
          </h2>
        </div>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
            :class="{'border-l-4 border-amber-400': isPastEvent(event)}"
          >
            <div class="h-45 bg-gray-100 relative">
              <img
                v-if="event.banner_url"
                :src="event.banner_url"
                :alt="event.title"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <i class="fas fa-image fa-3x"></i>
              </div>
              
              <!-- Event status badge -->
              <div 
                v-if="isPastEvent(event)" 
                class="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium"
              >
                Past Event
              </div>
              <div 
                v-else-if="event.status === 'completed'" 
                class="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium"
              >
                Completed
              </div>
            </div>

            <div class="p-5 flex flex-col flex-grow">
              <div class="text-sm text-green-600 font-medium mb-2">
                {{ event.category || 'General' }}
              </div>

              <h2 class="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{{ event.title }}</h2>

              <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ event.description }}</p>

              <div class="mt-auto">
                <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2" v-if="event.capacity">
                  <div
                    class="bg-green-600 h-2.5 rounded-full"
                    :style="`width: ${Math.min(100, (event.participants_count / event.capacity) * 100)}%`"
                  ></div>
                </div>
                <div class="flex justify-between text-sm text-gray-500 mb-4" v-if="event.capacity">
                  <span>{{ event.participants_count }} joined</span>
                  <span>{{ event.capacity }} capacity</span>
                </div>
                <div class="text-sm text-gray-600 space-y-1 mb-3">
                  <div class="flex items-center">
                    <i class="fas fa-map-marker-alt w-4 h-4 mr-2 text-green-600"></i>
                    {{ event.location }}
                  </div>
                  <div class="flex items-center">
                    <i class="fas fa-clock w-4 h-4 mr-2 text-green-600"></i>
                    {{ formatDate(event.start_time) }}
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2 mb-3">
                  <span v-if="event.requires_verification" class="inline-flex items-center text-xs text-amber-800 bg-amber-100 px-2 py-1 rounded">
                    <i class="fas fa-shield-alt w-3 h-3 mr-1"></i>
                    Requires Approval
                  </span>
                  <span v-if="event.provides_certificate" class="inline-flex items-center text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded">
                    <i class="fas fa-certificate w-3 h-3 mr-1"></i>
                    Certificate Provided
                  </span>
                </div>

                <div v-if="event.status === 'completed'">
                  <EventReactionSummary :eventId="event.id" />
                </div>

                <div class="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <NuxtLink :to="`/events/${event.id}`" class="text-green-600 hover:text-green-800 text-sm font-medium">
                    View Details
                  </NuxtLink>

                  <div>
                    <button
                     v-if="token.get() && !isUserJoined(event.id) && !isPastEvent(event)"
                      class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      @click.stop="joinEvent(event.id)"
                    >
                      Join
                    </button>
                    <span
                      v-else-if="token.get() && isUserJoined(event.id)"
                      class="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded"
                    >
                      Joined
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination controls -->
        <div v-if="pagination && pagination.last_page > 1" class="mt-8 flex justify-center">
          <div class="flex space-x-2">
            <button 
              @click="changePage(pagination.current_page - 1)" 
              :disabled="pagination.current_page === 1"
              class="px-4 py-2 rounded-md border"
              :class="pagination.current_page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <template v-for="page in paginationPages" :key="page">
              <button 
                @click="changePage(page)" 
                class="px-4 py-2 rounded-md border"
                :class="page === pagination.current_page ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
              >
                {{ page }}
              </button>
            </template>
            
            <button 
              @click="changePage(pagination.current_page + 1)" 
              :disabled="pagination.current_page === pagination.last_page"
              class="px-4 py-2 rounded-md border"
              :class="pagination.current_page === pagination.last_page ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useEventStore } from "@/stores/eventStore";
import { useToken } from "@/composables/useToken";
import { useRouter,useRoute } from "vue-router";
import { useSwal } from "@/composables/useSwal";
import EventReactionSummary from "~/components/EventReactionSummary.vue";

const eventStore = useEventStore();
const token = useToken();
const router = useRouter();
const route = useRoute();
const { swal } = useSwal();

// Search and filter state
const searchQuery = ref('');
const categoryFilter = ref('');
const timeFrameFilter = ref('upcoming'); // Default to upcoming events
const showMyEvents = ref(false);
const currentPage = ref(1);
const pagination = ref(null);
const communityFilter = ref('');

// Event data
const events = ref([]);
const userEvents = ref([]);
const loading = ref(true);

const { community } = route.query;
if (community) {
  communityFilter.value = community;
}

// Add this computed property to check if a community filter is active
const hasCommunityFilter = computed(() => !!communityFilter.value);

// Add a function to clear the community filter
const clearCommunityFilter = () => {
  communityFilter.value = '';
  applyFilters();
  // Update the URL without the community parameter
  router.replace({ query: { ...route.query, community: undefined } });
};
// Search debounce
let searchTimeout = null;
const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1; // Reset to first page on new search
    applyFilters();
  }, 500);
};

// Check if user has joined an event
const isUserJoined = (eventId) => {
  return userEvents.value.some(event => event.id === eventId);
};

// Format date helper
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

// Check if event is in the past
const isPastEvent = (event) => {
  if (event.status === 'completed') return true;
  const now = new Date();
  const endTime = new Date(event.end_time);
  return endTime < now;
};

// Computed properties
const filteredEvents = computed(() => {
  return events.value;
});

// Pagination helper to determine which page buttons to show
const paginationPages = computed(() => {
  if (!pagination.value) return [];
  
  const pages = [];
  const totalPages = pagination.value.last_page;
  const currentPageVal = pagination.value.current_page;
  
  // Always include first page, last page, current page, and one page before and after current
  const pagesToInclude = new Set([
    1,
    totalPages,
    currentPageVal,
    Math.max(1, currentPageVal - 1),
    Math.min(totalPages, currentPageVal + 1)
  ]);
  
  // Convert set to sorted array
  return Array.from(pagesToInclude).sort((a, b) => a - b);
});

// Change page and reload events
const changePage = (page) => {
  if (page < 1 || page > pagination.value?.last_page) return;
  currentPage.value = page;
  fetchEvents();
};

// Toggle "My Events" filter
const toggleMyEvents = () => {
  showMyEvents.value = !showMyEvents.value;
  currentPage.value = 1; // Reset to first page
  applyFilters();
};

// Apply all filters and search
const applyFilters = () => {
  currentPage.value = 1; // Reset to first page when filters change
  fetchEvents();
};

// Main function to fetch events with current filters
const fetchEvents = async () => {
  try {
    loading.value = true;
    
    // Build query parameters for API request
    const params = {
      page: currentPage.value,
      per_page: 12,
      time_frame: timeFrameFilter.value,
      category: categoryFilter.value,
      search: searchQuery.value,
      communityID: communityFilter.value, 
    };
    
    // Use the new paginated API endpoint
    const result = await eventStore.fetchEvents(params);
      events.value = result.events;
    console.log(events.value)
    pagination.value = result.pagination;
    
    // Fetch user events if logged in
    if (token.get() && showMyEvents.value) {
      userEvents.value = await eventStore.fetchUserEvents();
      
      // If "My Events" is toggled, filter the events client-side
      if (showMyEvents.value) {
        const userEventIds = new Set(userEvents.value.map(e => e.id));
        events.value = events.value.filter(event => userEventIds.has(event.id));
      }
    } else if (token.get()) {
      userEvents.value = await eventStore.fetchUserEvents();
    }
  } catch (error) {
    console.error("Failed to load events:", error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load events. Please try again later.',
    });
  } finally {
    loading.value = false;
  }
};

// Join event function
const joinEvent = async (eventId) => {
  if (!token.get()) {
    swal.fire({
      icon: 'warning',
      title: 'Unauthorized',
      text: 'You must be logged in to join an event.',
    }).then(() => {
      router.push("/login");
    });
    return;
  }

  try {
    await eventStore.joinEvent(eventId);
    userEvents.value = await eventStore.fetchUserEvents();
    swal.fire({
      icon: 'success',
      title: 'Joined Event',
      text: 'You have successfully joined this event!',
    });
  } catch (error) {
    console.error("Failed to join event:", error);
    swal.fire({
      icon: 'error',
      title: 'Join Failed',
      text: error.response?.data?.message || "Failed to join event.",
    });
  }
};

// Initialize page
onMounted(async () => {
  await fetchEvents();
});

// Watch for changes in token to reload user events
watch(() => token.get(), async (newToken) => {
  if (newToken) {
    userEvents.value = await eventStore.fetchUserEvents();
  } else {
    userEvents.value = [];
  }
});
</script>