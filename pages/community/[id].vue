<template>
  <div class="max-w-7xl mx-auto p-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-24">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <div v-else>
      <!-- Community Banner and Header -->
      <div class="relative">
        <!-- Banner Image -->
        <div class="h-64 bg-gray-200 w-full overflow-hidden">
          <img 
            v-if="community.banner" 
            :src="community.banner" 
            :alt="`${community.name} banner`" 
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full bg-gradient-to-r from-green-400 to-blue-500"></div>
        </div>
        
        <!-- Community Info Overlay -->
        <div class="absolute -bottom-16 left-8 flex items-end md:flex-row flex-col md:items-end items-center">
          <!-- Logo/Avatar -->
          <div class="w-32 h-32 rounded-full bg-white p-2 shadow-lg md:mr-6">
            <img 
              v-if="community.logo" 
              :src="community.logo" 
              :alt="`${community.name} logo`" 
              class="w-full h-full rounded-full object-cover"
            />
            <div v-else class="w-full h-full rounded-full bg-green-100 flex items-center justify-center">
              <span class="text-4xl font-bold text-green-700">{{ community.name ? community.name.charAt(0) : 'C' }}</span>
            </div>
          </div>
          
          <!-- Name and Tag -->
          <div class="mb-4 md:text-left text-center">
            <h1 class="text-3xl font-bold text-gray-800">{{ community.name }}</h1>
            <p class="text-gray-600">@{{ community._tag }}</p>
          </div>
        </div>
        
        <!-- Join/Leave Button (top right) -->
        <div class="absolute top-4 right-4">
          <button 
            v-if="community.is_member" 
            @click="confirmLeaveCommunity"
            class="px-4 py-2 text-sm rounded bg-white bg-opacity-90 border border-red-300 text-red-600 hover:bg-red-50 transition flex items-center"
            :disabled="actionInProgress"
          >
            <i class="fas fa-sign-out-alt mr-2"></i> Leave
          </button>
          <button 
            v-else 
            @click="joinCommunity"
            class="px-4 py-2 text-sm rounded bg-green-600 bg-opacity-90 text-white hover:bg-green-700 transition flex items-center"
            :disabled="actionInProgress"
          >
            <i class="fas fa-user-plus mr-2"></i> Join
          </button>
        </div>
      </div>
      
      <!-- Main Content Area -->
      <div class="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Community Details -->
        <div class="lg:col-span-2">
          <!-- Community Type and Stats -->
          <div class="bg-white p-6 rounded-lg shadow-md mb-6 hover:shadow-lg transition-shadow">
            <div class="flex flex-wrap items-center gap-4 mb-4">
              <span class="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <i class="fas fa-tag mr-1"></i> {{ community.type || 'Community' }}
              </span>
              
              <span class="inline-flex items-center text-gray-600 text-sm">
                <i class="fas fa-users mr-2"></i> {{ community.members_count || 0 }} members
              </span>
              
              <span v-if="community.location" class="inline-flex items-center text-gray-600 text-sm">
                <i class="fas fa-map-marker-alt mr-2"></i> {{ community.location }}
              </span>
            </div>
            
            <!-- About Section -->
            <div class="mt-4 mb-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-3">About</h2>
              <p class="text-gray-700">{{ community.description || 'No description available.' }}</p>
            </div>
            
            <!-- Community Links -->
            <div v-if="community.website || (community.social_links && Object.keys(community.social_links).length)">
              <h2 class="text-xl font-semibold text-gray-800 mb-3">Links</h2>
              <div class="flex flex-wrap gap-3">
                <a 
                  v-for="(link, name) in socialLinks" 
                  :key="name" 
                  :href="link.url" 
                  target="_blank" 
                  rel="noopener"
                  class="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <i :class="`${link.icon} mr-2`"></i> {{ link.label }}
                </a>
              </div>
            </div>
          </div>
          
          <!-- Upcoming Events Section -->
          <div v-if="community.upcoming_events?.length" class="bg-white p-6 rounded-lg shadow-md mb-6 hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-800">Upcoming Events</h2>
              <NuxtLink 
                :to="`/events?community=${community.id}`" 
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all <i class="fas fa-arrow-right ml-1"></i>
              </NuxtLink>
            </div>
            
            <div class="space-y-4">
              <div 
                v-for="event in community.upcoming_events" 
                :key="event.id" 
                class="border-l-4 border-green-500 pl-4 pb-2 hover:pl-5 transition-all"
              >
                <h3 class="font-medium text-gray-800">{{ event.title }}</h3>
                <div class="text-sm text-gray-600 flex items-center mt-1">
                  <i class="far fa-calendar mr-2"></i>
                  <span>{{ formatDate(event.start_date) }}</span>
                </div>
                <div class="text-sm text-gray-600 flex items-center mt-1">
                  <i class="far fa-clock mr-2"></i>
                  <span>{{ formatTime(event.start_time) }}</span>
                </div>
                <NuxtLink 
                  :to="`/events/${event.id}`" 
                  class="text-blue-600 hover:text-blue-800 text-sm inline-block mt-2"
                >
                  Event details <i class="fas fa-arrow-right ml-1"></i>
                </NuxtLink>
              </div>
            </div>
          </div>
          
          <!-- No Events Placeholder -->
          <div v-else class="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
            <div class="text-center py-6 text-gray-500">
              <i class="far fa-calendar-times text-4xl mb-3"></i>
              <p>No upcoming events scheduled</p>
            </div>
          </div>
        </div>
        
        <!-- Right Column: Member Information -->
        <div class="lg:col-span-1">
          <!-- Members Section -->
          <div class="bg-white p-6 rounded-lg shadow-md mb-6 hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-800">Members</h2>
              <button 
                @click="showAllMembers" 
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all <i class="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
            
            <div v-if="recentMembers.length > 0" class="space-y-4">
              <div 
                v-for="member in recentMembers" 
                :key="member.id" 
                class="flex items-center space-x-3"
              >
                <!-- Member Avatar -->
                <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img 
                    v-if="member.user?.logo" 
                    :src="member.user.logo" 
                    :alt="member.user.first_name" 
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-blue-100">
                    <span class="text-blue-700 font-bold">{{ member.name ? member.name.charAt(0) : 'U' }}</span>
                  </div>
                </div>
                
                <!-- Member Info -->
                <div class="flex-grow">
                  <div class="text-sm font-medium">{{ getMemberName(member) }}</div>
                  <div class="text-xs text-gray-500">@{{ member.tag || member.user?._tag }}</div>
                </div>
                
                <!-- Joined Date -->
                <div class="text-xs text-gray-500">
                  Joined {{ formatDateFromNow(member.joined_at) }}
                </div>
              </div>
            </div>

           
            
            <!-- No Members Placeholder -->
            <div v-else class="text-center py-6 text-gray-500">
              <i class="fas fa-user-friends text-4xl mb-3"></i>
              <p>No members yet</p>
            </div>
          </div>

           <div>
                <MyCommunityWidget />
            </div>
          
          <!-- Admin Actions Section -->
          <div v-if="isAdmin" class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Admin Actions</h2>
            
            <div class="space-y-3">
              <button 
                @click="showNotifyMembersModal" 
                class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center"
              >
                <i class="fas fa-bell mr-2"></i> Notify All Members
              </button>
              
              <NuxtLink 
                :to="`/community/${community.id}/edit`" 
                class="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center justify-center"
              >
                <i class="fas fa-edit mr-2"></i> Edit Community
              </NuxtLink>
              
              <NuxtLink 
                :to="`/community/${community.id}/events/create`" 
                class="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition flex items-center justify-center"
              >
                <i class="fas fa-calendar-plus mr-2"></i> Create Event
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Notify Members Modal -->
    <div v-if="showNotifyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Notify All Members</h3>
          
          <div class="mb-4">
            <label for="notification-title" class="block text-sm font-medium text-gray-700 mb-1">Notification Title</label>
            <input 
              id="notification-title" 
              v-model="notificationForm.title" 
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter notification title..."
            />
          </div>
          
          <div class="mb-4">
            <label for="notification-body" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              id="notification-body" 
              v-model="notificationForm.body" 
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter message for community members..."
            ></textarea>
          </div>
        </div>
        
        <div class="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
          <button 
            @click="showNotifyModal = false" 
            class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button 
            @click="sendNotification" 
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            :disabled="notificationInProgress"
          >
            <i v-if="notificationInProgress" class="fas fa-spinner fa-spin mr-2"></i>
            Send Notification
          </button>
        </div>
      </div>
    </div>
    
    <!-- All Members Modal -->
    <div v-if="showMembersModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div class="p-6 border-b">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-800">All Community Members</h3>
            <button @click="showMembersModal = false" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        
        
        <div class="p-6 overflow-y-auto flex-grow">
          <div v-if="loadingMembers" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
          
          <div v-else-if="allMembers.length === 0" class="text-center py-12 text-gray-500">
            <i class="fas fa-users text-4xl mb-3"></i>
            <p>No members found</p>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="member in allMembers" 
              :key="`${member.user.id}`" 
              class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
            >
              <!-- Member Avatar -->
              <div class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                <img 
                  v-if="member.user?.logo" 
                  :src="member.user.logo" 
                  :alt="member.user.first_name" 
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-blue-100">
                  <span class="text-blue-700 font-bold">{{ member.user.first_name?.charAt(0) || 'U' }}</span>
                </div>
              </div>
              
              <!-- Member Info -->
              <div class="flex-grow">
                <div class="font-medium">{{ `${member.user.first_name || ''} ${member.user.last_name || ''}` }}</div>
                <div class="text-sm text-gray-500">@{{ member.user._tag }}</div>
              </div>
              
              <!-- Member Role -->
              <div class="text-right">
                <div class="text-sm font-medium">
                  <span 
                    class="px-2 py-1 rounded text-xs"
                    :class="getMemberRoleClass(member.member_role)"
                  >
                    {{ getMemberRoleLabel(member.member_role) }}
                  </span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Joined {{ formatDateFromNow(member.joined_at) }}
                </div>
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
  middleware: 'auth-optional'
})
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useNuxtApp } from '#app';
import { useCommunityStore } from '@/stores/communityStore';
import { useAuthStore } from '@/stores/authStore';

// Initialize composables and stores
const route = useRoute();
const { $toast } = useNuxtApp();
const communityStore = useCommunityStore();
const authStore = useAuthStore();
const { swal, toast } = useSwal();

// Get community ID from route
const communityId = computed(() => route.params.id);

// Reactive state
const community = ref({});
const recentMembers = ref([]);
const loading = ref(true);
const error = ref(null);
const actionInProgress = ref(false);
const showNotifyModal = ref(false);
const notificationForm = ref({ title: '', body: '', type: 'community_announcement' });
const notificationInProgress = ref(false);
const showMembersModal = ref(false);
const allMembers = ref([]);
const loadingMembers = ref(false);
const membersPagination = ref(null);

// Computed properties
const isAdmin = computed(() => 
  authStore.isAuthenticated && authStore.user?.id === community.value.id
);

const socialLinks = computed(() => {
  const links = {};
  
  if (community.value.website) {
    links.website = { 
      url: community.value.website, 
      icon: 'fas fa-globe', 
      label: 'Website' 
    };
  }
  
  if (community.value.social_links) {
    if (community.value.social_links.facebook) {
      links.facebook = { 
        url: community.value.social_links.facebook, 
        icon: 'fab fa-facebook', 
        label: 'Facebook' 
      };
    }
    
    if (community.value.social_links.twitter) {
      links.twitter = { 
        url: community.value.social_links.twitter, 
        icon: 'fab fa-twitter', 
        label: 'Twitter' 
      };
    }
    
    if (community.value.social_links.instagram) {
      links.instagram = { 
        url: community.value.social_links.instagram, 
        icon: 'fab fa-instagram', 
        label: 'Instagram' 
      };
    }
    
    if (community.value.social_links.linkedin) {
      links.linkedin = { 
        url: community.value.social_links.linkedin, 
        icon: 'fab fa-linkedin', 
        label: 'LinkedIn' 
      };
    }
  }
  
  return links;
});

// Load community data on mount
onMounted(async () => {
  await loadCommunityData();
});

// Functions
const loadCommunityData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
      const data = await communityStore.fetchCommunity(communityId.value);
      console.log("community",data);
    community.value = data.community;
      recentMembers.value = data.recent_members || [];
    console.log(recentMembers.value)
  } catch (err) {
    console.error('Error loading community details:', err);
    error.value = 'Failed to load community details. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const joinCommunity = async () => {
  if (!authStore.isAuthenticated) {
    toast.fire({ title: 'Please log in to join communities', icon: 'error' });
    return;
  }
  
  actionInProgress.value = true;
  
  try {
    await communityStore.joinCommunity(communityId.value);
    toast.fire({ title: 'Successfully joined community!', icon: 'success' });
    await loadCommunityData();
  } catch (err) {
    toast.fire({ title: err.message || 'Failed to join community', icon: 'error' });
  } finally {
    actionInProgress.value = false;
  }
};

const confirmLeaveCommunity = () => {
  swal.fire({
    title: "Leave Community?",
    text: "Are you sure you want to leave this community?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, leave community",
  }).then((result) => {
    if (result.isConfirmed) leaveCommunity();
  });
};

const leaveCommunity = async () => {
  if (!authStore.isAuthenticated) {
    toast.fire({ title: 'Please log in to perform this action', icon: 'error' });
    return;
  }
  
  actionInProgress.value = true;
  
  try {
    await communityStore.leaveCommunity(communityId.value);
    toast.fire({ title: 'Successfully left community', icon: 'success' });
    await loadCommunityData();
  } catch (err) {
    toast.fire({ title: err.message || 'Failed to leave community', icon: 'error' });
  } finally {
    actionInProgress.value = false;
  }
};

const showNotifyMembersModal = () => {
  if (!isAdmin.value) {
    toast.fire({ title: 'Only community admins can send notifications', icon: 'error' });
    return;
  }
  
  notificationForm.value = { title: '', body: '', type: 'community_announcement' };
  showNotifyModal.value = true;
};

const sendNotification = async () => {
  if (!notificationForm.value.title.trim() || !notificationForm.value.body.trim()) {
    toast.fire({ title: 'Please fill out all fields', icon: 'warning' });
    return;
  }
  
  notificationInProgress.value = true;
  
  try {
    await communityStore.notifyCommunityMembers(notificationForm.value);
    showNotifyModal.value = false;
    swal.fire({
      title: 'Notification Sent!',
      text: 'Your message has been sent to all community members',
      icon: 'success'
    });
  } catch (err) {
    toast.fire({ title: err.message || 'Failed to send notification', icon: 'error' });
  } finally {
    notificationInProgress.value = false;
  }
};

const showAllMembers = async () => {
  showMembersModal.value = true;
  await loadAllMembers();
};

const loadAllMembers = async (page = 1) => {
  loadingMembers.value = true;
  
  try {
    const result = await communityStore.getCommunityMembers(communityId.value, { page, per_page: 20 });
    allMembers.value = result.members;
    membersPagination.value = result.pagination;
  } catch (err) {
    console.error('Error loading community members:', err);
    toast.fire({ title: 'Failed to load community members', icon: 'error' });
  } finally {
    loadingMembers.value = false;
  }
};

// Helper functions
const getMemberName = (member) => {
  return member.name || 
    `${member.user?.first_name || ''} ${member.user?.last_name || ''}`.trim() || 
    'Unknown User';
};

const getMemberRoleClass = (role) => {
  switch(role) {
    case 'admin': return 'bg-purple-100 text-purple-800';
    case 'moderator': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getMemberRoleLabel = (role) => {
  switch(role) {
    case 'admin': return 'Admin';
    case 'moderator': return 'Moderator';
    default: return 'Member';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours);
  return `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
};

const formatDateFromNow = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};
</script>