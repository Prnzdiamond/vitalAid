<template>
  <div class="relative w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg border overflow-hidden">
    <div v-if="activeConsultation" class="flex flex-col h-[70vh] md:h-[70vh] sm:h-[calc(100vh-100px)]">
      <!-- Chat Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white mr-3">
            {{ getInitials(activeConsultation?.user_tag || 'User') }}
          </div>
          <div>
            <h2 class="text-lg font-semibold">
              {{ activeConsultation?.user_tag }}
            </h2>
            <div class="flex items-center text-xs text-blue-100">
              <span class="inline-block w-2 h-2 rounded-full mr-1" 
                    :class="isCompleted ? 'bg-gray-300' : 'bg-green-400 animate-pulse'"></span>
              {{ isCompleted ? 'Completed' : 'Active' }}
            </div>
          </div>
        </div>
        <div class="flex items-center">
          <button v-if="!isCompleted" @click="endChat" 
                  class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full transition-all">
            <i class="fas fa-times mr-1"></i> End Chat
          </button>
        </div>
      </div>

      <!-- Messages Container -->
      <div class="flex-1 overflow-y-auto p-4 bg-gray-50 scroll-smooth" ref="messagesContainer">
        <!-- Loading indicator -->
        <div v-if="messageStore.isLoading || loadingMessages" class="flex justify-center items-center h-full">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        
        <template v-else>
          <!-- Date separator -->
          <div class="flex justify-center mb-4">
            <span class="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
              {{ formatDate(new Date()) }}
            </span>
          </div>
          
          <div v-for="(msg, index) in groupedMessages" :key="index" class="mb-4">
            <!-- Date separator if needed -->
            <div v-if="index > 0 && shouldShowDateSeparator(groupedMessages[index-1][0], msg[0])" class="flex justify-center my-4">
              <span class="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                {{ formatDate(new Date(msg[0].timestamp)) }}
              </span>
            </div>
            
            <!-- Message group -->
            <div :class="getMessageGroupAlignment(msg[0].sender)" class="mb-4">
              <!-- Sender avatar for others' messages -->
              <div v-if="msg[0].sender !== user._tag" class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                {{ getInitials(msg[0].sender) }}
              </div>
              
              <div class="flex flex-col max-w-[75%]">
                <!-- Sender name -->
                <span v-if="msg[0].sender !== 'System'" class="text-xs font-semibold mb-1 px-1" :class="getTextAlignment(msg[0].sender)">
                  {{ msg[0].sender }}
                </span>
                
                <!-- Message bubbles -->
                <div class="flex flex-col gap-1">
                  <div v-for="(message, msgIndex) in msg" :key="msgIndex" 
                       :class="getMessageStyle(message)"
                       class="px-4 py-2 rounded-lg break-words shadow-sm animate-fadeIn">
                    {{ message.message }}
                    
                    <!-- Timestamp for last message in group -->
                    <span v-if="msgIndex === msg.length - 1" class="block text-xs opacity-70 mt-1" :class="message.sender === user._tag ? 'text-blue-100' : 'text-gray-500'">
                      {{ formatMessageTime(message.timestamp) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex items-center mb-4 ml-10">
            <div class="bg-gray-200 px-4 py-2 rounded-lg">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Scroll to bottom indicator -->
        <button v-if="showScrollToBottom" @click="scrollToBottom" 
             class="fixed bottom-24 right-6 bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-all hover:-translate-y-1 active:translate-y-0 z-10">
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>

      <!-- Input & Send -->
      <div v-if="!isCompleted" class="border-t py-3 px-4 bg-white">
        <div class="flex items-center gap-2">
          <div class="flex-grow relative">
            <input 
              v-model="newMessage" 
              @keyup.enter="sendMessage" 
              placeholder="Type your message..." 
              class="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            >
            <!-- Emoji button -->
            <button class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <i class="far fa-smile"></i>
            </button>
          </div>
          
          <!-- Attachment button -->
          <button class="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <i class="fas fa-paperclip"></i>
          </button>
          
          <!-- Send button -->
          <button @click="sendMessage" 
                  class="p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>

        <!-- Quick actions -->
        <div class="flex mt-2 gap-2 overflow-x-auto py-1 custom-scrollbar-x">
          <button 
            v-for="(action, index) in quickActions" 
            :key="index"
            @click="quickReply(action)"
            class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs whitespace-nowrap hover:bg-gray-200 transition-colors"
          >
            {{ action }}
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
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-comment-dots text-blue-500 text-2xl"></i>
        </div>
        <p class="text-gray-500 mb-3">{{ loadingConsultation ? 'Loading...' : canRequestConsultation ? 'No active consultation' : 'You already have an active consultation in another window' }}</p>
        <button v-if="canRequestConsultation" @click="requestNewConsultation"
                class="bg-green-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center mx-auto">
            <i class="fas fa-plus mr-2"></i>
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
  consultationId: {
    type: String,
    default: null
  },
  consultation: {
    type: Object,
    default: null
  },
  isRequester: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
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
const loadingConsultation = ref(false);
const loadingMessages = ref(false);
const userRequestedConsultation = ref(null);
const isTyping = ref(false);
const localConsultationData = ref(null);

// Quick action suggestions
const quickActions = [
  "Hello, how can I help you?",
  "Could you provide more details?",
  "I'll look into this for you",
  "Thank you for your patience",
  "Is there anything else you need help with?"
];

// Computed properties
const activeConsultation = computed(() => {
  // Priority 1: Local consultation data (from props)
  if (props.consultation) {
    return props.consultation;
  }
  
  // Priority 2: User's personally requested consultation
  if (userRequestedConsultation.value) {
    return userRequestedConsultation.value;
  }
  
  // Priority 3: Local consultation data (from fetch)
  if (localConsultationData.value) {
    return localConsultationData.value;
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

// Group messages by sender for better UI
const groupedMessages = computed(() => {
  if (!currentMessages.value.length) return [];
  
  const groups = [];
  let currentGroup = [];
  
  currentMessages.value.forEach((msg, index) => {
    // Start a new group if:
    // 1. This is the first message
    // 2. The sender changed
    // 3. More than 2 minutes passed since the last message
    const prevMsg = index > 0 ? currentMessages.value[index - 1] : null;
    
    const shouldStartNewGroup = 
      !prevMsg || 
      prevMsg.sender !== msg.sender ||
      (prevMsg.timestamp && msg.timestamp && 
       new Date(msg.timestamp) - new Date(prevMsg.timestamp) > 2 * 60 * 1000);
    
    if (shouldStartNewGroup) {
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
      }
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
  });
  
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  
  return groups;
});

// Utility functions
function isUserOwnConsultation(consultation) {
  return consultation && user.value && consultation.user_id === user.value.id;
}

function getMessageGroupAlignment(sender) {
  if (sender === user.value?._tag) return 'flex justify-end';
  if (sender === 'System') return 'flex justify-center';
  return 'flex items-start';
}

function getTextAlignment(sender) {
  if (sender === user.value?._tag) return 'text-right';
  if (sender === 'System') return 'text-center';
  return 'text-left';
}

function getMessageStyle(msg) {
  if (msg.sender === 'System') {
    return 'bg-green-500 text-white text-center text-sm px-4 py-1 rounded-full mx-auto';
  }
  
  if (msg.temp) {
    return 'bg-white text-gray-500 border border-gray-200 italic';
  }
  
  if (msg.sender === user.value?._tag) {
    return 'bg-blue-600 text-white rounded-tr-none';
  }
  
  return 'bg-gray-200 text-gray-800 rounded-tl-none';
}

function formatMessageTime(timestamp) {
  if (!timestamp) return 'Sending...';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date) {
  if (!date) return '';
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric' 
    });
  }
}

function shouldShowDateSeparator(prevMsg, currentMsg) {
  if (!prevMsg.timestamp || !currentMsg.timestamp) return false;
  
  const prevDate = new Date(prevMsg.timestamp);
  const currentDate = new Date(currentMsg.timestamp);
  
  return prevDate.toDateString() !== currentDate.toDateString();
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
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

const quickReply = (message) => {
  newMessage.value = message;
  sendMessage();
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
    loadingConsultation.value = true;
    const newConsultation = await consultationStore.requestConsultation();
    
    if (newConsultation) {
      userRequestedConsultation.value = newConsultation;
      
      // Don't update the global store if we're in a popup
      if (!props.consultation) {
        consultationStore.setActiveConsultation(newConsultation.id);
      }
    }
  } catch (error) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to request consultation. Please try again.'
    });
  } finally {
    loadingConsultation.value = false;
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
      
      // Clear messages for this consultation
      if (messageStore.messagesByConsultation[activeConsultation.value.id]) {
        messageStore.messagesByConsultation[activeConsultation.value.id] = [];
      }
      
      // Reset local state
      userRequestedConsultation.value = null;
      localConsultationData.value = null;
      
      // Only reset global state if we're not in a popup
      if (!props.consultation) {
        consultationStore.activeConsultationId = null;
        consultationStore.activeConsultationData = null;
      }
      
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

// Simulate typing indicator occasionally
const simulateTypingIndicator = () => {
  if (Math.random() > 0.7 && !isTyping.value && !props.isCompleted) {
    isTyping.value = true;
    setTimeout(() => {
      isTyping.value = false;
    }, 2000 + Math.random() * 1000);
  }
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

const loadConsultationData = async (consultationId) => {
  if (!consultationId) return;
  
  loadingMessages.value = true;
  try {
    // Fetch consultation data
    const consultation = await consultationStore.fetchConsultation(consultationId);
    
    if (consultation) {
      // Store locally without affecting the global store
      localConsultationData.value = consultation;
      
      // Fetch messages for this consultation
      await messageStore.fetchMessages(consultationId);
      
      // Start listening for new messages
      messageStore.listenForMessages(consultationId);
    }
  } catch (error) {
    console.error("Failed to fetch consultation data:", error);
  } finally {
    loadingMessages.value = false;
  }
};

const findUserOwnConsultation = async () => {
  // Skip if we already have a consultation from props
  if (props.consultation || props.consultationId) return;
  
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
        
        // Only update the global store if we're not in a popup
        if (!props.consultation) {
          consultationStore.setActiveConsultation(ownActiveConsultation.id);
        }
        
        // Fetch messages for this consultation
        await messageStore.fetchMessages(ownActiveConsultation.id);
        
        // Start listening for new messages
        messageStore.listenForMessages(ownActiveConsultation.id);
      }
    }
  } catch (error) {
    console.error("Failed to fetch user consultation:", error);
  } finally {
    loadingConsultation.value = false;
  }
};

// Helper function to check if messages exist for a consultation
const hasMessages = (consultationId) => {
  return !!messageStore.messagesByConsultation[consultationId] && 
         messageStore.messagesByConsultation[consultationId].length > 0;
};

// Watch for changes in messages to scroll to bottom
watch(currentMessages, async () => {
  await nextTick();
  scrollToBottom();
  simulateTypingIndicator();
}, { deep: true });

// Watch for changes in consultationId prop
watch(() => props.consultationId, async (newId) => {
  if (newId) {
    await loadConsultationData(newId);
  }
}, { immediate: true });

// Watch for changes in consultation prop
watch(() => props.consultation, (newConsultation) => {
  if (newConsultation && newConsultation.id) {
    // If we get a new consultation object via props, update local state
    localConsultationData.value = newConsultation;
    
    // Ensure we have messages for this consultation
    if (!hasMessages(newConsultation.id)) {
      messageStore.fetchMessages(newConsultation.id);
    }
    
    // Start listening for new messages
    messageStore.listenForMessages(newConsultation.id);
  }
}, { immediate: true });

onMounted(async () => {
  await authStore.fetchUser();
  
  // If we have a consultationId prop, load that consultation
  if (props.consultationId) {
    await loadConsultationData(props.consultationId);
  } 
  // If we have a consultation prop, use that
  else if (props.consultation) {
    localConsultationData.value = props.consultation;
    
    // Ensure we have messages for this consultation
    if (!hasMessages(props.consultation.id)) {
      await messageStore.fetchMessages(props.consultation.id);
    }
    
    // Start listening for new messages
    messageStore.listenForMessages(props.consultation.id);
  } 
  // Otherwise, try to find the user's active consultation
  else {
    await findUserOwnConsultation();
  }

  nextTick(setupScrollObserver);
});


</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar-x {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.custom-scrollbar-x::-webkit-scrollbar {
  height: 4px;
}

.custom-scrollbar-x::-webkit-scrollbar-track {
  background: #f7fafc;
}

.custom-scrollbar-x::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 4px;
}

.custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}
</style>