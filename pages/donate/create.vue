<template>
  <section class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Create a Donation Request</h1>

    <DonationRequestForm @submit="handleCreate" />

    <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    <p v-if="success" class="text-green-600 mt-4">Request created successfully!</p>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useDonationStore } from "@/stores/donationStore";
import DonationRequestForm from "@/components/DonationRequestForm.vue";
import { useRouter } from "vue-router";


const donationStore = useDonationStore();
const router = useRouter();
const { swal } = useSwal(); // ✅ destructure swal from composable
const error = ref(null);
const success = ref(false);

async function handleCreate(payload) {
  error.value = null;
  success.value = false;

  try {
    const response = await donationStore.createDonationRequest(payload);

    if (response.success) {
      success.value = true;
      await swal.fire({
        title: "Success",
        text: "Donation request created successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });

      router.push("/donate");
    } else {
      error.value = "Something went wrong.";
      await swal.fire({
        title: "Error",
        text: error.value,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  } catch (err) {
    if (err?.data?.errors) {
      error.value = Object.values(err.data.errors).flat().join(", ");
    } else {
      error.value = "Failed to create donation request.";
    }

    await swal.fire({
      title: "Error",
      text: error.value,
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}
</script>
