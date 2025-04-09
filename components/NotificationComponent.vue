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
            class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-50"
        >
<ul class="divide-y divide-gray-200 dark:divide-gray-700">
    <li v-for="notification in unreadNotifications" :key="notification.id" class="p-4 text-sm text-gray-700 dark:text-gray-300">
        <p>{{ notification.data.message }}</p>
        <div class="flex justify-between mt-2">
            <button v-if="notification.hasActions" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium" 
                @click="acceptConsultation(notification.data.consultation_id)">Accept</button>
            <button class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium" 
                @click="dismissNotification(notification.id)">Dismiss</button>
        </div>
    </li>
</ul>


            <div v-if="!unreadNotifications.length" class="p-4 text-sm text-gray-500 text-center">No new notifications</div>
        </div>

        <!-- 🔥 Pop-up Notifications (Under Bell) -->
       <div v-if="popupNotifications.length" class="absolute right-0 mt-12 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50 transition-opacity duration-500">
    <div v-for="popup in popupNotifications" :key="popup.id" class="mb-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p class="text-sm text-gray-700 dark:text-gray-300">{{ popup.message }}</p>
        <div class="flex justify-between mt-2">
            <button v-if="popup.hasActions" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium" @click="acceptConsultation(popup.id)">Accept</button>
            <button class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium" @click="dismissPopup(popup.id)">Dismiss</button>
        </div>
    </div>
</div>

    </div>
</template>

<script>
import { useConsultationStore } from '@/stores/consultationStore';
import { storeToRefs } from 'pinia';
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
    setup() {
        const consultationStore = useConsultationStore();
        const notificationStore = useNotificationStore();
        const {unreadNotifications,popupNotifications} = storeToRefs(notificationStore);
        const showNotificationDropdown = ref(false);
        const dropdown = ref(null);

        onMounted(() => {
           notificationStore.fetchNotifications();
            document.addEventListener('click', handleClickOutside);
        });

        onBeforeUnmount(() => {
            document.removeEventListener('click', handleClickOutside);
        });

       const toggleNotifications = (event) => {
    event.stopPropagation();
    showNotificationDropdown.value = !showNotificationDropdown.value;

    // ✅ Force update by refetching notifications when opened
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
            await notificationStore.fetchNotifications();
        };

        const dismissNotification = async (notificationId) => {
            await notificationStore.dismissNotification(notificationId);
            await notificationStore.fetchNotifications();
        };

        const dismissPopup = (notificationId) => {
            notificationStore.dismissPopupNotification(notificationId);
        };

        return {
            unreadNotifications,
            popupNotifications,
            showNotificationDropdown,
            toggleNotifications,
            acceptConsultation,
            dismissNotification,
            dismissPopup,
            dropdown
        };
    }
};
</script>
