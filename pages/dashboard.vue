<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- ✅ Dashboard Header -->
    <header class="p-4 text-black flex justify-between items-center shadow-md ">
      <h1 class="text-2xl font-bold">VitalAid Dashboard</h1>
    </header>

    <!-- ✅ Main Content Layout -->
    <div class="flex flex-1">
      <main class="flex-1 p-8">
        <h2 class="text-3xl font-semibold text-gray-800 mb-4">Dashboard Overview</h2>
        <p class="text-gray-600 mb-6">Welcome back, {{ user._tag }}! Here’s what’s happening:</p>

        <!-- ✅ Dashboard Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard title="Latest Events" content="No upcoming events." icon="📅" />
          <DashboardCard title="Volunteer Opportunities" content="Join a community initiative." icon="🤝" />
          <DashboardCard title="Fund Requests" content="Support vital causes." icon="💰" />
          <DashboardCard title="Health & Green Life Tips" content="Stay informed and eco-friendly." icon="🌱" />
        </div>

        <!-- ✅ Role-Specific Content -->
        <div v-if="user.role === 'health_expert'" class="mt-8">
          <h3 class="text-xl font-semibold mb-2">📋 Consultation Requests</h3>
          <p class="text-gray-600">You have pending consultations.</p>
          <NuxtLink to="/consultations" class="inline-block bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 mt-3 transition">
            View Consultations
          </NuxtLink>
        </div>
      </main>
    </div>

    <!-- ✅ Floating Chat Button -->
    <button @click="toggleChat" class="fixed bottom-6 right-6 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 transition">
      💬 Chat
    </button>

    <!-- ✅ Chat Popup -->
    <Teleport to="body">
      <div v-if="showChat" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white w-80 rounded-lg shadow-lg p-4 relative">
          <button @click="toggleChat" class="absolute top-2 right-2 text-red-500">✖</button>
          <h3 class="text-lg font-semibold">Chat</h3>
          <p class="text-gray-600 mt-2">Chat feature coming soon.</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
// definePageMeta({ middleware: "auth" });

import { ref, onMounted } from "vue";
import DashboardCard from "@/components/DashboardCard.vue";

const authstore = useAuthStore();
const echostore = useEchoStore();
const user = ref({ _tag: "Loading...", role: "" });
const showChat = ref(false);

const toggleChat = () => {
  showChat.value = !showChat.value;
};

// ✅ Fetch user details
onMounted(async () => {
  await authstore.fetchUser();
  if (authstore.user) user.value = authstore.user;
});
</script>

<style scoped>
/* Ensure the dashboard layout is responsive */
@media (max-width: 768px) {
  .dashboard-card {
    width: 100%;
  }
}

.dashboard-link {
  text-decoration: none;
  color: #2d3748;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.dashboard-link:hover {
  background-color: #f0fdf4; /* Light green on hover */
  color: #38a169; /* Green color on hover */
}
</style>
