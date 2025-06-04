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
            <h2 class="text-lg font-semibold">{{ activeConsultation?.user_tag }}</h2>
            <div class="flex items-center text-xs text-blue-100">
              <span class="inline-block w-2 h-2 rounded-full mr-1" 
                    :class="isCompleted ? 'bg-gray-300' : 'bg-green-400 animate-pulse'"></span>
              {{ isCompleted ? 'Completed' : 'Active' }}
            </div>
          </div>
        </div>
        <div class="flex items-center">
          <!-- Take Over Button - Only for verified health experts -->
          <button v-if="canTakeOver" @click="takeOverChat" 
                  class="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded-full transition-all mr-2">
            <i class="fas fa-hand-paper mr-1"></i> Take Over
          </button>
          
          <button v-if="!isCompleted && canEndChat" @click="endChat" 
                  class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full transition-all">
            <i class="fas fa-times mr-1"></i> End Chat
          </button>
        </div>
      </div>

      <!-- Messages Container -->
      <div class="flex-1 overflow-y-auto p-4 bg-gray-50 scroll-smooth" ref="messagesContainer">
        <!-- Loading indicator -->
        <div v-if="isLoading" class="flex justify-center items-center h-full">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        
        <template v-else>
          <!-- Date separator -->
          <div class="flex justify-center mb-4">
            <span class="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
              {{ formatDate(new Date()) }}
            </span>
          </div>
          
          <!-- Message groups -->
          <div v-for="(group, index) in groupedMessages" :key="index" class="mb-4">
            <div v-if="shouldShowDateSeparator(group, index)" class="flex justify-center my-4">
              <span class="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                {{ formatDate(new Date(group[0].timestamp)) }}
              </span>
            </div>
            
            <div :class="getGroupAlignment(group[0].sender)" class="mb-4">
              <!-- Avatar for non-user messages -->
              <div v-if="group[0].sender !== user._tag" class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                <i v-if="isAIMessage(group[0])" class="fas fa-robot text-sm"></i>
                <span v-else>{{ getInitials(group[0].sender) }}</span>
              </div>
              
              <div class="flex flex-col max-w-[85%]">
                <!-- Sender name -->
                <span v-if="group[0].sender !== 'System'" class="text-xs font-semibold mb-1 px-1 flex items-center gap-1" :class="getTextAlignment(group[0].sender)">
                  <i v-if="isAIMessage(group[0])" class="fas fa-sparkles text-blue-500 text-xs"></i>
                  {{ group[0].sender }}
                  <span v-if="isAIMessage(group[0])" class="text-blue-500 text-xs">AI Assistant</span>
                </span>
                
                <!-- Message bubbles -->
                <div class="flex flex-col gap-1">
                  <div v-for="(message, msgIndex) in group" :key="msgIndex" 
                       :class="getMessageStyle(message)"
                       class="px-4 py-3 rounded-lg break-words shadow-sm animate-fadeIn">
                    
                    <div v-if="isAIMessage(message)" v-html="formatAIMessage(message.message)"></div>
                    <div v-else>{{ message.message }}</div>
                    
                    <span v-if="msgIndex === group.length - 1" class="block text-xs opacity-70 mt-2" :class="message.sender === user._tag ? 'text-blue-100' : 'text-gray-500'">
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
              <div class="flex items-center space-x-2">
                <i class="fas fa-robot text-blue-500 text-sm"></i>
                <span class="text-sm text-gray-600">AI is typing</span>
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Scroll to bottom button -->
        <button v-if="showScrollToBottom" @click="scrollToBottom" 
             class="fixed bottom-24 right-6 bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-all hover:-translate-y-1 active:translate-y-0 z-10">
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>

      <!-- Input Section - Only show if user can send messages -->
      <div v-if="!isCompleted && canSendMessages" class="border-t py-3 px-4 bg-white">
        <div class="flex items-center gap-2">
          <div class="flex-grow relative">
            <input 
              v-model="newMessage" 
              @keyup.enter="sendMessage" 
              :placeholder="getInputPlaceholder()" 
              class="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            >
            <button class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <i class="far fa-smile"></i>
            </button>
          </div>
          
          <!-- Attachment button - Only for verified users -->
          <button v-if="authStore.isVerified" class="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <i class="fas fa-paperclip"></i>
          </button>
          
          <button @click="sendMessage" 
                  class="p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>

        <!-- Quick actions - Only for verified health experts -->
        <div v-if="showQuickActions" class="flex mt-2 gap-2 overflow-x-auto py-1 custom-scrollbar-x">
          <button 
            v-for="action in quickActions" 
            :key="action"
            @click="quickReply(action)"
            class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs whitespace-nowrap hover:bg-gray-200 transition-colors"
          >
            {{ action }}
          </button>
        </div>
      </div>

      <!-- Verification Warning -->
      <div v-else-if="!isCompleted && !canSendMessages && authStore.needsVerification" class="border-t py-3 px-4 bg-yellow-50">
        <div class="flex items-center text-yellow-800">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          <span class="text-sm">You need to complete verification to participate in consultations. 
            <NuxtLink to="/verification" class="text-yellow-900 underline font-medium">Complete verification</NuxtLink>
          </span>
        </div>
      </div>

      <ConsultationActions 
        v-if="activeConsultation" 
        :consultation="activeConsultation" 
        :is-requester="isRequester" 
        :is-completed="isCompleted" 
      />
    </div>

    <!-- Empty state -->
    <div v-else class="flex items-center justify-center p-6 h-64">
      <div class="text-center">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-comment-dots text-blue-500 text-2xl"></i>
        </div>
        <p class="text-gray-500 mb-3">{{ getEmptyStateMessage() }}</p>
        <button v-if="canRequestConsultation" @click="requestNewConsultation"
                class="bg-green-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center mx-auto">
            <i class="fas fa-plus mr-2"></i>
            Request Consultation
        </button>
        <!-- Verification prompt for non-verified users -->
        <div v-else-if="authStore.needsVerification" class="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p class="text-yellow-800 text-sm mb-2">Complete verification to access consultations</p>
          <NuxtLink to="/verification" class="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors">
            Start Verification
          </NuxtLink>
        </div>
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
  isRequester: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false }
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
const messagesLoaded = ref(new Set());

// Quick actions for verified health experts
const quickActions = [
  "Hello, how can I help you?",
  "Could you provide more details?",
  "I'll look into this for you",
  "Thank you for your patience",
  "Is there anything else you need help with?"
];

// Verification-based computed properties
const canSendMessages = computed(() => {
  if (!authStore.isAuthenticated) return false;
  
  // Regular users can always send messages
  if (user.value?.role === 'user') return true;
  
  // Health experts need verification to handle consultations
  if (user.value?.role === 'health_expert') {
    return authStore.isVerified || isUserOwnConsultation();
  }
  
  // Other roles need verification
  return authStore.isVerified;
});

const canTakeOver = computed(() => {
  if (!activeConsultation.value || user.value?.role !== 'health_expert') return false;
  if (!authStore.isVerified) return false;
  
  return activeConsultation.value.handled_by !== user.value._tag && 
         activeConsultation.value.status === 'in_progress';
});

const canEndChat = computed(() => {
  if (!activeConsultation.value) return false;
  
  // Users can end their own consultations
  if (isUserOwnConsultation()) return true;
  
  // Verified health experts can end consultations they handle
  if (user.value?.role === 'health_expert' && authStore.isVerified) {
    return activeConsultation.value.handled_by === user.value._tag;
  }
  
  return false;
});

const canRequestConsultation = computed(() => {
  if (loadingConsultation.value || userRequestedConsultation.value) return false;
  
  // Use authStore method to check if user can create consultation
  return authStore.canPerformAction('create_consultation');
});

const showQuickActions = computed(() => {
  return user.value?.role === 'health_expert' && authStore.isVerified;
});

const isLoading = computed(() => messageStore.isLoading || loadingMessages.value);

// Main computed properties
const activeConsultation = computed(() => {
  return props.consultation || userRequestedConsultation.value || localConsultationData.value;
});

const currentMessages = computed(() => {
  if (!activeConsultation.value?.id) return [];
  return messageStore.getMessages(activeConsultation.value.id);
});

const groupedMessages = computed(() => {
  if (!currentMessages.value.length) return [];
  
  const groups = [];
  let currentGroup = [];
  
  currentMessages.value.forEach((msg, index) => {
    const prevMsg = index > 0 ? currentMessages.value[index - 1] : null;
    const shouldStartNewGroup = !prevMsg || 
      prevMsg.sender !== msg.sender ||
      (prevMsg.timestamp && msg.timestamp && 
       new Date(msg.timestamp) - new Date(prevMsg.timestamp) > 2 * 60 * 1000);
    
    if (shouldStartNewGroup) {
      if (currentGroup.length > 0) groups.push([...currentGroup]);
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
  });
  
  if (currentGroup.length > 0) groups.push(currentGroup);
  return groups;
});

// Utility functions
function isUserOwnConsultation() {
  return activeConsultation.value && user.value && 
         activeConsultation.value.user_id === user.value.id;
}

function isAIMessage(message) {
  const aiSenders = ['AI', 'Assistant', 'Health AI', 'Medical AI', 'Bot', 'Claude'];
  return aiSenders.some(ai => message.sender?.toLowerCase().includes(ai.toLowerCase()));
}

function formatAIMessage(message) {
  if (!message) return '';
  
  return message
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
    .replace(/^(\d+\.\s+)(.+)$/gm, '<div class="flex items-start mb-2"><span class="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mr-3 mt-0.5 flex-shrink-0">$1</span><span class="text-gray-800">$2</span></div>')
    .replace(/^[-•]\s+(.+)$/gm, '<div class="flex items-start mb-2"><span class="text-blue-500 mr-3 mt-1 flex-shrink-0">•</span><span class="text-gray-800">$1</span></div>')
    .replace(/\n\n/g, '<div class="mb-4"></div>')
    .replace(/\n/g, '<br class="mb-1">');
}

function getGroupAlignment(sender) {
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
    return 'bg-blue-500 text-white border border-blue-300 italic rounded-tr-none';
  }
  if (msg.sender === user.value?._tag) {
    return 'bg-blue-600 text-white rounded-tr-none';
  }
  if (isAIMessage(msg)) {
    return 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200 rounded-tl-none shadow-sm';
  }
  return 'bg-gray-200 text-gray-800 rounded-tl-none';
}

function shouldShowDateSeparator(group, index) {
  if (index === 0) return false;
  const prevGroup = groupedMessages.value[index - 1];
  if (!prevGroup[0].timestamp || !group[0].timestamp) return false;
  
  const prevDate = new Date(prevGroup[0].timestamp);
  const currentDate = new Date(group[0].timestamp);
  return prevDate.toDateString() !== currentDate.toDateString();
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
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
}

function getInputPlaceholder() {
  if (!canSendMessages.value) {
    if (authStore.needsVerification) return 'Complete verification to send messages...';
    return 'You cannot send messages in this consultation...';
  }
  return 'Type your message...';
}

function getEmptyStateMessage() {
  if (loadingConsultation.value) return 'Loading...';
  if (!authStore.isAuthenticated) return 'Please login to access consultations';
  if (authStore.needsVerification) return 'Complete verification to access consultations';
  if (userRequestedConsultation.value) return 'You already have an active consultation';
  return 'No active consultation';
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

// Action handlers
const sendMessage = () => {
  if (newMessage.value.trim() && activeConsultation.value?.id && canSendMessages.value) {
    messageStore.sendMessage(activeConsultation.value.id, newMessage.value);
    newMessage.value = '';
    nextTick(scrollToBottom);
  }
};

const quickReply = (message) => {
  if (canSendMessages.value) {
    newMessage.value = message;
    sendMessage();
  }
};

const requestNewConsultation = async () => {
  if (!canRequestConsultation.value) {
    if (authStore.needsVerification) {
      swal.fire({
        icon: 'warning',
        title: 'Verification Required',
        text: 'Please complete your account verification to request consultations.',
        confirmButtonText: 'Go to Verification',
        showCancelButton: true
      }).then((result) => {
        if (result.isConfirmed) {
          navigateTo('/verification');
        }
      });
    } else {
      swal.fire({
        icon: 'warning',
        title: 'Active Consultation',
        text: 'You already have an active consultation.'
      });
    }
    return;
  }

  try {
    loadingConsultation.value = true;
    const newConsultation = await consultationStore.requestConsultation();
    
    if (newConsultation) {
      userRequestedConsultation.value = newConsultation;
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

const takeOverChat = () => {
  if (!canTakeOver.value) {
    swal.fire({
      icon: 'warning',
      title: 'Cannot Take Over',
      text: 'You need to be a verified health expert to take over consultations.'
    });
    return;
  }

  swal.fire({
    title: 'Take Over Chat',
    text: 'Are you sure you want to take over this consultation?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#f59e0b',
    confirmButtonText: 'Yes, take over!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const updatedConsultation = await consultationStore.takeOverChat(activeConsultation.value.id);
        if (updatedConsultation) {
          if (localConsultationData.value) localConsultationData.value = updatedConsultation;
          if (userRequestedConsultation.value) userRequestedConsultation.value = updatedConsultation;
          
          swal.fire({
            icon: 'success',
            title: 'Chat Taken Over',
            timer: 1500,
            showConfirmButton: false
          });
        }
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Take Over Failed',
          text: 'Failed to take over the consultation.'
        });
      }
    }
  });
};

const endChat = () => {
  if (!canEndChat.value) {
    swal.fire({
      icon: 'warning',
      title: 'Cannot End Chat',
      text: 'You do not have permission to end this chat.'
    });
    return;
  }

  swal.fire({
    title: 'End Chat',
    text: 'Are you sure you want to end this chat?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, end it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await consultationStore.endConsultation(activeConsultation.value.id);
      
      if (messageStore.messagesByConsultation[activeConsultation.value.id]) {
        messageStore.messagesByConsultation[activeConsultation.value.id] = [];
      }
      
      userRequestedConsultation.value = null;
      localConsultationData.value = null;
      
      if (!props.consultation) {
        consultationStore.activeConsultationId = null;
        consultationStore.activeConsultationData = null;
      }
      
      swal.fire({
        icon: 'success',
        title: 'Chat Ended',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
};

// Initialization and setup
const initializeConsultation = async () => {
  await authStore.fetchUser();

  if (props.consultationId) {
    loadingMessages.value = true;
    try {
      const consultation = await consultationStore.fetchConsultation(props.consultationId);
      if (consultation) {
        localConsultationData.value = consultation;
        await messageStore.fetchMessages(props.consultationId);
        messageStore.listenForMessages(props.consultationId);
      }
    } finally {
      loadingMessages.value = false;
    }
  } else if (props.consultation) {
    localConsultationData.value = props.consultation;
    await messageStore.fetchMessages(props.consultation.id);
    messageStore.listenForMessages(props.consultation.id);
  } else {
    // Find user's own consultation
    loadingConsultation.value = true;
    try {
      const history = await consultationStore.fetchConsultationHistory();
      const ownActiveConsultation = history?.find(c =>
        c.user_id === user.value.id && ['in_progress', 'requested'].includes(c.status)
      );

      if (ownActiveConsultation) {
        userRequestedConsultation.value = ownActiveConsultation;
        consultationStore.setActiveConsultation(ownActiveConsultation.id);
        await messageStore.fetchMessages(ownActiveConsultation.id);
        messageStore.listenForMessages(ownActiveConsultation.id);
      }
    } finally {
      loadingConsultation.value = false;
    }
  }
};

// Watchers
watch(currentMessages, async () => {
  await nextTick();
  scrollToBottom();
  
  // Simulate typing indicator occasionally
  if (Math.random() > 0.7 && !isTyping.value && !props.isCompleted) {
    isTyping.value = true;
    setTimeout(() => { isTyping.value = false; }, 2000 + Math.random() * 1000);
  }
}, { deep: true });

// Lifecycle
onMounted(async () => {
  await initializeConsultation();
  
  // Setup scroll observer
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
      showScrollToBottom.value = scrollTop < scrollHeight - clientHeight - 100;
    });
    scrollToBottom();
  }
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
</style>