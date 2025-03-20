<template>
  <div class="w-full max-w-lg bg-white rounded-lg shadow-lg border p-4">
    <div v-if="store.activeConsultation">
      <!-- ✅ Chat Header -->
      <div class="bg-blue-600 text-white text-center py-2 rounded-t-md">
        <h2 class="text-lg font-semibold">Consultation</h2>
      </div>

      <!-- ✅ Messages -->
      <div class="h-60 overflow-y-auto p-3 bg-gray-50">
       <div v-for="msg in store.messages" :key="msg.timestamp"
     :class="{'text-right': msg.sender === user.name, 'text-left': msg.sender !== user.name}">
  
  <!-- Sender Name -->
  <span class="block text-sm font-semibold">{{ msg.sender }}</span>
  
  <!-- Message Bubble -->
  <p class="inline-block px-3 py-2 rounded-lg text-sm my-1"
     :class="{
       'bg-gray-300 text-black': msg.sender !== user.name && !msg.temp,
       'bg-blue-500 text-white': msg.sender === user.name && !msg.temp,
       'bg-white text-gray-500 opacity-50 italic text-left': msg.temp // ✅ Pending message style
     }">
    {{ msg.message }}
  </p>

  <!-- ✅ Timestamp -->
  <span class="block text-xs text-gray-400">
    {{ formatTimestamp(msg.timestamp) }}
  </span>
</div>

      </div>

      <!-- ✅ Input & Send Button -->
      <div class="flex gap-2 mt-2">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message..."
               class="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
        <button @click="sendMessage" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Send
        </button>
      </div>
    </div>

    <div v-else class="text-center">
      <button @click="store.requestConsultation" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
        Request Consultation
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useConsultationStore } from '@/stores/consultationStore';
import { useAuthStore } from '~/stores/authStore';

const store = useConsultationStore();
const authStore = useAuthStore();
const user = authStore.user;
const newMessage = ref('');

// Watch for changes in activeConsultation and listen only when it's set
watch(() => store.activeConsultation, (newVal) => {
  if (newVal?.id) {
       store.listenForMessages();
    }
  });
  
  const sendMessage = () => {
    if (newMessage.value.trim()) {
      store.sendMessage(newMessage.value);
        newMessage.value = '';
    }
};
const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Sending...';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
   store.listenForMessages();
    authStore.fetchUser();
});
</script>
