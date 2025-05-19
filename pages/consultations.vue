<template>
  <div class="flex h-[calc(100vh-64px)]">
    <!-- Left side: Consultations List -->
    <div class="flex-1 min-w-[300px] max-w-[400px] flex flex-col p-4 border-r border-gray-200 bg-white shadow-sm">
      <h3 class="text-xl font-semibold mb-4 text-blue-800">Consultations</h3>
      
      <!-- Tabs -->
      <div class="mb-4 border-b border-gray-200 flex">
        <button 
          @click="activeTab = 'active'" 
          class="mr-4 pb-2 font-medium transition-colors" 
          :class="activeTab === 'active' ? 'text-blue-800 border-b-2 border-blue-800 font-semibold' : 'text-gray-500 hover:text-blue-800'">
          Active
        </button>
        <button 
          @click="activeTab = 'history'" 
          class="mr-4 pb-2 font-medium transition-colors" 
          :class="activeTab === 'history' ? 'text-blue-800 border-b-2 border-blue-800 font-semibold' : 'text-gray-500 hover:text-blue-800'">
          History
        </button>
        <button 
          @click="activeTab = 'follow-ups'" 
          class="pb-2 font-medium transition-colors flex items-center" 
          :class="activeTab === 'follow-ups' ? 'text-blue-800 border-b-2 border-blue-800 font-semibold' : 'text-gray-500 hover:text-blue-800'">
          Follow-ups
          <span v-if="followUpCount > 0" class="ml-1 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
            {{ followUpCount }}
          </span>
        </button>
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Tab Content Container - Flex-grow to take remaining space -->
      <div class="flex-grow overflow-hidden">
        <!-- Active Tab Content -->
        <div v-if="activeTab === 'active'" class="h-full flex flex-col">
          <div v-if="activeConsultations.length === 0" class="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
            <div class="mx-auto mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <i class="fas fa-comment-medical text-gray-400 text-xl"></i>
            </div>
            <p class="font-medium">No active consultations</p>
            <p class="text-sm text-gray-400">When you start a consultation, it will appear here</p>
            
            <button 
              @click="requestNewConsultation" 
              class="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center mx-auto">
              <font-awesome-icon icon="plus" class="mr-2" />
              Request Consultation
            </button>
          </div>

          <!-- Scrollable list container -->
          <div v-else class="overflow-y-auto h-full pr-1 custom-scrollbar">
            <ul class="space-y-3">
              <li
                v-for="consultation in activeConsultations"
                :key="consultation.id"
                class="cursor-pointer hover:bg-blue-50 p-3 rounded-lg border border-gray-200 transition-all transform hover:scale-[1.01] hover:shadow-sm"
                :class="{ 'bg-blue-50 border-blue-300 shadow': isActiveConsultation(consultation.id) }"
                @click="handleConsultationClick(consultation)"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-medium text-gray-800">{{ consultation.user_tag }}</p>
                    <div class="flex items-center mt-1">
                      <span 
                        :class="{
                          'px-2 py-0.5 text-xs rounded-full flex items-center': true,
                          'bg-yellow-100 text-yellow-800': consultation.status === 'requested',
                          'bg-green-100 text-green-800': consultation.status === 'in_progress'
                        }">
                        <i v-if="consultation.status === 'requested'" class="fas fa-clock mr-1 text-xs"></i>
                        <i v-else class="fas fa-comments mr-1 text-xs"></i>
                        {{ formatStatus(consultation.status) }}
                      </span>
                      <span class="text-xs text-gray-400 ml-2">{{ formatDate(consultation.last_message_at) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <div v-if="isExpert && !consultation.doctor_id" class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      New
                    </div>
                    <i class="fas fa-chevron-right text-gray-400 ml-2"></i>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- History Tab Content -->
        <div v-else-if="activeTab === 'history'" class="h-full flex flex-col">
          <div class="relative mb-3 flex-shrink-0">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search history..." 
              class="w-full p-2 pl-9 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
            >
            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
          
          <div v-if="filteredHistoryConsultations.length === 0" class="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
            <div class="mx-auto mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <i class="fas fa-history text-gray-400 text-xl"></i>
            </div>
            <p class="font-medium">No consultation history found</p>
            <p class="text-sm text-gray-400">Your completed consultations will appear here</p>
          </div>

          <!-- Scrollable list container -->
          <div v-else class="overflow-y-auto h-full pr-1 custom-scrollbar">
            <ul class="space-y-3">
              <li
                v-for="consultation in filteredHistoryConsultations"
                :key="consultation.id"
                class="cursor-pointer hover:bg-blue-50 p-3 rounded-lg border border-gray-200 transition-all"
                :class="{ 'bg-blue-50 border-blue-300': isActiveConsultation(consultation.id) }"
                @click="handleConsultationClick(consultation)"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-medium text-gray-800">{{ consultation.user_tag }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ formatDate(consultation.last_message_at) }}</p>
                    <div v-if="consultation.rating" class="flex items-center mt-1">
                      <span v-for="i in 5" :key="i" class="text-sm">
                        <i v-if="i <= consultation.rating" class="fas fa-star text-yellow-500"></i>
                        <i v-else class="far fa-star text-gray-300"></i>
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <div v-if="consultation.follow_up_requested" class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <i class="fas fa-reply mr-1 text-xs"></i>
                      Follow-up
                    </div>
                    <i class="fas fa-chevron-right text-gray-400 ml-2"></i>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Follow-ups Tab Content -->
        <div v-else-if="activeTab === 'follow-ups'" class="h-full">
          <div v-if="followUpConsultations.length === 0" class="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
            <div class="mx-auto mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <i class="fas fa-reply-all text-gray-400 text-xl"></i>
            </div>
            <p class="font-medium">No follow-up requests</p>
            <p class="text-sm text-gray-400">Follow-up requests will appear here</p>
          </div>

          <!-- Scrollable list container -->
          <div v-else class="overflow-y-auto h-full pr-1 custom-scrollbar">
            <ul class="space-y-3">
              <li
                v-for="consultation in followUpConsultations"
                :key="consultation.id"
                class="hover:bg-blue-50 p-3 rounded-lg border border-gray-200 transition-all"
                :class="{ 'bg-blue-50 border-blue-300': isActiveConsultation(consultation.id) }"
              >
                <div class="flex justify-between">
                  <p class="font-medium text-gray-800">{{ consultation.user_tag }}</p>
                  <span class="text-xs text-gray-400">{{ formatDate(consultation.follow_up_requested_at) }}</span>
                </div>
                <p v-if="consultation.follow_up_reason" class="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded-lg italic">
                  "{{ consultation.follow_up_reason }}"
                </p>
                <div class="flex mt-3 gap-2">
                  <button 
                    @click.stop="acceptFollowUp(consultation)" 
                    class="bg-green-500 text-white px-4 py-1.5 text-sm rounded-lg hover:bg-green-600 transition-all flex-1 flex items-center justify-center">
                    <i class="fas fa-check mr-1"></i>
                    Accept
                  </button>
                  <button 
                    @click.stop="declineFollowUp(consultation)" 
                    class="bg-gray-200 text-gray-700 px-4 py-1.5 text-sm rounded-lg hover:bg-gray-300 transition-all flex-1 flex items-center justify-center">
                    <i class="fas fa-times mr-1"></i>
                    Decline
                  </button>
                </div>
                <button 
                  @click.stop="handleConsultationClick(consultation)" 
                  class="mt-2 text-blue-600 text-sm hover:text-blue-800 transition-all block mx-auto">
                  View consultation details
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side: Active Consultation (Chatbox) -->
    <div class="flex-[3] flex flex-col h-full overflow-hidden bg-gray-50">
      <div v-if="selectedConsultation" class="h-full flex-1 overflow-hidden">
        <Chatbox 
          :consultation-id="selectedConsultation.id" 
          :consultation="selectedConsultation"
          :is-completed="selectedConsultation.status === 'completed'" 
          :is-requester="isRequester(selectedConsultation)"
        />
      </div>
      <div v-else class="flex items-center justify-center h-full text-gray-500">
        <div class="text-center p-6 bg-white rounded-lg shadow-sm max-w-md">
          <div class="mx-auto mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-blue-50">
            <i class="fas fa-comment-dots text-blue-500 text-2xl"></i>
          </div>
          <p class="text-xl font-medium text-gray-800 mb-2">Select a consultation</p>
          <p class="text-gray-500 mb-6">Choose a conversation from the list to view details or start a new consultation</p>
          
          <button 
            v-if="activeConsultations.length == 0"
            @click="requestNewConsultation" 
            class="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center mx-auto">
            <i class="fas fa-plus mr-2"></i>
            Request Consultation
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { useConsultationStore } from "@/stores/consultationStore";
import { useAuthStore } from "~/stores/authStore";
import { useMessageStore } from "~/stores/messageStore";
import { useSwal } from '~/composables/useSwal';

// Initialize stores and composables
const consultationStore = useConsultationStore();
const authStore = useAuthStore();
const messageStore = useMessageStore();
const { swal } = useSwal();

// UI state
const activeTab = ref('active');
const searchQuery = ref('');
const selectedConsultation = ref(null);
const isLoading = ref(false);
const expertConsultations = ref([]);
const consultationHistory = ref([]);
const currentConsultation = ref(null);

// User data
const user = computed(() => authStore.user);
const isExpert = computed(() => user.value?.role === 'health_expert');

// Lifecycle hooks
onMounted(async () => {
  await authStore.fetchUser();
  await loadConsultations();
  document.addEventListener('consultation:updated', handleConsultationUpdate);
});

onBeforeUnmount(() => {
  document.removeEventListener('consultation:updated', handleConsultationUpdate);
});

// Watch for active tab changes
watch(activeTab, () => {
  if (activeTab.value === 'follow-ups') loadConsultations();
});

// Methods
async function loadConsultations() {
  isLoading.value = true;
  try {
    if (isExpert.value) {
      const expertResponse = await consultationStore.fetchExpertConsultations();
      expertConsultations.value = Array.isArray(expertResponse) ? expertResponse : [expertResponse].filter(Boolean);
    } else {
      const history = await consultationStore.fetchConsultationHistory();
      if (history) {
        const active = history.find(c => c.status === 'in_progress' || c.status === 'requested');
        if (active) currentConsultation.value = active;
      }
    }
    consultationHistory.value = await consultationStore.fetchConsultationHistory();
  } catch (error) {
    console.error("Failed to load consultations:", error);
  } finally {
    isLoading.value = false;
  }
}

const formatStatus = (status) => ({
  'in_progress': 'In Progress',
  'completed': 'Completed',
  'requested': 'Requested'
}[status] || status);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isActiveConsultation = (id) => selectedConsultation.value?.id === id;
const isRequester = (consultation) => consultation && consultation.user_id === user.value?.id;

const handleConsultationClick = async (consultation) => {
  isLoading.value = true;
  try {
    const updatedConsultation = await consultationStore.fetchConsultation(consultation.id);
    if (updatedConsultation) {
      selectedConsultation.value = updatedConsultation;
      consultationStore.setActiveConsultation(updatedConsultation.id);
      
      if (updatedConsultation.messages) {
        messageStore.setMessagesByConsultation(updatedConsultation.id, updatedConsultation.messages);
      } else {
        await messageStore.fetchMessages(updatedConsultation.id);
      }
      messageStore.listenForMessages(updatedConsultation.id);
    } else {
      selectedConsultation.value = consultation;
      consultationStore.setActiveConsultation(consultation.id);
    }
  } catch (error) {
    console.error("Error fetching consultation details:", error);
    selectedConsultation.value = consultation;
    consultationStore.setActiveConsultation(consultation.id);
  } finally {
    isLoading.value = false;
  }
};

const handleConsultationUpdate = (event) => {
  const updatedConsultation = event.detail.consultation;
  
  // Update in all relevant arrays
  [expertConsultations.value, consultationHistory.value].forEach(arr => {
    const index = arr.findIndex(c => c.id === updatedConsultation.id);
    if (index !== -1) arr[index] = updatedConsultation;
  });
  
  // Update specific references
  if (currentConsultation.value?.id === updatedConsultation.id) currentConsultation.value = updatedConsultation;
  if (selectedConsultation.value?.id === updatedConsultation.id) selectedConsultation.value = updatedConsultation;
};

const requestNewConsultation = async () => {  
  try {
    isLoading.value = true;
    const newConsultation = await consultationStore.requestConsultation();
    
    if (newConsultation) {
      if (!isExpert.value) currentConsultation.value = newConsultation;
      selectedConsultation.value = newConsultation;
      consultationStore.setActiveConsultation(newConsultation.id);
      await loadConsultations();
      
      swal.fire({
        icon: 'success',
        title: 'Consultation Requested',
        text: 'Your consultation has been requested successfully.',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Failed to request consultation',
    });
  } finally {
    isLoading.value = false;
  }
};

const acceptFollowUp = async (consultation) => {
  try {
    isLoading.value = true;
    await consultationStore.acceptFollowUp(consultation.id);
    await loadConsultations();
    handleConsultationClick(consultation);
    
    swal.fire({
      icon: 'success',
      title: 'Follow-up Accepted',
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Failed to accept follow-up',
    });
  } finally {
    isLoading.value = false;
  }
};

const declineFollowUp = async (consultation) => {
  swal.fire({
    title: 'Decline Follow-up',
    text: 'Are you sure you want to decline this follow-up request?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, decline it',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        isLoading.value = true;
        await loadConsultations();
        
        swal.fire({
          icon: 'success',
          title: 'Follow-up Declined',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to decline follow-up',
        });
      } finally {
        isLoading.value = false;
      }
    }
  });
};

// Computed properties
const activeConsultations = computed(() => {
  if (!isExpert.value) {
    return [currentConsultation.value].filter(Boolean);
  }
  return expertConsultations.value.filter(c => 
    c.status === 'in_progress' || c.status === 'requested'
  );
});

const historyConsultations = computed(() => 
  consultationHistory.value.filter(c => c.status === 'completed')
);

const filteredHistoryConsultations = computed(() => {
  if (!searchQuery.value) return historyConsultations.value;
  
  const query = searchQuery.value.toLowerCase();
  return historyConsultations.value.filter(c => 
    c.user_tag?.toLowerCase().includes(query) || 
    c.messages?.some(m => m.message?.toLowerCase().includes(query))
  );
});

const followUpConsultations = computed(() => 
  consultationHistory.value.filter(c => c.follow_up_requested)
);

const followUpCount = computed(() => followUpConsultations.value.length);
</script>

<style scoped>
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
</style>