<template>
    <div class="relative">
        <!-- 🔔 Notification Bell -->
        <div class="relative cursor-pointer text-gray-700 dark:text-white" @click="toggleNotifications">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14V10a6 6 0 10-12 0v4c0 .386-.146.735-.405 1.005L4 17h5m6 0a3 3 0 01-6 0" />
            </svg>
            <span v-if="unreadNotifications.length" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5">
                {{ unreadNotifications.length }}
            </span>
        </div>

        <!-- 🔽 Notification Dropdown (Under Bell) -->
        <div 
            v-if="showNotificationDropdown" 
            ref="dropdown" 
            class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-50"
        >
            <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                <li v-for="notification in unreadNotifications" :key="notification.id" 
                    class="p-4 text-sm text-gray-700 dark:text-gray-300">
                    <!-- Different display based on notification type -->
                    <div v-if="notification.data.title">
                        <p class="font-medium">{{ notification.data.title }}</p>
                        <p>{{ notification.data.body }}</p>
                    </div>
                    <p v-else>{{ notification.data.message || "New notification" }}</p>
                    
                    <div class="mt-1 text-xs text-gray-500">
                        {{ formatTime(notification.createdAt) }}
                    </div>
                    <div class="flex justify-between mt-2">
                        <button v-if="notification.data.type === 'consultation'" 
                            class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium" 
                            @click="acceptConsultation(notification.data.consultation_id || notification.id)">
                            Accept
                        </button>
                        <button v-if="notification.data.type === 'follow_up'" 
                            class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium" 
                            @click="acceptFollowUp(notification.data.consultation_id || notification.id)">
                            Accept
                        </button>
                        <button v-if="notification.hasLink || notification.data.extra?.route"
                            class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                            @click="navigateTo(notification.route || notification.data.extra?.route)">
                            View
                        </button>
                        <button 
                            class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium" 
                            @click="dismissNotification(notification.id)">
                            Dismiss
                        </button>
                    </div>
                </li>
            </ul>

            <div v-if="!unreadNotifications.length" class="p-4 text-sm text-gray-500 text-center">No new notifications</div>
        </div>

        <!-- 🔥 Pop-up Notifications -->
        <div v-if="popupNotifications.length" 
             class="fixed right-4 top-20 w-80 z-50"
             style="max-height: 80vh; overflow-y: auto;">
            <div v-for="popup in popupNotifications" :key="popup.id" 
                class="mb-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4"
                :class="{
                    'border-blue-500': popup.type === 'consultation',
                    'border-yellow-500': popup.type === 'follow_up',
                    'border-green-500': popup.type === 'rating',
                    'border-purple-500': popup.type === 'general',
                    'border-gray-500': !['consultation', 'follow_up', 'rating', 'general'].includes(popup.type)
                }">
                <!-- Different display based on notification type -->
                <div v-if="popup.title">
                    <p class="text-sm text-gray-700 dark:text-gray-300 font-medium">{{ popup.title }}</p>
                    <p class="text-sm text-gray-700 dark:text-gray-300">{{ popup.message }}</p>
                </div>
                <p v-else class="text-sm text-gray-700 dark:text-gray-300 font-medium">{{ popup.message }}</p>
                
                <div class="flex justify-between mt-3">
                    <button v-if="popup.type === 'consultation'" 
                        class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium" 
                        @click="acceptConsultation(popup.id)">
                        Accept
                    </button>
                    <button v-if="popup.type === 'follow_up'" 
                        class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium" 
                        @click="acceptFollowUp(popup.id)">
                        Accept
                    </button>
                    <button v-if="popup.hasLink || popup.route"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                        @click="navigateTo(popup.route)">
                        View
                    </button>
                    <button 
                        class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium" 
                        @click="dismissPopup(popup.id)">
                        Dismiss
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import { useConsultationStore } from '@/stores/consultationStore';
import { useNotificationStore } from '@/stores/notificationStore'; 
import { storeToRefs } from 'pinia';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useEchoStore } from '@/stores/echoStore';
import { useRouter } from 'vue-router';

export default {
    setup() {
        const consultationStore = useConsultationStore();
        const notificationStore = useNotificationStore();
        const echoStore = useEchoStore();
        const router = useRouter();
        const { unreadNotifications, popupNotifications } = storeToRefs(notificationStore);
        const showNotificationDropdown = ref(false);
        const dropdown = ref(null);

        onMounted(() => {
            // Fetch notifications on initial load
            notificationStore.fetchNotifications();
            
            // Set up Echo listeners for real-time notifications
            echoStore.listenForNotifications();
            
            document.addEventListener('click', handleClickOutside);
        });

        onBeforeUnmount(() => {
            document.removeEventListener('click', handleClickOutside);
        });

        const toggleNotifications = (event) => {
            event.stopPropagation();
            showNotificationDropdown.value = !showNotificationDropdown.value;

            // Force update by refetching notifications when opened
            if (showNotificationDropdown.value) {
                notificationStore.fetchNotifications();
            }
        };

        const handleClickOutside = (event) => {
            if (dropdown.value && !dropdown.value.contains(event.target)) {
                showNotificationDropdown.value = false;
            }
        };

        const acceptConsultation = async (consultationId) => {
            await consultationStore.acceptConsultation(consultationId);
            showNotificationDropdown.value = false;
        };

        const acceptFollowUp = async (consultationId) => {
            await consultationStore.acceptFollowUp(consultationId);
            showNotificationDropdown.value = false;
        };

        const dismissNotification = async (notificationId) => {
            await notificationStore.dismissNotification(notificationId);
            // Close dropdown if no more notifications
            if (notificationStore.unreadNotifications.length === 0) {
                showNotificationDropdown.value = false;
            }
        };

        const dismissPopup = (notificationId) => {
            notificationStore.dismissPopupNotification(notificationId);
        };

        const navigateTo = (route) => {
            if (route) {
                // Mark notification as read when navigating to its route
                const notification = [...unreadNotifications.value, ...popupNotifications.value].find(n => n.route === route);
                if (notification) {
                    dismissNotification(notification.id);
                }
                
                router.push(route);
                showNotificationDropdown.value = false;
            }
        };

        const formatTime = (timestamp) => {
            if (!timestamp) return '';
            
            const date = new Date(timestamp);
            const now = new Date();
            const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
            
            if (diffInHours < 1) {
                const diffInMinutes = Math.floor((now - date) / (1000 * 60));
                return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
            } else if (diffInHours < 24) {
                return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
            } else {
                return date.toLocaleDateString();
            }
        };

        return {
            unreadNotifications,
            popupNotifications,
            showNotificationDropdown,
            toggleNotifications,
            acceptConsultation,
            acceptFollowUp,
            dismissNotification,
            dismissPopup,
            navigateTo,
            formatTime,
            dropdown
        };
    }
};
</script>