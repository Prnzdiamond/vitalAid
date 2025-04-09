<template>
  <div class="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-white py-8">
    <div class="w-full max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-8">

      <!-- Profile Header with Cover Photo and Avatar -->
      <div class="relative">
        <!-- Cover Photo -->
        <div class="w-full h-40 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-t-2xl"></div>
        
        <!-- Profile Picture -->
        <div class="absolute top-28 left-8 w-24 h-24 rounded-full bg-gray-300 overflow-hidden border-4 border-white">
          <img src="https://via.placeholder.com/150" alt="Profile Picture" class="w-full h-full object-cover" />
        </div>
        
        <!-- Profile Info -->
        <div class="ml-40 mt-4">
          <h2 class="text-3xl font-semibold text-green-600">{{ user.fullName }}</h2>
          <p class="text-sm text-gray-600">{{ user.role }}</p>
          <p class="text-sm text-gray-500">{{ user.email }}</p>
        </div>
      </div>

      <!-- Tabs for Different Sections -->
      <div class="mt-8 flex space-x-4 border-b border-gray-300 pb-2">
        <button @click="activeTab = 'overview'" :class="{'border-b-2 border-green-600': activeTab === 'overview'}" class="text-xl text-gray-700 px-4 py-2">Overview</button>
        <button @click="activeTab = 'donations'" :class="{'border-b-2 border-green-600': activeTab === 'donations'}" class="text-xl text-gray-700 px-4 py-2">Donations</button>
        <button @click="activeTab = 'consultations'" :class="{'border-b-2 border-green-600': activeTab === 'consultations'}" class="text-xl text-gray-700 px-4 py-2">Consultations</button>
        <button @click="activeTab = 'settings'" :class="{'border-b-2 border-green-600': activeTab === 'settings'}" class="text-xl text-gray-700 px-4 py-2">Settings</button>
      </div>

      <!-- Tab Content -->
      <div class="mt-8">
        <div v-if="activeTab === 'overview'">
          <!-- Overview Section -->
          <h3 class="text-xl font-semibold text-green-600">Your Overview</h3>
          <p class="mt-4 text-gray-700">Here, you can see a quick overview of your activity and contributions to the platform.</p>

          <div class="mt-6">
            <h4 class="text-lg font-semibold text-gray-700">Activity Feed</h4>
            <div v-for="activity in activities" :key="activity.id" class="border-b border-gray-200 py-2">
              <p class="text-gray-700">{{ activity.description }}</p>
              <p class="text-sm text-gray-500">Date: {{ activity.date }}</p>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'donations'">
          <!-- Donations Section -->
          <h3 class="text-xl font-semibold text-green-600">Your Donations</h3>
          <div v-if="userDonations.length">
            <ul class="mt-4">
              <li v-for="donation in userDonations" :key="donation.id" class="border-b border-gray-300 py-3">
                <p class="text-gray-700">Donation to: <span class="font-semibold">{{ donation.charityName }}</span></p>
                <p class="text-sm text-gray-500">Amount: ${{ donation.amount }}</p>
                <p class="text-sm text-gray-500">Date: {{ donation.date }}</p>
              </li>
            </ul>
          </div>
          <div v-else>
            <p class="text-gray-500">No donations made yet.</p>
          </div>
        </div>

        <div v-if="activeTab === 'consultations'">
          <!-- Consultations Section -->
          <h3 class="text-xl font-semibold text-green-600">Consultations</h3>
          <div v-if="requestedConsultations.length">
            <ul class="mt-4">
              <li v-for="consultation in requestedConsultations" :key="consultation.id" class="border-b border-gray-300 py-3">
                <p class="text-gray-700">Consultation with: <span class="font-semibold">{{ consultation.patientName }}</span></p>
                <p class="text-sm text-gray-500">Status: {{ consultation.status }}</p>
                <p class="text-sm text-gray-500">Date: {{ consultation.date }}</p>
              </li>
            </ul>
          </div>
          <div v-else>
            <p class="text-gray-500">No consultations requested yet.</p>
          </div>
        </div>

        <div v-if="activeTab === 'settings'">
          <!-- Settings Section -->
          <h3 class="text-xl font-semibold text-green-600">Settings</h3>
          <div class="mt-6">
            <button @click="goToSettingsPage" class="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition">
              Edit Profile & Verification
            </button>
          </div>
        </div>
      </div>

      <!-- Buttons to logout -->
      <div class="flex justify-between mt-8">
        <button @click="logout" class="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const user = ref({
  fullName: 'John Doe',
  email: 'johndoe@example.com',
  role: 'Health Expert',
});

const activeTab = ref('overview'); // Active tab to switch content

// Dummy Data for Tabs
const activities = ref([
  { id: 1, description: 'Made a donation to Save the Earth', date: '2025-04-01' },
  { id: 2, description: 'Joined a health awareness event', date: '2025-03-15' },
  { id: 3, description: 'Requested a consultation with Alex Brown', date: '2025-04-03' },
]);

const userDonations = ref([
  { id: 1, charityName: 'Save the Earth', amount: 50, date: '2025-04-01' },
  { id: 2, charityName: 'Helping Hands', amount: 25, date: '2025-03-15' },
]);

const requestedConsultations = ref([
  { id: 1, patientName: 'Jane Smith', status: 'Requested', date: '2025-04-10' },
  { id: 2, patientName: 'Alex Brown', status: 'Accepted', date: '2025-04-12' },
]);

const goToSettingsPage = () => {
  console.log('Navigating to settings...');
  // TODO: Implement navigation to settings page
};

const logout = () => {
  console.log('User Logged Out');
  // TODO: Implement actual logout logic
};
</script>

<style scoped>
/* Enhanced UI Styles */
body {
  font-family: 'Inter', sans-serif;
}
</style>
