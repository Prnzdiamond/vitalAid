<template>
  <section class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4 text-green-700">Edit Donation Request</h1>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else>
      <DonationRequestForm
        :initialData="donationRequest"
        :isEdit="true"
        @submit="handleUpdate"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDonationStore } from "@/stores/donationStore";
import DonationRequestForm from "@/components/DonationRequestForm.vue";

const route = useRoute();
const router = useRouter();
const donationStore = useDonationStore();

const donationRequest = ref(null);
const loading = ref(true);
const error = ref(null);
const { swal } = useSwal();

onMounted(async () => {
  try {
    const data = await donationStore.fetchDonationRequest(route.params.id);
    donationRequest.value = {
      org_id: data.data.request.org_id, // Assuming org_id is available
      title: data.data.request.title,
      description: data.data.request.description,
      amount_needed: data.data.request.amount_needed,
      banner_url: data.data.request.banner_url,
      other_images: data.data.request.other_images || [], // Ensure it's an array
      category: data.data.request.category,
      is_urgent: data.data.request.is_urgent,
      // Add any other fields your form manages here
    };
  } catch (err) {
    error.value = "Failed to load donation request.";
  } finally {
    loading.value = false;
  }
});

async function handleUpdate(updatedData) {
  try {
    await donationStore.updateDonationRequest(route.params.id, updatedData);
    swal.fire({
      icon: "success",
      title: "Success",
      text: "Donation request updated successfully!",
      confirmButtonText: "OK",
    });
    
    router.push("/charity/donations"); // redirect to listing or dashboard
  } catch (err) {
    swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Failed to update donation request. Please try again.",
      confirmButtonText: "OK",
    })
    
  }
}
</script>
