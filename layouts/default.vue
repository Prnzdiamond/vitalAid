<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white flex flex-col">
    <!-- Enhanced Header -->
    <HeaderComponent 
      :user="user" 
      :navigation-items="navigationItems"
      @toggle-mobile-menu="mobileMenuOpen = true" 
    />

    <!-- text to display boldly and nicely that all veification features has been enabled for testing purposes -->
    <div class="text-center text-lg font-semibold text-red-600 mt-4">
      <p class="bg-yellow-100 text-yellow-800 p-2 rounded-lg shadow-md">
        All verification features are enabled for testing purposes. Please disable them in production.
      </p>
    </div>
    
    <!-- Mobile Navigation Overlay -->
    <MobileNavigation 
      v-model:open="mobileMenuOpen" 
      :user="user" 
      :navigation-items="navigationItems" 
    />

    <!-- Main Content Container -->
    <div class="flex-1 flex flex-col">
      <!-- Quick Actions Section - Only show if user has role-specific actions -->
      <section v-if="roleSpecificActions && roleSpecificActions.length > 0" class=" px-4 sm:px-6 lg:px-8 pt-3">
        <QuickActions 
          :actions="roleSpecificActions"
          :is-verified="isVerified"
          @navigate="handleNavigation"
        />
      </section>

      <!-- Page Content Area -->
      <main class="flex-1 px-4 sm:px-6 lg:px-8 pb-8" :class="roleSpecificActions && roleSpecificActions.length > 0 ? 'pt-2' : 'pt-8'">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 min-h-[500px] p-6 ">
          <slot />
        </div>
      </main>
    </div>

    <!-- Enhanced Footer -->
    <FooterComponent />

    <!-- Floating Chat Button -->
    <FloatingChatButton 
      :has-unread-messages="hasUnreadMessages"
      @toggle="toggleChat"
    />

    <!-- Chat Popup -->
    <ChatPopup 
      v-model:show="messageStore.showChat"
      :consultation-id="popupConsultationId"
      :consultation-data="popupConsultationData"
      :loading="loadingPopupConsultation"
      @close="toggleChat"
    />
  </div>
</template>

<script setup>


import { onMounted, ref, computed, onBeforeUnmount } from "vue";
import { useRouter } from 'vue-router';
import { useAuthStore } from "~/stores/authStore";
import { useEchoStore } from "~/stores/echoStore";
import { useMessageStore } from "~/stores/messageStore";
import { useConsultationStore } from "~/stores/consultationStore";

// Lifecycle hooks
onMounted(async () => {

authstore.restoreSession();

  if (!authstore.isAuthenticated) {
    await router.push('/login');
    return;
  }


await authstore.fetchUser();

if (authstore.user) {
user.value = authstore.user;

// Only initialize consultation listening for health experts
if (authstore.user.role === "health_expert") {
  console.log('Initializing consultation notifications for health expert');
  echostore.listenForNewConsultations();
} else {
  console.log('User is not a health expert, skipping consultation notifications');
}
}

// Add all event listeners
document.addEventListener('consultation:updated', handleConsultationUpdated);
document.addEventListener('consultation:ended', handleConsultationEnded);
document.addEventListener('consultation:created', handleNewConsultationCreated); // Add this line

// Add message notification listener
document.addEventListener('message:received', handleMessageReceived);

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
Notification.requestPermission();
}
});

// Import components
import HeaderComponent from "@/components/HeaderComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import MobileNavigation from "@/components/layout/MobileNavigation.vue";
import QuickActions from "@/components/layout/QuickActions.vue";
import FloatingChatButton from "@/components/layout/FloatingChatButton.vue";
import ChatPopup from "@/components/layout/ChatPopup.vue";

// Import navigation data
import { navigationItems, useRoleSpecificActions } from "~/composables/useNavigation";

// Store instances
const authstore = useAuthStore();
const echostore = useEchoStore();
const messageStore = useMessageStore();
const consultationStore = useConsultationStore();
const router = useRouter();

// Reactive state
const user = computed(() => authstore.user || { _tag: "Loading...", role: "" });
const mobileMenuOpen = ref(false);
const popupConsultationId = ref(null);
const popupConsultationData = ref(null);
const loadingPopupConsultation = ref(false);

// Computed properties
const isVerified = computed(() => authstore.isVerified);
const roleSpecificActions = useRoleSpecificActions(user);
const hasUnreadMessages = computed(() => messageStore.hasUnreadMessages);

// Navigation handler
const handleNavigation = (path) => router.push(path);

// Chat functionality
const toggleChat = async () => {
  if (!messageStore.showChat) {
    messageStore.showChat = true;
    loadingPopupConsultation.value = true;
    
    // Clear previous data
    popupConsultationId.value = null;
    popupConsultationData.value = null;
    
    try {
      await loadUserActiveConsultation();
      
      // Mark messages as read when opening chat
      if (popupConsultationId.value) {
        messageStore.markAsRead(popupConsultationId.value);
      }
    } finally {
      setTimeout(() => {
        loadingPopupConsultation.value = false;
      }, 100);
    }
  } else {
    messageStore.showChat = false;
  }
};

const handleMessageReceived = (event) => {
  const { consultationId, message } = event.detail;
  
  // Show browser notification if supported and chat is closed
  if ('Notification' in window && Notification.permission === 'granted' && !messageStore.showChat) {
    new Notification('New message received', {
      body: `${message.sender}: ${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}`,
      icon: '/favicon.ico',
      tag: `consultation-${consultationId}`,
      requireInteraction: false,
      silent: false
    });
  }
};

// Load user's active consultation
const loadUserActiveConsultation = async () => {
  try {
    const history = await consultationStore.fetchConsultationHistory();

    if (history?.length > 0) {
      const activeConsultation = history.find(c =>
        c.user_id === authstore.user.id &&
        (c.status === 'in_progress' || c.status === 'requested')
      );

      if (activeConsultation) {
        // Set the consultation data immediately to show status
        popupConsultationId.value = activeConsultation.id;
        popupConsultationData.value = activeConsultation;
        
        // Then try to get updated data
        try {
          const updatedConsultation = await consultationStore.fetchConsultation(activeConsultation.id);
          
          if (updatedConsultation) {
            popupConsultationData.value = updatedConsultation;
          }
        } catch (updateError) {
          console.warn("Could not fetch updated consultation, using cached data:", updateError);
          // Keep the original consultation data if update fails
        }
        
        // Load messages (this won't cause double loading due to Chatbox fixes)
        await messageStore.fetchMessages(activeConsultation.id);
        messageStore.listenForMessages(activeConsultation.id);
      }
    }
  } catch (error) {
    console.error("Failed to load user's active consultation:", error);
  }
};

// Event handlers
const handleConsultationUpdated = (event) => {
  const updatedConsultation = event.detail.consultation;
  if (updatedConsultation && popupConsultationId.value === updatedConsultation.id) {
    // Update immediately to reflect status changes
    popupConsultationData.value = updatedConsultation;
  }
};

const handleConsultationEnded = (event) => {
  const endedConsultationId = event.detail.consultationId;
  if (popupConsultationId.value === endedConsultationId && popupConsultationData.value) {
    // Update status immediately
    popupConsultationData.value = {
      ...popupConsultationData.value,
      status: 'completed'
    };
  }
};

const handleNewConsultationCreated = (event) => {
  const newConsultation = event.detail.consultation;
  if (newConsultation && newConsultation.user_id === authstore.user?.id) {
    // If chat popup is open, update it with the new consultation
    if (messageStore.showChat) {
      popupConsultationId.value = newConsultation.id;
      popupConsultationData.value = newConsultation;
    }
    
    // Also update any global consultation state
    consultationStore.setActiveConsultation(newConsultation.id);
  }
};



// Update onBeforeUnmount to remove all listeners:
onBeforeUnmount(() => {
  document.removeEventListener('consultation:updated', handleConsultationUpdated);
  document.removeEventListener('consultation:ended', handleConsultationEnded);  
  document.removeEventListener('consultation:created', handleNewConsultationCreated); // Add this line
  document.removeEventListener('message:received', handleMessageReceived);
});
</script>