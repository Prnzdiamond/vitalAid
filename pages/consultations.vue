<template>
  <div class="consultations-container flex h-screen">
    <!-- Left side: List of Consultations -->
    <div class="consultations-list flex-1 overflow-y-auto p-4">
      <h3 class="text-xl font-semibold mb-4">Consultations</h3>

      <!-- If no consultations available -->
      <div v-if="consultationStore.expertConsultations.length === 0">
        <p>No consultations at the moment.</p>
      </div>

      <!-- List of consultations -->
      <ul>
        <li
          v-for="consultation in consultationStore.expertConsultations"
          :key="consultation.id"
          class="cursor-pointer hover:bg-gray-100 p-2 mb-2 rounded"
          @click="handleConsultationClick(consultation)"
        >
          <p class="font-medium">Consultation with: {{ consultation.patientName }}</p>
          <p class="text-sm text-gray-500">Status: {{ consultation.status }}</p>
        </li>
      </ul>
    </div>

    <!-- Right side: Active Consultation (Chatbox) -->

    <div v-if="consultationStore.activeExpertConsultation" class="chatbox-container flex-3 p-4 border-l border-gray-200">
       <Chatbox :consultation-id="consultationStore.activeExpertConsultation.id" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useConsultationStore } from "@/stores/consultationStore";

// Dummy data for consultations
const consultationStore = useConsultationStore();



// Dummy user role for health expert
const user = ref({ role: "health_expert" });

// Handle when health expert clicks a consultation to view it
const handleConsultationClick = (consultation) => {
  consultationStore.setActiveConsultationForExpert(consultation.id);
};
</script>

<style scoped>
.consultations-container {
  display: flex;
  flex-direction: row;
}

.consultations-list {
  flex: 1;
  max-width: 300px;
  border-right: 1px solid #e0e0e0;
}

.chatbox-container {
  flex: 3;
}

li {
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

li:hover {
  background-color: #f4f4f4;
}
</style>
