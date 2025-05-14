<template>
  <div class="relative w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg border overflow-hidden">
    <div v-if="activeConsultation" class="flex flex-col h-[70vh] md:h-[70vh] sm:h-[calc(100vh-100px)]">
      <!-- Chat Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 shadow-md flex items-center justify-between">
        <h2 class="text-base font-semibold truncate">
          Consultation with {{ activeConsultation?.user_tag }}
        </h2>
        <div class="text-xs px-2 py-1 rounded-full ml-2" :class="isCompleted ? 'bg-gray-600' : 'bg-blue-800'">
          {{ isCompleted ? 'Completed' : 'Active' }}
        </div>
      </div>

      <!-- Messages Container -->
      <div class="flex-1 overflow-y-auto p-3 bg-gray-50 scroll-smooth" ref="messagesContainer">
        <div v-for="msg in currentMessages" :key="msg.timestamp" class="mb-3 animate-fadeIn">
          <div :class="getMessageAlignment(msg.sender)">
            <div :class="{ 'max-w-[80%]': true, 'order-1': msg.sender === user._tag }">
              <!-- Sender name -->
              <span class="block text-xs font-semibold mb-0.5 px-1" :class="getTextAlignment(msg.sender)">
                {{ msg.sender }}
              </span>
              
              <!-- Message bubble -->
              <div :class="getMessageStyle(msg)">
                {{ msg.message }}
              </div>
              
              <!-- Timestamp -->
              <span class="block text-xs text-gray-400 mt-0.5 px-1" :class="getTextAlignment(msg.sender)">
                {{ formatTimestamp(msg.timestamp) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Scroll to bottom indicator -->
        <button v-if="showScrollToBottom" @click="scrollToBottom" 
             class="fixed bottom-24 right-6 bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-all hover:-translate-y-1 active:translate-y-0">
          <svg class="h-5 w-5" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Input & Send -->
      <div v-if="!isCompleted" class="border-t py-2 px-3 bg-white">
        <div class="flex items-center gap-2">
          <input 
            v-model="newMessage" 
            @keyup.enter="sendMessage" 
            placeholder="Type your message..." 
            class="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 text-sm"
          >
          <button @click="sendMessage" 
                  class="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all hover:-translate-y-1 active:translate-y-0 flex-shrink-0 flex items-center justify-center">
            <svg class="h-5 w-5" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        <!-- Actions -->
        <div class="flex justify-between mt-2 gap-2">
          <button @click="endChat" 
                  class="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center text-xs">
            <svg class="h-4 w-4 mr-1" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            End Chat
          </button>
          <button v-if="canTakeOver" @click="takeOverChat"
                  class="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center text-xs">
            <svg class="h-4 w-4 mr-1" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            Take Over
          </button>
        </div>
      </div>

      <ConsultationActions 
        v-if="activeConsultation" 
        :consultation="activeConsultation" 
        :is-requester="isRequester" 
        :is-completed="isCompleted" 
      />
    </div>

    <div v-else class="flex items-center justify-center p-6 h-64">
      <div class="text-center">
        <p class="text-gray-500 mb-3">{{ loadingConsultation ? 'Loading...' : canRequestConsultation ? 'No active consultation' : 'You already have an active consultation in another window' }}</p>
        <button v-if="canRequestConsultation" @click="requestNewConsultation"
                class="bg-green-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center mx-auto">
            <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Request Consultation
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useConsultationStore } from '@/stores/consultationStore';
import { useAuthStore } from '~/stores/authStore';
import { useMessageStore } from '~/stores/messageStore';
import { useSwal } from '~/composables/useSwal';
import ConsultationActions from './ConsultationActions.vue';

const props = defineProps({
  consultationId: { type: String, default: null },
  consultation: { type: Object, default: null },
  isCompleted: { type: Boolean, default: false },
  isRequester: { type: Boolean, default: false }
});

// Store setup
const consultationStore = useConsultationStore();
const authStore = useAuthStore();
const messageStore = useMessageStore();
const { swal } = useSwal();

// Reactive refs
const user = computed(() => authStore.user);
const newMessage = ref('');
const messagesContainer = ref(null);
const showScrollToBottom = ref(false);
const loadingConsultation = ref(true);
const userRequestedConsultation = ref(null);

// Computed properties
const activeConsultation = computed(() => {
  // Priority 1: User's personally requested consultation
  if (userRequestedConsultation.value) return userRequestedConsultation.value;
  
  // Priority 2: Consultation prop if it's the user's own
  if (props.consultation && isUserOwnConsultation(props.consultation)) {
    return props.consultation;
  }
  
  // Priority 3: Active consultation in store if it's the user's own
  if (consultationStore.activeConsultationData && 
      isUserOwnConsultation(consultationStore.activeConsultationData)) {
    return consultationStore.activeConsultationData;
  }
  
  return null;
});

const canTakeOver = computed(() => {
  if (!activeConsultation.value || user.value?.role !== 'health_expert') return false;
  return activeConsultation.value.handled_by !== user.value._tag && 
         activeConsultation.value.status === 'in_progress';
});

const canRequestConsultation = computed(() => {
  return !loadingConsultation.value && user.value && !userRequestedConsultation.value;
});

const currentMessages = computed(() => {
  if (!activeConsultation.value?.id) return [];
  return messageStore.getMessages(activeConsultation.value.id);
});

// Utility functions
function isUserOwnConsultation(consultation) {
  return consultation && user.value && consultation.user_id === user.value.id;
}

function getMessageAlignment(sender) {
  if (sender === user.value?._tag) return 'flex justify-end';
  if (sender === 'System') return 'flex justify-center';
  return 'flex justify-start';
}

function getTextAlignment(sender) {
  if (sender === user.value?._tag) return 'text-right';
  if (sender === 'System') return 'text-center';
  return 'text-left';
}

function getMessageStyle(msg) {
  const baseClasses = 'px-3 py-1.5 rounded-lg break-words';
  
  if (msg.sender === 'System') {
    return `${baseClasses} bg-green-500 text-white text-center text-sm px-4 py-0.5 rounded-full mx-auto`;
  }
  
  if (msg.temp) {
    return `${baseClasses} bg-white text-gray-500 border border-gray-200 italic`;
  }
  
  if (msg.sender === user.value?._tag) {
    return `${baseClasses} bg-blue-600 text-white rounded-tr-none`;
  }
  
  return `${baseClasses} bg-gray-200 text-gray-800 rounded-tl-none`;
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'Sending...';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

// Action handlers
const sendMessage = () => {
  if (newMessage.value.trim() && activeConsultation.value?.id) {
    messageStore.sendMessage(activeConsultation.value.id, newMessage.value);
    newMessage.value = '';
    nextTick(scrollToBottom);
  }
};

const requestNewConsultation = async () => {
  if (!canRequestConsultation.value) {
    swal.fire({
      icon: 'warning',
      title: 'Active Consultation',
      text: 'You already have an active consultation. Please complete it before starting a new one.'
    });
    return;
  }

  try {
    const newConsultation = await consultationStore.requestConsultation();
    if (newConsultation) {
      userRequestedConsultation.value = newConsultation;
      consultationStore.setActiveConsultation(newConsultation.id);
    }
  } catch (error) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to request consultation. Please try again.'
    });
  }
};

const endChat = () => {
  if (!activeConsultation.value?.id) {
    swal.fire({
      icon: 'warning',
      title: 'Cannot End Chat',
      text: 'No active chat to end.'
    });
    return;
  }

  swal.fire({
    title: 'End Chat',
    text: 'Are you sure you want to end this chat?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, end it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await consultationStore.endConsultation(activeConsultation.value.id);
      messageStore.clearMessages(activeConsultation.value.id);
      
      // Reset consultation data
      consultationStore.activeConsultationId = null;
      consultationStore.activeConsultationData = null;
      userRequestedConsultation.value = null;
      
      swal.fire({
        icon: 'success',
        title: 'Chat Ended',
        text: 'The chat has been ended.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
};

const takeOverChat = () => {
  if (!activeConsultation.value?.id || !canTakeOver.value) {
    swal.fire({
      icon: 'warning',
      title: 'Cannot Take Over Chat',
      text: 'No active chat to take over.'
    });
    return;
  }

  swal.fire({
    title: 'Take Over Chat',
    text: 'Are you sure you want to take over this chat?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, take over!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await consultationStore.takeOverChat(activeConsultation.value.id);
      swal.fire({
        icon: 'success',
        title: 'Chat Taken Over',
        text: 'You have taken over this chat.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
};

// Lifecycle hooks and watchers
const setupScrollObserver = () => {
  if (!messagesContainer.value) return;
  
  messagesContainer.value.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
    showScrollToBottom.value = scrollTop < scrollHeight - clientHeight - 100;
  });
  
  scrollToBottom();
};

const findUserOwnConsultation = async () => {
  loadingConsultation.value = true;
  try {
    if (!user.value) await authStore.fetchUser();
    
    const history = await consultationStore.fetchConsultationHistory();
    if (history?.length > 0) {
      const ownActiveConsultation = history.find(c => 
        c.user_id === user.value.id && 
        ['in_progress', 'requested'].includes(c.status)
      );
      
      if (ownActiveConsultation) {
        userRequestedConsultation.value = ownActiveConsultation;
        consultationStore.setActiveConsultation(ownActiveConsultation.id);
      } else {
        userRequestedConsultation.value = null;
        consultationStore.activeConsultationId = null;
        consultationStore.activeConsultationData = null;
      }
    }
  } catch (error) {
    console.error("Failed to fetch user consultation:", error);
  } finally {
    loadingConsultation.value = false;
  }
};

watch(currentMessages, async () => {
  await nextTick();
  scrollToBottom();
}, { deep: true });

watch(() => props.consultationId, async (newId) => {
  if (newId) {
    const consultation = await consultationStore.fetchConsultation(newId);
    if (consultation && isUserOwnConsultation(consultation)) {
      userRequestedConsultation.value = consultation;
      consultationStore.setActiveConsultation(newId);
    }
  }
}, { immediate: true });

onMounted(async () => {
  await authStore.fetchUser();
  
  if (props.consultationId) {
    const consultation = await consultationStore.fetchConsultation(props.consultationId);
    if (consultation && isUserOwnConsultation(consultation)) {
      userRequestedConsultation.value = consultation;
      consultationStore.setActiveConsultation(props.consultationId);
    }
  } else if (props.consultation && isUserOwnConsultation(props.consultation)) {
    userRequestedConsultation.value = props.consultation;
    consultationStore.setActiveConsultation(props.consultation.id);
  } else {
    await findUserOwnConsultation();
  }

  nextTick(setupScrollObserver);
  
  document.addEventListener('consultation:updated', (event) => {
    const updatedConsultation = event.detail.consultation;
    if (updatedConsultation && isUserOwnConsultation(updatedConsultation)) {
      userRequestedConsultation.value = updatedConsultation;
    }
  });
});
</script>

<style>
@layer utilities {
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
</style>