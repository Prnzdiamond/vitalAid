<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- ✅ Global Header -->
    <HeaderComponent :user="user" />

    <div class="flex flex-1">
      <!-- ✅ Sidebar -->
  <aside
  :class="[
    'bg-white p-6 shadow-lg transition-transform duration-300',
    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
    'fixed md:relative z-30 w-64 h-full md:translate-x-0'
  ]"
>
  <button
    class="absolute top-4 right-4 text-gray-500 md:hidden"
    @click="sidebarOpen = false"
  >
    ✖
  </button>
  <h2 class="text-lg font-semibold text-gray-700 mb-4">
    Welcome, {{ user._tag }}
    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded ml-1">{{ user.role }}</span>
  </h2>
  <ul class="space-y-4">
          <li><NuxtLink to="/events" class="dashboard-link">📅 Events</NuxtLink></li>
          <li><NuxtLink to="/my-events/joined" class="dashboard-link">📌 Joined Events</NuxtLink></li>
          <li><NuxtLink to="/my-events/created" class="dashboard-link">🛠️ Created Events</NuxtLink></li>
          <li><NuxtLink to="/donate" class="dashboard-link">💰 Donate</NuxtLink></li>
          <li><NuxtLink to="/community" class="dashboard-link">💰 Community</NuxtLink></li>
          <li><NuxtLink to="/community/my-communities" class="dashboard-link">💰 Community</NuxtLink></li>
          <li v-if="user.role === 'health_expert'"><NuxtLink to="/consultations" class="dashboard-link">📋 Consultations</NuxtLink></li>
          <li><NuxtLink to="/donate/my_request" class="dashboard-link">📋 My donate requests</NuxtLink></li>
          <li><NuxtLink to="/profile" class="dashboard-link">👤 Profile</NuxtLink></li>
        </ul>
</aside>


      <!-- ✅ Main Content -->
      <main class="flex-1 p-4 md:p-8">
        <button class="md:hidden mb-4 text-blue-600 font-bold" @click="sidebarOpen = !sidebarOpen">☰ Menu</button>
        
        <slot />
      </main>
    </div>

    <!-- ✅ Global Footer -->
    <FooterComponent />

    <!-- ✅ Floating Chat Button -->
 <!-- Floating Chat Button -->
<button
  @click="toggleChat"
  class="fixed bottom-6 right-6 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
>
  💬 Chat
</button>

<!-- Chat Popup -->
<Teleport to="body">
  <div v-if="messageStore.showChat" class="fixed inset-0 flex items-center justify-center z-50">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black opacity-50 z-40"></div>

    <!-- Chatbox with larger width, no overlay -->
    <div class="bg-white w-11/12 md:w-1/2 max-w-4xl rounded-lg shadow-lg p-6 relative z-50">
      <!-- Close Button -->
      <button @click="toggleChat" class="absolute top-2 right-2 text-red-500 text-xl">
        ✖
      </button>
      
      <!-- Chatbox content -->
      <Chatbox 
        :consultationId="popupConsultationId" 
        :consultation="popupConsultationData"
      />
    </div>
  </div>
</Teleport>
  </div>
</template>

<script setup>
 import { onMounted, ref, watch, onBeforeUnmount } from "vue";
import HeaderComponent from "@/components/HeaderComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import Chatbox from "@/components/Chatbox.vue";
import { useAuthStore } from "~/stores/authStore";
import { useEchoStore } from "~/stores/echoStore";
import { useMessageStore } from "~/stores/messageStore";
import { useConsultationStore } from "~/stores/consultationStore";

const authstore = useAuthStore();
const echostore = useEchoStore();
const messageStore = useMessageStore();
const consultationStore = useConsultationStore();

// Separate states for popup consultation
const popupConsultationId = ref(null);
const popupConsultationData = ref(null);
const loadingPopupConsultation = ref(false);

const user = ref({ _tag: "Loading...", role: "" });
const sidebarOpen = ref(false);

const toggleChat = () => {
  messageStore.showChat = !messageStore.showChat;

  // If opening the chat, immediately check for the user's active consultation
  // and reset any previous consultation data from other components
  if (messageStore.showChat) {
    // Reset popup state first to avoid showing wrong consultation
    popupConsultationId.value = null;
    popupConsultationData.value = null;
    loadingPopupConsultation.value = true;

    // Then load the user's active consultation
    loadUserActiveConsultation();
  }
};

// Function to find the user's active consultation
const loadUserActiveConsultation = async () => {
  try {
    // Get the consultation history
    const history = await consultationStore.fetchConsultationHistory();

    if (history && history.length > 0) {
      // Find any active consultation for the current user
      const activeConsultation = history.find(c =>
        c.user_id === authstore.user.id &&
        (c.status === 'in_progress' || c.status === 'requested')
      );

      if (activeConsultation) {
        // Set as active consultation for popup only
        popupConsultationId.value = activeConsultation.id;
        popupConsultationData.value = activeConsultation;

        // Fetch latest consultation data, but don't affect consultationStore.activeConsultation
        const updatedConsultation = await consultationStore.fetchConsultation(activeConsultation.id);
        if (updatedConsultation) {
          popupConsultationData.value = updatedConsultation;
        }
      } else {
        // No active consultation found, reset popup states
        popupConsultationId.value = null;
        popupConsultationData.value = null;
      }
    } else {
      // No consultation history, reset popup states
      popupConsultationId.value = null;
      popupConsultationData.value = null;
    }
  } catch (error) {
    console.error("Failed to load user's active consultation:", error);
    popupConsultationId.value = null;
    popupConsultationData.value = null;
  }
};

// Define event handler functions
const handleConsultationUpdated = (event) => {
  const updatedConsultation = event.detail.consultation;

  // If this is the user's active consultation that's now completed
  if (updatedConsultation &&
      popupConsultationId.value === updatedConsultation.id) {

    if (updatedConsultation.status === 'completed') {
      // Reset the popup consultation states if completed
      popupConsultationId.value = null;
      popupConsultationData.value = null;
    } else {
      // Otherwise update with latest data
      popupConsultationData.value = updatedConsultation;
    }
  }
};

const handleConsultationEnded = (event) => {
  const endedConsultationId = event.detail.consultationId;

  // If this is the consultation currently shown in the popup, reset it
  if (popupConsultationId.value === endedConsultationId) {
    popupConsultationId.value = null;
    popupConsultationData.value = null;
  }
};

onMounted(async () => {
  await authstore.fetchUser();
  if (authstore.user) {
    user.value = authstore.user;
    if (authstore.user.role === "health_expert") {
      echostore.listenForNewConsultations();
    } else {
      // For regular users, check for active consultation on mount
      loadUserActiveConsultation();
    }
  }

  // Add event listeners
  document.addEventListener('consultation:updated', handleConsultationUpdated);
  document.addEventListener('consultation:ended', handleConsultationEnded);
});

// Clean up event listeners on component unmount
onBeforeUnmount(() => {
  document.removeEventListener('consultation:updated', handleConsultationUpdated);
  document.removeEventListener('consultation:ended', handleConsultationEnded);
  // document.removeEventListener('consultation:active-changed', () => {}); // This event listener was not added
});
</script>

<style scoped>
.dashboard-link {
  display: block;
  color: #4a5568; /* text-gray-700 */
  padding: 0.5rem 0.75rem; /* px-3 py-2 */
  border-radius: 0.375rem; /* rounded-md */
  font-weight: 500; /* font-medium */
  transition: background-color 0.3s ease; /* transition */
}

.dashboard-link:hover {
  background-color: #c6f6d5; /* hover:bg-green-100 */
}
</style>
