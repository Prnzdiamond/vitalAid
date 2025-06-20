<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">{{ error }}</p>
        </div>
      </div>
    </div>
    
    <!-- Donation detail -->
    <div v-else class="space-y-8">
      <!-- Back button -->
      <button class="inline-flex items-center text-green-600 hover:text-green-700 font-medium" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>
      
      <!-- Donation Header -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <!-- Banner image -->
        <div class="h-64 bg-gray-100 relative">
          <div v-if="donation.is_urgent" class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            URGENT
          </div>
          <img 
            v-if="donation.banner_url" 
            :src="donation.banner_url" 
            :alt="donation.title" 
            class="w-full h-full object-cover cursor-pointer"
            @click="openSlideshow(0)"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        <!-- Content -->
        <div class="p-6">
          <div class="flex items-center mb-2">
            <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {{ donation.category || 'General' }}
            </span>
            <span v-if="donation.status" class="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {{ donation.status.charAt(0).toUpperCase() + donation.status.slice(1) }}
            </span>
          </div>
          
          <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ donation.title }}</h1>
          
          <!-- Creator info if available -->
          <div v-if="donation.created_by" class="flex items-center text-sm text-gray-500 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Created by {{ donation.created_by }}
          </div>
          
          <!-- Progress information -->
          <div class="mb-6">
            <div class="flex justify-between mb-1 text-sm font-medium">
              <span>Progress</span>
              <span>{{ Math.min(100, Math.round((donation.amount_received / donation.amount_needed) * 100)) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                class="bg-green-600 h-2.5 rounded-full" 
                :style="`width: ${Math.min(100, (donation.amount_received / donation.amount_needed) * 100)}%`"
              ></div>
            </div>
            
            <div class="flex justify-between mt-4">
              <div>
                <p class="text-sm text-gray-500">Raised</p>
                <p class="text-xl font-bold text-gray-800">₦{{ formatNumber(donation.amount_received) }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">Goal</p>
                <p class="text-xl font-bold text-gray-800">₦{{ formatNumber(donation.amount_needed) }}</p>
              </div>
            </div>
          </div>

          <!-- Available Balance for Owner -->
          <div v-if="isOwner && availableBalance > 0" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-green-700 font-medium">Available for Withdrawal</p>
                <p class="text-2xl font-bold text-green-800">₦{{ formatNumber(availableBalance) }}</p>
                <p class="text-xs text-green-600 mt-1">
                  Previously withdrawn: ₦{{ formatNumber(donation.withdrawn_amount || 0) }}
                </p>
              </div>
              <button
                @click="openWithdrawalModal"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Withdraw Funds
              </button>
            </div>
          </div>
          
          <!-- Action buttons -->
          <div class="flex flex-wrap gap-3">
            <button
              @click="openDonateModal"
              class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg flex items-center justify-center transition-colors shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Donate Now
            </button>
            
            <!-- Owner actions - only show if user is the creator -->
            <div v-if="isOwner" class="flex gap-2">
              <NuxtLink 
                :to="`/donate/edit/${donation.id}`"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </NuxtLink>
              
              <button 
                @click="markAsCompleted(donation.id)"
                class="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg flex items-center transition-colors"
                v-if="donation.status !== 'completed'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Mark Complete
              </button>
              <button
                v-if="user && donation.org_id === authStore.user.id"
                @click="deleteRequest(donation.id)"
                 class="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Description -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">About this donation</h2>
        <div class="prose max-w-none text-gray-700">
          <p class="whitespace-pre-line">{{ donation.description }}</p>
        </div>
      </div>
      
      <!-- Gallery - only show if there are other images -->
      <div v-if="allImages.length > 1" class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Gallery</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div 
            v-for="(image, index) in allImages.slice(1)" 
            :key="index" 
            class="h-32 md:h-48 bg-gray-100 rounded-md overflow-hidden cursor-pointer"
            @click="openSlideshow(index + 1)"
          >
            <img :src="image" :alt="`Gallery image ${index+1}`" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
      
      <!-- Recent donors - if we have donation data -->
      <div v-if="donation.donations && donation.donations.length > 0" class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Recent Donors</h2>
        <div class="max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <ul class="divide-y divide-gray-200">
            <li v-for="(donor, index) in donation.donations" :key="index" class="py-4 flex justify-between">
              <div class="flex items-center">
                <svg v-if="donor.is_anonymous" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p class="font-medium text-gray-800">{{ donor.is_anonymous ? 'Anonymous Donor' : donor.user_tag }}</p>
                  <p class="text-sm text-gray-500">{{ formatDate(donor.created_at) }}</p>
                </div>
              </div>
              <span class="font-medium text-green-600">₦{{ formatNumber(donor.amount) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

   <!-- Donation Modal -->
    <DonationModal
      v-if="showModal"
      @close="showModal = false; verificationData = null"
      :id="donation.id"
      :verification-data="verificationData"
      @donation-successful="handleDonationSuccessful"
    />

    <!-- Withdrawal Modal -->
    <WithdrawalModal
      v-if="showWithdrawalModal"
      @close="showWithdrawalModal = false"
      :campaign="donation"
      :available-balance="availableBalance"
      @withdrawal-successful="handleWithdrawalSuccessful"
    />

    <!-- Image Slideshow Modal -->
    <ImageSlideshow
      v-if="showSlideshow"
      :images="allImages"
      :initial-index="currentSlideIndex"
      @close="showSlideshow = false"
    />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth-optional'
})

import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDonationStore } from "@/stores/donationStore";
import { useAuthStore } from "@/stores/authStore";
import { useSwal } from '@/composables/useSwal';
import DonationModal from "@/components/DonationModal.vue";
import WithdrawalModal from "@/components/WithdrawalModal.vue";
import ImageSlideshow from "@/components/ImageSlideshow.vue";

const route = useRoute();
const router = useRouter();
const donationStore = useDonationStore();
const authStore = useAuthStore();
const donation = ref(null);
const error = ref(null);
const loading = ref(true);
const showModal = ref(false);
const showWithdrawalModal = ref(false);
const user = computed(() => authStore.user);
const { swal, toast } = useSwal();
const verificationData = ref(null);

// Slideshow state
const showSlideshow = ref(false);
const currentSlideIndex = ref(0);

// Computed property to combine banner and other images
const allImages = computed(() => {
  if (!donation.value) return [];
  
  const images = [];
  
  // Add banner image as the first image if it exists
  if (donation.value.banner_url) {
    images.push(donation.value.banner_url);
  }
  
  // Add other images if they exist
  if (donation.value.other_images && Array.isArray(donation.value.other_images)) {
    images.push(...donation.value.other_images);
  }
  
  return images;
});

// Check if current user is the owner of this donation request
const isOwner = computed(() => {
  if (!donation.value || !authStore.user) return false;
  return donation.value.org_id === authStore.user.id;
});

// Calculate available balance for withdrawal
const availableBalance = computed(() => {
  if (!donation.value) return 0;
  const received = donation.value.amount_received || 0;
  const withdrawn = donation.value.withdrawn_amount || 0;
  return Math.max(0, received - withdrawn);
});

// Function to open slideshow at a specific index
const openSlideshow = (index) => {
  currentSlideIndex.value = index;
  showSlideshow.value = true;
};

// Format numbers with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
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
        router.push('/donate'); // Navigate away after deletion
      } catch (err) {
        toast.fire('Failed to delete request', { type: 'error' });
      }
    } else if (result.dismiss === swal.DismissReason.cancel) {
      toast.fire('Deletion cancelled', { type: 'info' });
    }
  });
};

// Mark donation as completed
const markAsCompleted = async (requestId) => {
  // Check if the request has not yet received full donations
  if (donation.value.amount_needed > donation.value.amount_received) {
    const confirm = await swal.fire({
      title: 'Are you sure?',
      text: 'This request has not received the full amount. Do you still want to mark it as completed?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, mark it',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) {
      return; // Exit if user cancels
    }
  }

  // Proceed to mark as completed
  try {
    const result = await donationStore.markAsCompleted(requestId);

    if (result.success) {
      await swal.fire({
        title: 'Success!',
        text: 'The request has been marked as completed.',
        icon: 'success',
      });

      // Update the donation data
      donation.value = result.data.request;
    } else {
      await swal.fire({
        title: 'Error!',
        text: result.message || 'Something went wrong.',
        icon: 'error',
      });
    }
  } catch (error) {
    await swal.fire({
      title: 'Error!',
      text: 'Failed to update donation request status.',
      icon: 'error',
    });
  }
};

// Function to open donation modal
const openDonateModal = () => {
  if (!authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    const loginPath = `/auth/login?redirect=${encodeURIComponent(route.fullPath)}`;
    router.push(loginPath);
    return;
  }
  
  showModal.value = true;
};

// Function to open withdrawal modal
const openWithdrawalModal = () => {
  if (availableBalance.value <= 0) {
    toast.fire('No funds available for withdrawal', { type: 'warning' });
    return;
  }
  showWithdrawalModal.value = true;
};

// Handler for successful donation
const handleDonationSuccessful = (newDonation) => {
  if (donation.value) {
    // Update the donation amount received
    donation.value.amount_received += newDonation.amount;
    
    // Update the status if fully funded
    if (donation.value.amount_received >= donation.value.amount_needed && 
        donation.value.status !== 'completed') {
      donation.value.status = 'funded';
    }
    
    // Add the new donation to the donations list
    if (donation.value.donations) {
      donation.value.donations.unshift(newDonation); // Add to the beginning of the list
    } else {
      donation.value.donations = [newDonation];
    }
  }
};

// Handler for successful withdrawal
const handleWithdrawalSuccessful = (withdrawalAmount) => {
  if (donation.value) {
    // Update the withdrawn amount
    donation.value.withdrawn_amount = (donation.value.withdrawn_amount || 0) + withdrawalAmount;
    
    // Show success message
    toast.fire('Withdrawal request submitted successfully!', { type: 'success' });
  }
};

onMounted(async () => {
  try {
    const result = await donationStore.fetchDonationRequest(route.params.id);
    donation.value = result.data.request;

    // Check URL parameters to see if we're returning from a payment process
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const donationId = urlParams.get('donation_id');
    const reference = urlParams.get('reference');
    const trxref = urlParams.get('trxref');
    const error = urlParams.get('error');
    
    // If we have payment-related parameters, prepare verification data and open the modal
    if (donationId || error || reference || trxref) {
      verificationData.value = {
        verified,
        donationId,
        reference,
        trxref,
        error
      };
      showModal.value = true;
      
      // Clear URL parameters after processing
      if (window.history.replaceState) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  } catch (err) {
    error.value = "Unable to fetch donation request. Please try again later.";
    console.error("Error fetching donation request:", err);
  } finally {
    loading.value = false;
  }
});
</script>

<style>
/* Custom scrollbar styles */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* For Firefox */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f1f1f1;
}
</style>