<template>
  <div class="min-h-screen p-6 bg-gradient-to-br from-green-100 via-blue-100 to-white">
    <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6">
      <h2 class="text-3xl font-semibold text-green-600 text-center mb-6">Volunteer Opportunities</h2>

      <!-- Volunteer List -->
      <div v-for="opportunity in volunteerOpportunities" :key="opportunity.id" class="p-4 bg-gray-50 rounded-lg shadow mb-4">
        <h3 class="text-xl font-semibold text-gray-800">{{ opportunity.title }}</h3>
        <p class="text-gray-600">{{ opportunity.description }}</p>
        <p class="text-gray-500 text-sm">📍 Location: {{ opportunity.location }} | 🕒 {{ opportunity.date }}</p>
        <button 
          class="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          @click="joinVolunteer(opportunity.id)"
        >
          Join
        </button>
      </div>

      <!-- Volunteer History -->
      <h3 class="text-2xl font-semibold text-green-600 mt-8">My Volunteer History</h3>
      <ul v-if="volunteerHistory.length" class="mt-4">
        <li v-for="history in volunteerHistory" :key="history.id" class="p-3 bg-gray-100 rounded-lg shadow mb-2">
          ✅ {{ history.title }} ({{ history.date }})
        </li>
      </ul>
      <p v-else class="text-gray-500 mt-4">No past sign-ups yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Dummy data for MVP
const volunteerOpportunities = ref([
  { id: 1, title: "Community Clean-Up", description: "Help clean up parks and streets.", location: "Downtown", date: "March 25, 2025" },
  { id: 2, title: "Food Drive Assistance", description: "Assist in packing and distributing food.", location: "Local Shelter", date: "March 28, 2025" },
  { id: 3, title: "Senior Care Visits", description: "Spend time with elderly residents.", location: "Care Home", date: "April 2, 2025" }
]);

const volunteerHistory = ref([]);

// Handle Join Button
const joinVolunteer = (id) => {
  const selected = volunteerOpportunities.value.find(opportunity => opportunity.id === id);
  if (selected && !volunteerHistory.value.some(v => v.id === id)) {
    volunteerHistory.value.push(selected);
  }
};
</script>
