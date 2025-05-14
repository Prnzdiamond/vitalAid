<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold mb-4">My Donation Requests</h1>

    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>

    <div v-else-if="requests.length === 0" class="bg-gray-50 rounded-xl p-10 text-center">
      <div class="flex justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="text-xl font-medium text-gray-700">You haven't created any donation requests yet.</h3>
      <p class="text-gray-500 mt-2">Start by creating a new request and make a difference!</p>

      <NuxtLink to="/donate/create" class="mt-6 inline-block px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
        Create Request
      </NuxtLink>
    </div>

    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="request in requests" :key="request.id" class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <div class="h-48 bg-gray-100 relative">
          <div v-if="request.is_urgent" class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            URGENT
          </div>
          <img
            v-if="request.banner_url"
            :src="request.banner_url"
            :alt="request.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div class="p-5 flex flex-col flex-grow">
          <div class="text-sm text-green-600 font-medium mb-2">
            {{ request.category || 'General' }}
          </div>

          <h2 class="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{{ request.title }}</h2>

          <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ request.description }}</p>

          <div class="mt-auto">
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                class="bg-green-600 h-2.5 rounded-full"
                :style="`width: ${Math.min(100, (request.amount_received / request.amount_needed) * 100)}%`"
              ></div>
            </div>

            <div class="flex justify-between text-sm text-gray-500 mb-4">
              <span>₦{{ formatNumber(request.amount_received) }} raised</span>
              <span>₦{{ formatNumber(request.amount_needed) }} goal</span>
            </div>

            <div class="flex gap-2 mt-2">
              <NuxtLink
                :to="`/donate/${request.id}`"
                class="block w-1/3 text-center bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 rounded-md transition-colors"
              >
                View
              </NuxtLink>
              <NuxtLink
                v-if="user && request.org_id === user.id"
                :to="`/donate/edit/${request.id}`"
                class="block w-1/3 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded-md transition-colors"
              >
                Edit
              </NuxtLink>
              <button
                v-if="user && request.org_id === user.id"
                @click="deleteRequest(request.id)"
                class="block w-1/3 text-center bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 rounded-md transition-colors"
              >
                Delete
              </button>
              <span class="block w-1/3 text-center py-2 rounded-md" :class="statusClass(request.status)">
                {{ request.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useDonationStore } from "@/stores/donationStore";
import { useAuthStore } from "@/stores/authStore";
import { useNuxtApp } from '#app';
import { useSwal } from "@/composables/useSwal"; // Ensure this import is present

const donationStore = useDonationStore();
const authStore = useAuthStore();
const { swal, toast } = useSwal(); // Use both swal and toast
const { vueApp } = useNuxtApp();

const requests = ref([]);
const loading = ref(true);
const user = computed(() => authStore.user);

const fetchMyRequests = async () => {
  try {
    const res = await donationStore.fetchOrganizationRequests();
    requests.value = res.data.requests;
  } catch (err) {
    toast('Failed to fetch your donation requests', { type: 'error' });
  } finally {
    loading.value = false;
  }
};

const deleteRequest = async (id) => {
  swal.fire({
    title: "Are you sure?",
    text: "Are you sure you want to delete this donation request?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await donationStore.deleteDonationRequest(id);
        toast.fire('Donation request deleted', { type: 'success' });
        requests.value = requests.value.filter((r) => r.id !== id);
      } catch (err) {
        toast.fire('Failed to delete request', { type: 'error' });
      }
    } else if (result.dismiss === swal.DismissReason.cancel) {
      toast.fire('Deletion cancelled', { type: 'info' });
    }
  });
};

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const statusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

onMounted(() => {
  fetchMyRequests();
});
</script>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>