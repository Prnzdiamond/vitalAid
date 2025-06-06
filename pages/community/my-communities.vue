<template>
  <div class="my-communities-container max-w-7xl mx-auto p-4">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">My Communities</h1>
      <p class="text-gray-600 mt-2">
        Communities you've joined and are participating in
      </p>
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

    <!-- Not Logged In State -->
    <div v-else-if="!authStore.isAuthenticated" class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-8 rounded-lg mb-6 text-center">
      <div class="mb-4">
        <i class="fas fa-user-lock text-4xl"></i>
      </div>
      <h3 class="text-xl font-semibold mb-2">Please Sign In</h3>
      <p class="mb-4">You need to be logged in to view your communities</p>
      <NuxtLink 
        to="/login" 
        class="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded shadow-md hover:bg-blue-700 transition"
      >
        Sign In
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div v-else-if="userCommunities.length === 0" class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
      <i class="fas fa-users text-4xl text-gray-400 mb-3"></i>
      <h3 class="text-xl font-medium text-gray-800 mb-2">You haven't joined any communities yet</h3>
      <p class="text-gray-600 mb-6">Explore communities to connect with like-minded people</p>
      <NuxtLink 
        to="/community" 
        class="inline-block px-6 py-2.5 bg-green-600 text-white font-medium text-sm rounded shadow-md hover:bg-green-700 transition"
      >
        Explore Communities
      </NuxtLink>
    </div>

    <!-- Communities List -->
    <div v-else>
      <!-- Filter By Role (if needed) -->
      <div class="mb-6">
        <div class="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-3">
          <button 
            @click="selectedRole = ''"
            class="px-4 py-2 rounded-full text-sm font-medium transition"
            :class="selectedRole === '' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
          >
            All ({{ userCommunities.length }})
          </button>
          <button 
            @click="selectedRole = 'admin'"
            class="px-4 py-2 rounded-full text-sm font-medium transition"
            :class="selectedRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
          >
            Admin ({{ adminCount }})
          </button>
          <button 
            @click="selectedRole = 'moderator'"
            class="px-4 py-2 rounded-full text-sm font-medium transition"
            :class="selectedRole === 'moderator' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
          >
            Moderator ({{ moderatorCount }})
          </button>
          <button 
            @click="selectedRole = 'member'"
            class="px-4 py-2 rounded-full text-sm font-medium transition"
            :class="selectedRole === 'member' ? 'bg-gray-100 text-gray-800 border-2 border-gray-300' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
          >
            Member ({{ memberCount }})
          </button>
        </div>
      </div>

      <!-- Communities Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="community in filteredCommunities" 
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
            
            <!-- Role Badge -->
            <div class="absolute top-2 right-2">
              <span 
                class="text-xs font-medium px-2 py-1 rounded-full"
                :class="getRoleBadgeClass(community.member_role)"
              >
                {{ getRoleLabel(community.member_role) }}
              </span>
            </div>
            
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
              <i class="fas fa-users mr-2"></i>
              <span>{{ community.members_count || 0 }} members</span>
            </div>
            
            <div v-if="community.location" class="flex items-center mt-2 text-sm text-gray-500">
              <i class="fas fa-map-marker-alt mr-2"></i>
              <span>{{ community.location }}</span>
            </div>
            
            <!-- Joined Date -->
            <div class="flex items-center mt-2 text-sm text-gray-500">
              <i class="fas fa-calendar-check mr-2"></i>
              <span>Joined {{ formatDate(community.joined_at) }}</span>
            </div>
            
            <!-- Action Buttons -->
            <div class="mt-4 flex justify-between items-center">
              <NuxtLink 
                :to="`/community/${community.id}`" 
                class="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
              >
                <i class="fas fa-eye mr-1"></i> View
              </NuxtLink>
              
              <!-- Admin actions -->
              <div v-if="community.member_role === 'admin'" class="flex items-center space-x-2">
                <NuxtLink 
                  :to="`/community/${community.id}/edit`" 
                  class="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center"
                >
                  <i class="fas fa-edit mr-1"></i> Edit
                </NuxtLink>
                
                <button 
                  @click="leaveCommunity(community.id)"
                  class="px-3 py-1 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50 transition"
                  :disabled="actionInProgress"
                >
                  <i class="fas fa-sign-out-alt"></i>
                </button>
              </div>
              
              <!-- Regular member actions -->
              <div v-else>
                <button 
                  @click="confirmLeaveCommunity(community.id, community.name)"
                  class="px-3 py-1 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50 transition flex items-center"
                  :disabled="actionInProgress"
                >
                  <i class="fas fa-sign-out-alt mr-1"></i> Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty search results -->
      <div v-if="userCommunities.length > 0 && filteredCommunities.length === 0" class="text-center py-10">
        <p class="text-gray-600">No communities found matching the selected filter.</p>
      </div>
    </div>
  </div>
</template>

<script setup>

definePageMeta({
  middleware: 'auth'
})
import { ref, onMounted, computed } from 'vue';
import { useCommunityStore } from '@/stores/communityStore';
import { useAuthStore } from '@/stores/authStore';
import { useNuxtApp } from '#app';

// Initialize stores
const communityStore = useCommunityStore();
const authStore = useAuthStore();
const { $toast } = useNuxtApp();
const { swal } = useSwal();

// Reactive state
const loading = ref(true);
const error = ref(null);
const actionInProgress = ref(false);
const selectedRole = ref(''); // Filter by role: '', 'admin', 'moderator', 'member'

// Computed properties
const userCommunities = computed(() => communityStore.userCommunities || []);

const filteredCommunities = computed(() => {
  if (!selectedRole.value) return userCommunities.value;
  return userCommunities.value.filter(community => community.member_role === selectedRole.value);
});



const adminCount = computed(() => 
  userCommunities.value.filter(community => community.member_role === 'admin').length
);

const moderatorCount = computed(() => 
  userCommunities.value.filter(community => community.member_role === 'moderator').length
);

const memberCount = computed(() => 
  userCommunities.value.filter(community => community.member_role === 'member').length
);

// Fetch data on mount
onMounted(async () => {
  await loadUserCommunities();
});

// Functions
const loadUserCommunities = async () => {
  if (!authStore.isAuthenticated) {
    loading.value = false;
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    await communityStore.fetchUserCommunities();
  } catch (err) {
    console.error('Error loading user communities:', err);
    error.value = 'Failed to load your communities. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const confirmLeaveCommunity = (communityId, communityName) => {
  swal.fire({
    title: "Leave Community?",
    text: `Are you sure you want to leave "${communityName}"?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, leave community",
  }).then((result) => {
    if (result.isConfirmed) leaveCommunity(communityId);
  });
};

const leaveCommunity = async (communityId) => {
  if (!authStore.isAuthenticated) {
    $toast.error('Please log in to perform this action');
    return;
  }
  
  actionInProgress.value = true;
  
  try {
    await communityStore.leaveCommunity(communityId);
    $toast.success('Successfully left community');
  } catch (err) {
    $toast.error(err.message || 'Failed to leave community');
  } finally {
    actionInProgress.value = false;
  }
};

// Helper functions
const getRoleBadgeClass = (role) => {
  switch(role) {
    case 'admin': return 'bg-purple-100 text-purple-800';
    case 'moderator': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getRoleLabel = (role) => {
  switch(role) {
    case 'admin': return 'Admin';
    case 'moderator': return 'Moderator';
    default: return 'Member';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    // Less than a week ago
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    // Less than a month ago
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    // Format as date
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>