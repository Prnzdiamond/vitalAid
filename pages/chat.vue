<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-green-600 text-white p-4 flex justify-between items-center">
      <h2 class="text-xl font-semibold">Health Consultation</h2>
      <div :class="doctorAvailable ? 'bg-green-400' : 'bg-red-400'" class="px-3 py-1 rounded-full text-sm">
        {{ doctorAvailable ? 'Doctor Available' : 'AI Responding' }}
      </div>
    </div>

    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-for="(message, index) in messages" :key="index" 
           :class="message.sender === 'user' ? 'justify-end' : 'justify-start'" 
           class="flex">
        <div :class="message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'"
             class="p-3 rounded-lg max-w-xs">
          {{ message.text }}
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="p-4 bg-white shadow-lg flex">
      <input v-model="newMessage" type="text" placeholder="Type your message..." 
             class="flex-1 p-2 border rounded-lg focus:ring focus:ring-green-200">
      <button @click="sendMessage" class="ml-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
        Send
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Dummy chat messages
const messages = ref([
  { sender: 'doctor', text: 'Hello! How can I assist you today?' },
  { sender: 'user', text: 'I have a headache and fever.' },
  { sender: 'doctor', text: 'Have you taken any medication yet?' },
]);

// Doctor availability (toggle for testing)
const doctorAvailable = ref(true);
const newMessage = ref('');

const sendMessage = () => {
  if (!newMessage.value.trim()) return;

  // Add user message
  messages.value.push({ sender: 'user', text: newMessage.value });
  
  // Simulate a reply (Doctor or AI)
  setTimeout(() => {
    const reply = doctorAvailable.value 
      ? 'Let me check your symptoms. Can you describe your fever?' 
      : 'I am AI. Based on symptoms, consider taking paracetamol.';

    messages.value.push({ sender: 'doctor', text: reply });
  }, 1000);

  newMessage.value = '';
};
</script>
