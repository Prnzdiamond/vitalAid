<template>
  <div class="relative mt-4 z-40 w-full max-w-full md:max-w-full h-[80%] bg-white rounded-lg shadow-lg border p-4">
    <div v-if="consultation">
      <!-- ✅ Chat Header -->
      <div class="bg-blue-600 text-white text-center py-2 rounded-t-md">
        <h2 class="text-lg font-semibold">Consultation with {{ consultation?.patientName }}</h2>
      </div>

      <!-- ✅ Messages -->
      <div class="h-90 overflow-y-auto p-3 bg-gray-50">
        <div v-for="msg in currentMessages" :key="msg.timestamp"
             :class="{'text-right': msg.sender === user._tag, 'text-center':msg.sender === 'System', 'text-left': msg.sender !== user._tag && msg.sender !== 'System'}">
          <span class="block text-sm font-semibold">{{ msg.sender }}</span>
          <p class="inline-block px-3 py-2 rounded-lg text-sm my-1"
             :class="{
               'bg-gray-300 text-black': msg.sender !== user._tag && !msg.temp,
               'bg-blue-500 text-white': msg.sender === user._tag && !msg.temp,
               'bg-green-500 text-white italic text-center text-sm': msg.sender === 'System',
               'bg-white text-gray-500 opacity-50 italic text-left': msg.temp
             }">
            {{ msg.message }}
          </p>
          <span class="block text-xs text-gray-400">
            {{ formatTimestamp(msg.timestamp) }}
          </span>
        </div>
      </div>

      <!-- ✅ Input & Send -->
      <div class="flex gap-2 mt-2">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message..."
               class="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
        <button @click="sendMessage" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Send
        </button>
      </div>

      <!-- ✅ Actions -->
      <div class="flex justify-between mt-3">
        <button @click="endChat" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          End Chat
        </button>
        <button v-if="user.role === 'health_expert'" @click="takeOverChat"
                class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">
          Take Over Chat
        </button>
      </div>
    </div>

    <div v-else class="text-center">
      <button @click="store.requestConsultation"
              class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
        Request Consultation
      </button>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useConsultationStore } from '@/stores/consultationStore';
import { useAuthStore } from '~/stores/authStore';
import { useMessageStore } from '~/stores/messageStore';

const props = defineProps({
  consultationId: {
    type: String,
    required: false,
    default: null,
  }
});

const store = useConsultationStore();
const authStore = useAuthStore();
const messageStore = useMessageStore();
const user = authStore.user;
const newMessage = ref('');




// ✅ Find consultation by ID
const consultation = computed(() => {
  console.log(props.consultationId); // Logs the passed consultationId (if any)

  if (props.consultationId) {
    // If consultationId is provided, check both expertConsultations and activeConsultation
    return (
      store.expertConsultations.find(c => c.id === props.consultationId) ||
      (store.activeConsultation.id === props.consultationId ? store.activeConsultation : null)
    );
  }

  // If no consultationId is provided, return activeConsultation
  return store.activeConsultation;
});


// ✅ Messages for this consultation
const currentMessages = computed(() => {
  if (!props.consultationId) return [];
  return messageStore.getMessages(props.consultationId);
});

// ✅ Watch for prop change to listen for messages
watch(() => props.consultationId, (newId) => {
  console.log(consultation.value, "helllo   jdjsh")
  if (newId) {
    messageStore.listenForMessages(newId);
  }
}, { immediate: true });



const sendMessage = () => {
  if (newMessage.value.trim() && props.consultationId) {
    messageStore.sendMessage(props.consultationId, newMessage.value);
    newMessage.value = '';
  }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Sending...';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const endChat = () => {
  if (consultation.value?.id) {
    store.endConsultation(consultation.value.id);
    messageStore.clearMessages(consultation.value.id);
  }
};

const takeOverChat = () => {
  if (consultation.value?.id) {
    store.takeOverChat(consultation.value.id);
  }
};

onMounted(() => {
  authStore.fetchUser();
});
</script>
<style scoped>
@media (max-width: 768px) {
  .bg-opacity-50 {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .w-full {
    width: 100%;
  }

  .max-w-lg {
    max-width: 100%;
  }

  .fixed {
    position: fixed;
  }
}

@media (max-width: 480px) {
  .w-full {
    width: 100%;
  }
  .max-w-lg {
    max-width: 100%;
  }
}

.chatbox-container {
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 15px;
}
</style>