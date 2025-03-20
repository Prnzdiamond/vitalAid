<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- ✅ Header Layout -->
    <header class="bg-green-600 p-4 text-white flex justify-between items-center">
      <h1 class="text-xl font-semibold">VitalAid Dashboard</h1>
      <div class="relative">
        <button @click="toggleNotifications" class="relative">
          🔔
          <span v-if="notifications.length" class="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 rounded-full">
            {{ notifications.length }}
          </span>
        </button>
        <div v-if="showNotifications" class="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-3">
          <p v-if="!notifications.length" class="text-gray-500">No new notifications</p>
          <ul v-else>
            <li v-for="(note, index) in notifications" :key="index" class="border-b p-2">{{ note }}</li>
          </ul>
        </div>
      </div>
      <NuxtLink to="/logout" class="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600">Logout</NuxtLink>
    </header>

    <!-- ✅ Layout with Sidebar & Main Content -->
    <div class="flex flex-1">
      <!-- Sidebar Navigation -->
      <aside class="w-64 bg-white p-6 shadow-lg">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Welcome, {{ user._tag }}!</h2>
        <ul class="space-y-4">
          <li><NuxtLink to="/events" class="block p-3 bg-blue-100 rounded-lg hover:bg-blue-200">📅 Events</NuxtLink></li>
          <li><NuxtLink to="/volunteer" class="block p-3 bg-blue-100 rounded-lg hover:bg-blue-200">🤝 Volunteer</NuxtLink></li>
          <li><NuxtLink to="/donate" class="block p-3 bg-blue-100 rounded-lg hover:bg-blue-200">💰 Donate</NuxtLink></li>
          <li v-if="user.role === 'Health_expert'">
            <NuxtLink to="/consultations" class="block p-3 bg-blue-100 rounded-lg hover:bg-blue-200">📋 Consultations</NuxtLink>
          </li>
          <li><NuxtLink to="/profile" class="block p-3 bg-blue-100 rounded-lg hover:bg-blue-200">👤 Profile</NuxtLink></li>
        </ul>
      </aside>

      <!-- Main Dashboard Content -->
      <main class="flex-1 p-8">
        <h2 class="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
        <p class="mt-2 text-gray-600">Welcome back, {{ user._tag }}! Here's what's happening:</p>

        <!-- General Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div class="bg-white p-4 shadow rounded-lg">
            <h3 class="text-lg font-semibold">📅 Latest Events</h3>
            <p class="text-gray-600">No upcoming events.</p>
          </div>
          <div class="bg-white p-4 shadow rounded-lg">
            <h3 class="text-lg font-semibold">🤝 Volunteer Opportunities</h3>
            <p class="text-gray-600">Join a community initiative.</p>
          </div>
          <div class="bg-white p-4 shadow rounded-lg">
            <h3 class="text-lg font-semibold">💰 Fund Requests</h3>
            <p class="text-gray-600">Support vital causes.</p>
          </div>
          <div class="bg-white p-4 shadow rounded-lg">
            <h3 class="text-lg font-semibold">🌱 Health & Green Life Tips</h3>
            <p class="text-gray-600">Stay informed and eco-friendly.</p>
          </div>
        </div>

        <!-- Role-Based Content -->
        <div v-if="user.role === 'health_expert'" class="mt-6">
          <h3 class="text-lg font-semibold">📋 Consultation Requests</h3>
          <p class="text-gray-600">You have pending consultations.</p>
          <a href="/consultations" class="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            View Consultations
          </a>
        </div>
      </main>
    </div>

    <!-- ✅ Chat Button (Floating) -->
    <button @click="toggleChat" class="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg">
      💬 Chat
    </button>

    <!-- ✅ Chatbox (Initially Hidden) -->
    <div v-if="showChat" class="fixed bottom-16 right-6 w-80 bg-white shadow-lg rounded-lg p-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Chat</h3>
        <button @click="toggleChat" class="text-red-500">✖</button>
      </div>
      <p class="text-gray-600 mt-2">Chat feature coming soon.</p>
    </div>
  </div>
</template>

<script setup>

definePageMeta({
  middleware: "auth",
});

import { ref, onMounted } from "vue";


const store = useAuthStore();

const user = ref({ _tag: "Loading...", role: "" });
const notifications = ref([]);
const showNotifications = ref(false);
const showChat = ref(false);

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const toggleChat = () => {
  showChat.value = !showChat.value;
};

// ✅ Fetch user details on component mount
onMounted(async () => {
  await store.fetchUser(); // Fetch user data from the store
  if (store.user) {
    user.value = store.user;
  } else {
    console.error("Failed to fetch user data.");
  }
});
</script>

