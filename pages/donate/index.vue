<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
  <div>
    <h1 class="text-3xl font-bold text-green-700 mb-2">Donation Requests</h1>
    <p class="text-gray-600">Help make a difference in someone's life today</p>
  </div>
  
  <!-- in production enable only charity -->
  <!-- v-if="user.role === 'charity' -->
  <div class="flex flex-wrap gap-3 mt-4 md:mt-0">
        <NuxtLink
        to="/donate/create"
        class="mt-4 md:mt-0 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-md"
        v-if="token.get()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Donation Request
      </NuxtLink>
      <NuxtLink
  to="/donate/my_request"
  class="mt-4 md:mt-0 md:ml-3 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md"
  v-if="token.get()"
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
  My Requests
</NuxtLink>

<NuxtLink
  to="/withdrawals"
  class="mt-4 md:mt-0 md:ml-3 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center shadow-md"
  v-if="token.get()"
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
  Withdrawals
</NuxtLink>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="requests.length === 0" class="bg-gray-50 rounded-xl p-10 text-center">
      <div class="flex justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="text-xl font-medium text-gray-700">No donation requests available</h3>
      <p class="text-gray-500 mt-2">Be the first to create a donation request and make an impact!</p>
      
      <NuxtLink v-if="token.get()" to="/donate/create" class="mt-6 inline-block px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
        Create Request
      </NuxtLink>
    </div>

    <!-- Donation requests grid -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="request in requests" :key="request.id" class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <!-- Banner image (placeholder if none) -->
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
        
        <!-- Content -->
        <div class="p-5 flex flex-col flex-grow">
          <!-- Category -->
          <div class="text-sm text-green-600 font-medium mb-2">
            {{ request.category || 'General' }}
          </div>
          
          <!-- Title -->
          <h2 class="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{{ request.title }}</h2>
          
          <!-- Description -->
          <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ request.description }}</p>
          
          <!-- Progress bar -->
          <div class="mt-auto">
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                class="bg-green-600 h-2.5 rounded-full" 
                :style="`width: ${Math.min(100, (request.amount_received / request.amount_needed) * 100)}%`"
              ></div>
            </div>
            
            <!-- Amount info -->
            <div class="flex justify-between text-sm text-gray-500 mb-4">
              <span>₦{{ formatNumber(request.amount_received) }} raised</span>
              <span>₦{{ formatNumber(request.amount_needed) }} goal</span>
            </div>
            
            <!-- View details button -->
            <NuxtLink 
              :to="`/donate/${request.id}`" 
              class="block w-full text-center bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 rounded-md transition-colors"
            >
              View Details
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useDonationStore } from "@/stores/donationStore";
import { useToken } from "@/composables/useToken";
import { useSwal } from "@/composables/useSwal"; // Assuming you have this composable

const donationStore = useDonationStore();
const authStore = useAuthStore();
const requests = ref([]);
const loading = ref(true);
const token = useToken();
const { swal } = useSwal(); // Get the swal function
const user = computed(() => authStore.user);

// Format numbers with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

onMounted(async () => {
  try {
    const data = await donationStore.fetchDonationRequests();
    console.log(data);
    requests.value = data.data.requests; // Ensure backend response is structured like: { requests: [...] }
  } catch (error) {
    console.error("Failed to load donation requests:", error);
    swal.fire({
      icon: 'error',
      title: 'Error loading requests',
      text: 'Failed to fetch donation requests. Please try again later.',
    });
  } finally {
    loading.value = false;
  }
});
</script>