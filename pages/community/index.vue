<template>
  <div class="communities-container">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Communities</h1>
      <p class="text-gray-600 mt-2">
        Discover communities to join and connect with like-minded people
      </p>
    </div>

    <!-- Search and Filter Section -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search Input -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            id="search"
            v-model="searchQuery"
            placeholder="Search communities..."
            class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            @input="debouncedSearch"
          />
        </div>

        <!-- Type Filter -->
        <div>
          <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            id="type"
            v-model="selectedType"
            class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            @change="loadCommunities"
          >
            <option value="">All Types</option>
            <option value="health">Health</option>
            <option value="fitness">Fitness</option>
            <option value="wellness">Wellness</option>
            <option value="support">Support</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Location Filter -->
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            id="location"
            v-model="locationFilter"
            placeholder="Filter by location..."
            class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            @input="debouncedSearch"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="communities.length === 0" class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No communities found</h3>
      <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
    </div>

    <!-- Communities Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="community in communities" 
        :key="community.id" 
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <!-- Community Card -->
        <div class="h-32 bg-gray-200 relative">
          <img 
            v-if="community.banner" 
            :src="community.banner" 
            :alt="`${community.name} banner`" 
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full bg-gradient-to-r from-green-400 to-blue-500"></div>
          
          <!-- Community Logo -->
          <div class="absolute -bottom-6 left-4">
            <div class="w-16 h-16 rounded-full bg-white p-1 shadow-md">
              <img 
                v-if="community.logo" 
                :src="community.logo" 
                :alt="`${community.name} logo`" 
                class="w-full h-full rounded-full object-cover"
              />
              <div v-else class="w-full h-full rounded-full bg-green-100 flex items-center justify-center">
                <span class="text-2xl font-bold text-green-700">{{ community.name.charAt(0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Community Info -->
        <div class="p-4 pt-8">
          <div class="flex justify-between items-start">
            <h3 class="text-xl font-semibold text-gray-800">{{ community.name }}</h3>
            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{{ community.type || 'Community' }}</span>
          </div>
          
          <p class="text-sm text-gray-500 mt-1">@{{ community._tag }}</p>
          
          <p class="text-sm text-gray-600 mt-3 line-clamp-2">
            {{ community.description || 'No description available' }}
          </p>
          
          <div class="flex items-center mt-3 text-sm text-gray-500">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{{ community.members_count || 0 }} members</span>
          </div>
          
          <div v-if="community.location" class="flex items-center mt-2 text-sm text-gray-500">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ community.location }}</span>
          </div>
          
          <div class="mt-4 flex justify-between items-center">
            <NuxtLink 
              :to="`/community/${community.id}`" 
              class="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View details
            </NuxtLink>
            
            <button 
              v-if="community.is_member" 
              @click="leaveCommunity(community.id)"
              class="px-3 py-1 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50 transition"
              :disabled="actionInProgress"
            >
              Leave
            </button>
            <button 
              v-else 
              @click="joinCommunity(community.id)"
              class="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700 transition"
              :disabled="actionInProgress"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="pagination && pagination.total > 0" class="mt-8 flex justify-center">
      <nav class="flex items-center space-x-2">
        <button 
          @click="goToPage(1)" 
          class="px-3 py-1 rounded border" 
          :class="{ 'bg-gray-200': pagination.current_page === 1, 'hover:bg-gray-100': pagination.current_page !== 1 }"
          :disabled="pagination.current_page === 1"
        >
          First
        </button>
        
        <button 
          @click="goToPage(pagination.current_page - 1)" 
          class="px-3 py-1 rounded border hover:bg-gray-100"
          :disabled="pagination.current_page === 1"
        >
          Prev
        </button>
        
        <span class="text-sm text-gray-600">
          Page {{ pagination.current_page }} of {{ pagination.last_page }}
        </span>
        
        <button 
          @click="goToPage(pagination.current_page + 1)" 
          class="px-3 py-1 rounded border hover:bg-gray-100"
          :disabled="pagination.current_page === pagination.last_page"
        >
          Next
        </button>
        
        <button 
          @click="goToPage(pagination.last_page)" 
          class="px-3 py-1 rounded border"
          :class="{ 'bg-gray-200': pagination.current_page === pagination.last_page, 'hover:bg-gray-100': pagination.current_page !== pagination.last_page }"
          :disabled="pagination.current_page === pagination.last_page"
        >
          Last
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCommunityStore } from '@/stores/communityStore';
import { useAuthStore } from '@/stores/authStore';
import { useNuxtApp } from '#app';

// Initialize stores
const communityStore = useCommunityStore();
const authStore = useAuthStore();
const { $toast } = useNuxtApp();

// Reactive state
const communities = ref([]);
const pagination = ref(null);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const selectedType = ref('');
const locationFilter = ref('');
const actionInProgress = ref(false);
const currentPage = ref(1);

// Initialize page
onMounted(async () => {
  await loadCommunities();
  
  // If user is logged in, also fetch user's communities
  if (authStore.isAuthenticated) {
    try {
      await communityStore.fetchUserCommunities();
    } catch (err) {
      console.error('Failed to load user communities', err);
    }
  }
});

// Search with debounce
let searchTimer = null;
const debouncedSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1; // Reset to first page when searching
    loadCommunities();
  }, 500);
};

// Load communities with current filters
const loadCommunities = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const params = {
      search: searchQuery.value,
      type: selectedType.value,
      user_location: locationFilter.value,
      page: currentPage.value,
      per_page: 12 // Number of communities per page
    };
    
    const result = await communityStore.fetchCommunities(params);
    communities.value = result.communities;
    pagination.value = result.pagination;
  } catch (err) {
    error.value = 'Failed to load communities. Please try again later.';
    console.error('Error loading communities:', err);
  } finally {
    loading.value = false;
  }
};

// Pagination navigation
const goToPage = (page) => {
  if (page < 1 || page > pagination.value.last_page) return;
  
  currentPage.value = page;
  loadCommunities();
  
  // Scroll to top of results
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// Join community
const joinCommunity = async (communityId) => {
  if (!authStore.isAuthenticated) {
    $toast.error('Please log in to join communities');
    return;
  }
  
  actionInProgress.value = true;
  
  try {
    await communityStore.joinCommunity(communityId);
    $toast.success('Successfully joined community!');
    
    // Update the community in the list to show as joined
    const communityIndex = communities.value.findIndex(c => c.id === communityId);
    if (communityIndex !== -1) {
      communities.value[communityIndex].is_member = true;
    }
  } catch (err) {
    $toast.error(err.message || 'Failed to join community');
  } finally {
    actionInProgress.value = false;
  }
};

// Leave community
const leaveCommunity = async (communityId) => {
  if (!authStore.isAuthenticated) {
    $toast.error('Please log in to perform this action');
    return;
  }
  
  actionInProgress.value = true;
  
  try {
    await communityStore.leaveCommunity(communityId);
    $toast.success('Successfully left community');
    
    // Update the community in the list to show as not joined
    const communityIndex = communities.value.findIndex(c => c.id === communityId);
    if (communityIndex !== -1) {
      communities.value[communityIndex].is_member = false;
    }
  } catch (err) {
    $toast.error(err.message || 'Failed to leave community');
  } finally {
    actionInProgress.value = false;
  }
};
</script>

<style scoped>
.communities-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

/* Add line-clamp utility for truncating descriptions */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>