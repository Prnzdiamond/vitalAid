<template>
  <div class="relative">
    <!-- Notification Bell -->
    <button 
      class="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      @click="toggleNotifications"
      aria-label="Notifications"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="w-6 h-6 text-gray-700 dark:text-white" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        :class="{ 'animate-bell': hasNewNotifications }"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14V10a6 6 0 10-12 0v4c0 .386-.146.735-.405 1.005L4 17h5m6 0a3 3 0 01-6 0" 
        />
      </svg>
      
      <!-- Notification Badge -->
      <span 
        v-if="unreadNotifications.length" 
        class="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full"
      >
        {{ unreadNotifications.length > 99 ? '99+' : unreadNotifications.length }}
      </span>
    </button>

    <!-- Notification Dropdown -->
    <div 
      v-if="showNotificationDropdown" 
      ref="dropdown" 
      class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700 transform origin-top-right transition-all duration-200"
      :class="{ 'opacity-0 scale-95': isClosing, 'opacity-100 scale-100': !isClosing }"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h3 class="font-semibold text-gray-700 dark:text-white">Notifications</h3>
        <div class="flex items-center space-x-2">
          <button 
            v-if="unreadNotifications.length > 0"
            @click="markAllAsRead" 
            class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Mark all as read
          </button>
          <button 
            @click="closeNotifications" 
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="p-4">
        <div v-for="i in 3" :key="i" class="animate-pulse mb-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mt-3"></div>
        </div>
      </div>

      <!-- Notification List -->
      <div v-else class="max-h-[60vh] overflow-y-auto custom-scrollbar">
        <ul v-if="unreadNotifications.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
          <li 
            v-for="notification in unreadNotifications" 
            :key="notification.id" 
            class="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <div class="flex items-start">
              <!-- Notification Icon -->
              <div class="flex-shrink-0 mr-3">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="{
                    'bg-blue-100 text-blue-500': notification.data.type === 'consultation',
                    'bg-yellow-100 text-yellow-500': notification.data.type === 'follow_up',
                    'bg-green-100 text-green-500': notification.data.type === 'rating',
                    'bg-purple-100 text-purple-500': notification.data.type === 'general',
                    'bg-gray-100 text-gray-500': !notification.data.type || !['consultation', 'follow_up', 'rating', 'general'].includes(notification.data.type)
                  }"
                >
                  <i 
                    class="fas"
                    :class="{
                      'fa-comment-medical': notification.data.type === 'consultation',
                      'fa-reply': notification.data.type === 'follow_up',
                      'fa-star': notification.data.type === 'rating',
                      'fa-bell': notification.data.type === 'general' || !notification.data.type
                    }"
                  ></i>
                </div>
              </div>
              
              <!-- Notification Content -->
              <div class="flex-1">
                <div v-if="notification.data.title">
                  <p class="font-medium text-gray-800 dark:text-gray-200">{{ notification.data.title }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ notification.data.body }}</p>
                </div>
                <p v-else class="text-sm text-gray-700 dark:text-gray-300">
                  {{ notification.data.message || "New notification" }}
                </p>
                
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <i class="far fa-clock mr-1"></i>
                  {{ formatTime(notification.createdAt) }}
                </div>
                
                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-2 mt-3">
                  <button 
                    v-if="notification.data.type === 'consultation'" 
                    class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors" 
                    @click="acceptConsultation(notification.data.consultation_id || notification.id)"
                  >
                    <i class="fas fa-check mr-1"></i> Accept
                  </button>
                  
                  <button 
                    v-if="notification.data.type === 'follow_up'" 
                    class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors" 
                    @click="acceptFollowUp(notification.data.consultation_id || notification.id)"
                  >
                    <i class="fas fa-check mr-1"></i> Accept
                  </button>
                  
                  <button 
                    v-if="notification.hasLink || notification.data.extra?.route"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                    @click="navigateTo(notification.route || notification.data.extra?.route)"
                  >
                    <i class="fas fa-eye mr-1"></i> View
                  </button>
                  
                  <button 
                    class="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 px-3 py-1 rounded text-xs font-medium transition-colors" 
                    @click="dismissNotification(notification.id)"
                  >
                    <i class="fas fa-times mr-1"></i> Dismiss
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <!-- Empty State -->
        <div 
          v-else 
          class="p-8 text-center"
        >
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-bell-slash text-gray-400 dark:text-gray-500 text-xl"></i>
          </div>
          <p class="text-gray-500 dark:text-gray-400">No new notifications</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">You're all caught up!</p>
        </div>
      </div>
    </div>

    <!-- Pop-up Notifications -->
    <transition-group 
      tag="div" 
      name="notification-popup"
      class="fixed right-4 top-20 w-80 z-50 space-y-2"
      style="max-height: 80vh; overflow-y: auto;"
    >
      <div 
        v-for="popup in popupNotifications" 
        :key="popup.id" 
        class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 notification-item"
        :class="{
          'border-blue-500': popup.type === 'consultation',
          'border-yellow-500': popup.type === 'follow_up',
          'border-green-500': popup.type === 'rating',
          'border-purple-500': popup.type === 'general',
          'border-gray-500': !popup.type || !['consultation', 'follow_up', 'rating', 'general'].includes(popup.type)
        }"
      >
        <div class="flex items-start">
          <!-- Notification Icon -->
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
            :class="{
              'bg-blue-100 text-blue-500': popup.type === 'consultation',
              'bg-yellow-100 text-yellow-500': popup.type === 'follow_up',
              'bg-green-100 text-green-500': popup.type === 'rating',
              'bg-purple-100 text-purple-500': popup.type === 'general',
              'bg-gray-100 text-gray-500': !popup.type
            }"
          >
            <i 
              class="fas"
              :class="{
                'fa-comment-medical': popup.type === 'consultation',
                'fa-reply': popup.type === 'follow_up',
                'fa-star': popup.type === 'rating',
                'fa-bell': popup.type === 'general' || !popup.type
              }"
            ></i>
          </div>
          
          <!-- Content -->
          <div class="flex-1">
            <div v-if="popup.title">
              <p class="text-sm text-gray-800 dark:text-gray-200 font-medium">{{ popup.title }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ popup.message }}</p>
            </div>
            <p v-else class="text-sm text-gray-700 dark:text-gray-300 font-medium">{{ popup.message }}</p>
            
            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2 mt-3">
              <button 
                v-if="popup.type === 'consultation'" 
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors" 
                @click="acceptConsultation(popup.id)"
              >
                Accept
              </button>
              
              <button 
                v-if="popup.type === 'follow_up'" 
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors" 
                @click="acceptFollowUp(popup.id)"
              >
                Accept
              </button>
              
              <button 
                v-if="popup.hasLink || popup.route"
                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                @click="navigateTo(popup.route)"
              >
                View
              </button>
              
              <button 
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 px-3 py-1 rounded text-xs font-medium transition-colors" 
                @click="dismissPopup(popup.id)"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useConsultationStore } from '@/stores/consultationStore';
import { useNotificationStore } from '@/stores/notificationStore'; 
import { storeToRefs } from 'pinia';
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue';
import { useEchoStore } from '@/stores/echoStore';
import { useRouter } from 'vue-router';

// Store initialization
const consultationStore = useConsultationStore();
const notificationStore = useNotificationStore();
const echoStore = useEchoStore();
const router = useRouter();

// Reactive state
const { unreadNotifications, popupNotifications } = storeToRefs(notificationStore);
const showNotificationDropdown = ref(false);
const dropdown = ref(null);
const isLoading = ref(false);
const isClosing = ref(false);
const lastFetchTime = ref(0);
const fetchInterval = 30000; // 30 seconds
const prefetchTimer = ref(null);

// Computed properties
const hasNewNotifications = computed(() => unreadNotifications.value.length > 0);

// Lifecycle hooks
onMounted(() => {
  // Initial fetch with loading state
  fetchNotifications(true);
  
  // Set up Echo listeners for real-time notifications
  echoStore.listenForNotifications();
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
  
  // Set up periodic prefetching
  prefetchTimer.value = setInterval(() => {
    if (!showNotificationDropdown.value) {
      fetchNotifications(false);
    }
  }, fetchInterval);
  
  // Prefetch on hover
  const bellElement = document.querySelector('.notification-bell');
  if (bellElement) {
    bellElement.addEventListener('mouseenter', () => {
      if (!showNotificationDropdown.value && Date.now() - lastFetchTime.value > 10000) {
        fetchNotifications(false);
      }
    });
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  if (prefetchTimer.value) {
    clearInterval(prefetchTimer.value);
  }
});

// Methods
const fetchNotifications = async (showLoading = true) => {
  // Don't show loading if we've fetched recently
  if (Date.now() - lastFetchTime.value < 5000) {
    showLoading = false;
  }
  
  if (showLoading) {
    isLoading.value = true;
  }
  
  try {
    await notificationStore.fetchNotifications();
    lastFetchTime.value = Date.now();
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  } finally {
    isLoading.value = false;
  }
};

const toggleNotifications = async (event) => {
  event.stopPropagation();
  
  if (!showNotificationDropdown.value) {
    // Opening the dropdown
    showNotificationDropdown.value = true;
    isClosing.value = false;
    
    // Fetch fresh notifications
    await fetchNotifications(true);
  } else {
    // Closing the dropdown with animation
    closeNotifications();
  }
};

const closeNotifications = () => {
  isClosing.value = true;
  setTimeout(() => {
    showNotificationDropdown.value = false;
    isClosing.value = false;
  }, 200); // Match the duration in the CSS transition
};

const handleClickOutside = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target) && 
      !event.target.closest('.notification-bell')) {
    closeNotifications();
  }
};

const acceptConsultation = async (consultationId) => {
  isLoading.value = true;
  try {
    await consultationStore.acceptConsultation(consultationId);
    await fetchNotifications(false);
    closeNotifications();
  } catch (error) {
    console.error('Failed to accept consultation:', error);
  } finally {
    isLoading.value = false;
  }
};

const acceptFollowUp = async (consultationId) => {
  isLoading.value = true;
  try {
    await consultationStore.acceptFollowUp(consultationId);
    await fetchNotifications(false);
    closeNotifications();
  } catch (error) {
    console.error('Failed to accept follow-up:', error);
  } finally {
    isLoading.value = false;
  }
};

const dismissNotification = async (notificationId) => {
  try {
    await notificationStore.dismissNotification(notificationId);
    // Close dropdown if no more notifications
    if (notificationStore.unreadNotifications.length === 0) {
      closeNotifications();
    }
  } catch (error) {
    console.error('Failed to dismiss notification:', error);
  }
};

const dismissPopup = (notificationId) => {
  notificationStore.dismissPopupNotification(notificationId);
};

const markAllAsRead = async () => {
  isLoading.value = true;
  try {
    await notificationStore.markAllasRead();
    closeNotifications();
  } catch (error) {
    console.error('Failed to mark all as read:', error);
  } finally {
    isLoading.value = false;
  }
};

const navigateTo = (route) => {
  if (route) {
    // Mark notification as read when navigating to its route
    const notification = [...unreadNotifications.value, ...popupNotifications.value]
      .find(n => n.route === route || (n.data && n.data.extra && n.data.extra.route === route));
      
    if (notification) {
      dismissNotification(notification.id);
    }
    
    router.push(route);
    closeNotifications();
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) { // Less than a week
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};
</script>

<style scoped>
/* Bell animation */
@keyframes bell-shake {
  0% { transform: rotate(0); }
  20% { transform: rotate(8deg); }
  40% { transform: rotate(-8deg); }
  60% { transform: rotate(4deg); }
  80% { transform: rotate(-4deg); }
  100% { transform: rotate(0); }
}

.animate-bell {
  animation: bell-shake 0.6s ease-in-out;
  transform-origin: top center;
}

/* Custom scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}

/* Popup notification animations */
.notification-popup-enter-active,
.notification-popup-leave-active {
  transition: all 0.3s ease;
}

.notification-popup-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-popup-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Staggered animation for multiple notifications */
.notification-item {
  transition-delay: calc(var(--i) * 0.05s);
}
</style>