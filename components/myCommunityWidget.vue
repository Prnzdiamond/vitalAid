<template>
  <div class="bg-white rounded-lg shadow-md p-5 mb-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800">My Communities</h2>
      <NuxtLink 
        to="/community/my-communities" 
        class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
      >
        View all <i class="fas fa-arrow-right ml-1"></i>
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-6">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
    </div>

    <!-- Not Logged In State -->
    <div v-else-if="!authStore.isAuthenticated" class="bg-gray-50 rounded py-6 text-center">
      <p class="text-gray-600 mb-3">Sign in to see your communities</p>
      <NuxtLink 
        to="/login" 
        class="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
      >
        Sign In
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div v-else-if="userCommunities.length === 0" class="bg-gray-50 rounded py-6 text-center">
      <p class="text-gray-600 mb-3">You haven't joined any communities yet</p>
      <NuxtLink 
        to="/community" 
        class="inline-block px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
      >
        Explore Communities
      </NuxtLink>
    </div>

    <!-- Communities List -->
    <div v-else class="space-y-3">
      <div 
        v-for="community in displayedCommunities" 
        :key="community.id" 
        class="flex items-center hover:bg-gray-50 p-2 rounded transition"
      >
        <!-- Community Logo -->
        <div class="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden flex-shrink-0">
          <img 
            v-if="community.logo" 
            :src="community.logo" 
            :alt="`${community.name} logo`" 
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full bg-green-100 flex items-center justify-center">
            <span class="text-lg font-bold text-green-700">{{ community.name.charAt(0) }}</span>
          </div>
        </div>
        
        <!-- Community Info -->
        <div class="flex-grow min-w-0">
          <div class="font-medium text-gray-800 truncate">{{ community.name }}</div>
          <div class="text-xs text-gray-500 flex items-center">
            <span class="truncate">{{ community._tag }}</span>
            <span class="mx-1">•</span>
            <span 
              class="px-1.5 py-0.5 rounded-full text-xs"
              :class="getRoleBadgeClass(community.member_role)"
            >
              {{ getRoleLabel(community.member_role) }}
            </span>
          </div>
        </div>
        
        <!-- Quick View Button -->
        <NuxtLink 
          :to="`/community/${community.id}`" 
          class="ml-2 text-blue-600 hover:text-blue-800"
        >
          <i class="fas fa-chevron-right"></i>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCommunityStore } from '@/stores/communityStore';
import { useAuthStore } from '@/stores/authStore';

// Props
const props = defineProps({
  maxDisplay: {
    type: Number,
    default: 5
  }
});

// Initialize stores
const communityStore = useCommunityStore();
const authStore = useAuthStore();

// Reactive state
const loading = ref(true);

// Computed properties
const userCommunities = computed(() => communityStore.userCommunities || []);

const displayedCommunities = computed(() => {
  return userCommunities.value.slice(0, props.maxDisplay);
});

// Load data on mount
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await communityStore.fetchUserCommunities();
    } catch (err) {
      console.error('Error loading user communities:', err);
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
});

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
    case 'moderator': return 'Mod';
    default: return 'Member';
  }
};
</script>