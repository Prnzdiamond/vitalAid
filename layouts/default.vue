<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- ✅ Global Header -->
    <HeaderComponent />

    <div class="flex flex-1">


      <!-- ✅ Main Content -->
      <main class="flex-1 p-8">
        <slot /> <!-- Page content is injected here -->
      </main>
    </div>

    <!-- ✅ Global Footer -->
    <FooterComponent />

    <!-- ✅ Global Chat Button -->
    <button
      @click="toggleChat"
      class="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg"
    >
      💬 Chat
    </button>

    <!-- ✅ Chat Popup (Uses Chatbox.vue) -->
    <Teleport to="body">
      <div v-if="showChat" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white w-full max-w-lg rounded-lg shadow-lg p-4 relative">
          <!-- Close Button -->
          <button
            @click="toggleChat"
            class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm"
          >
            ✖
          </button>

          <!-- Load Chatbox Component -->
          <Chatbox />
        </div>
      </div>
      
  
      <div class="p-4">
    <h2 class="text-lg font-semibold mb-2">Pending Consultations</h2>
    <ul v-if="store.unreadConsultations.length">
      <li v-for="consultation in store.unreadConsultations" :key="consultation.id"
          class="border p-2 rounded-md bg-yellow-100 flex justify-between items-center">
        <span>New consultation from {{ consultation.user_id }}</span>
        <button @click="store.acceptConsultation(consultation.id)"
                class="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600">
          Accept
        </button>
      </li>
    </ul>
    <p v-else class="text-gray-500">No new consultations</p>
  </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import HeaderComponent from '@/components/HeaderComponent.vue';
import FooterComponent from '@/components/FooterComponent.vue';
import Chatbox from '~/components/Chatbox.vue';
import { onMounted } from 'vue';

const store = useConsultationStore();
const showChat = ref(false);
const toggleChat = () => {
  showChat.value = !showChat.value;
};

// ✅ Hide sidebar on login and other auth pages
const route = useRoute();
// const showSidebar = computed(() => !['/login', '/register'].includes(route.path));




onMounted(() => {
    store.listenForNewConsultations();
});

</script>
