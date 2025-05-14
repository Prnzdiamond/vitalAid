<template>
  <div class="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-70 z-50">
    <div class="bg-white p-8 rounded-lg w-full max-w-md shadow-xl">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-green-700">Make a Donation</h2>
        <button
          @click="emit('close')"
          class="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Donation Form -->
      <form v-if="!processingPayment && !verifyingPayment" @submit.prevent="handleDonate" class="space-y-6">
        <!-- Amount Input -->
        <div>
          <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₦</span>
            <input
              id="amount"
              v-model="donationAmount"
              type="number"
              class="border border-gray-300 rounded-lg py-3 px-4 pl-8 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              min="1"
              placeholder="Enter donation amount"
              required
            />
          </div>
        </div>

        <!-- Quick Amount Selection -->
        <div class="grid grid-cols-3 gap-2">
          <button 
            type="button" 
            @click="donationAmount = 1000" 
            class="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
          >
            ₦1,000
          </button>
          <button 
            type="button" 
            @click="donationAmount = 5000" 
            class="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
          >
            ₦5,000
          </button>
          <button 
            type="button" 
            @click="donationAmount = 10000" 
            class="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
          >
            ₦10,000
          </button>
        </div>

        <!-- Anonymous Checkbox -->
        <div class="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            v-model="isAnonymous"
            class="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label for="anonymous" class="ml-2 block text-sm text-gray-700">
            Donate Anonymously
          </label>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            class="w-full bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 text-white font-medium py-3 px-4 rounded-lg transition-all"
            :disabled="donating"
          >
            <span v-if="donating" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
            <span v-else>Continue to Payment</span>
          </button>
        </div>
      </form>

      <!-- Payment Processing UI -->
      <div v-if="processingPayment" class="space-y-6 text-center">
        <div class="text-gray-700">
          <div class="flex justify-center mb-4">
            <svg class="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-lg font-medium mb-2">Redirecting to Payment Gateway</p>
          <p class="text-sm text-gray-500">Please do not close this window. You'll be redirected to Paystack to complete your donation.</p>
        </div>
      </div>

      <!-- Payment Verification UI (shown when redirected back) -->
      <div v-if="verifyingPayment" class="space-y-6 text-center">
        <div class="text-gray-700">
          <div class="flex justify-center mb-4">
            <svg class="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-lg font-medium mb-2">Verifying Payment</p>
          <p class="text-sm text-gray-500">Please wait while we verify your donation.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useDonationStore } from "@/stores/donationStore";
import { useAuthStore } from "@/stores/authStore";
import { useSwal } from '@/composables/useSwal';
import { useRoute } from 'vue-router';
import { useToken } from '@/composables/useToken';

const emit = defineEmits(['close', 'donation-successful']);
const props = defineProps({
  id: {
    type: String,
    required: true
  },
  verificationData: {
    type: Object,
    default: null
  }
});
const donationAmount = ref(null);
const isAnonymous = ref(false);
const donating = ref(false);
const processingPayment = ref(false);
const verifyingPayment = ref(false);
const donationStore = useDonationStore();
const authStore = useAuthStore();
const { swal } = useSwal();
const route = useRoute();

// Check if we're returning from Paystack with reference
onMounted(() => {
  const savedToken = localStorage.getItem('donation_auth_token');
  if (savedToken) {
    const tokenService = useToken();
    tokenService.set(savedToken);
    // Clear it after use
    localStorage.removeItem('donation_auth_token');
  }

  // Check if we have verification data passed as props
  if (props.verificationData) {
    const { verified, donationId, reference, trxref, error } = props.verificationData;
    
    if (donationId) {
      if (verified === 'true') {
        // Payment was already verified by the backend during redirect
        handlePaymentSuccess(donationId);
      } else if (verified === 'false') {
        // Payment verification failed during redirect
        handlePaymentFailure();
      } else {
        // No specific indicators, but we have a donation ID, so verify
        verifyingPayment.value = true;
        verifyPayment(donationId);
      }
    } else if (error) {
      handlePaymentError(error);
    }
    
    return; // Exit early if we've handled verification data
  }

  // Handle URL parameters directly (fallback for direct visits)
  const urlParams = new URLSearchParams(window.location.search);
  const verified = urlParams.get('verified');
  const donationId = urlParams.get('donation_id');
  const error = urlParams.get('error');
  
  if (donationId) {
    if (verified === 'true') {
      // Payment was already verified by the backend during redirect
      handlePaymentSuccess(donationId);
    } else if (verified === 'false') {
      // Payment verification failed during redirect
      handlePaymentFailure();
    } else {
      // No specific indicators, but we have a donation ID, so verify
      verifyingPayment.value = true;
      verifyPayment(donationId);
    }
  } else if (error) {
    handlePaymentError(error);
  }
  
  // Clear URL parameters after processing
  if (window.history.replaceState) {
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }
});

// Add these new helper methods
const handlePaymentSuccess = async (donationId) => {
  try {
    // Get the donation details if needed
    const response = await donationStore.verifyDonation(donationId);
    
    // Show success message
    swal.fire({
      icon: 'success',
      title: 'Donation Successful',
      text: 'Thank you for your generous donation!',
    });
    
    // Emit success event
    emit('donation-successful', {
      amount: response.data.donation.amount, 
      is_anonymous: response.data.donation.is_anonymous, 
      created_at: response.data.donation.created_at,
      user_tag: authStore.user ? authStore.user._tag : 'Anonymous'
    });
    
    // Close modal
    emit('close');
  } catch (err) {
    console.error("Error getting donation details:", err);
    // We still consider this successful since the backend verified it
    swal.fire({
      icon: 'success',
      title: 'Donation Successful',
      text: 'Thank you for your generous donation!',
    });
    emit('close');
  }
};

const handlePaymentFailure = () => {
  swal.fire({
    icon: 'error',
    title: 'Payment Failed',
    text: 'Your payment was not successful. Please try again.',
  });
  emit('close');
};

const handlePaymentError = (errorType) => {
  let errorMessage = 'An error occurred during payment processing.';
  
  if (errorType === 'not_found') {
    errorMessage = 'We could not find your donation record.';
  } else if (errorType === 'verification_failed') {
    errorMessage = 'We could not verify your payment at this time.';
  }
  
  swal.fire({
    icon: 'error',
    title: 'Payment Error',
    text: errorMessage,
  });
  emit('close');
};

const handleDonate = async () => {
  if (!donationAmount.value) {
    swal.fire({
      icon: 'warning',
      title: 'Invalid Amount',
      text: 'Please enter a valid donation amount.',
    });
    return;
  }

  donating.value = true;

  const payload = {
    donation_request_id: props.id,
    amount: donationAmount.value,
    is_anonymous: isAnonymous.value,
  };

  try {
    // Save the current auth token to localStorage before redirecting
    const currentToken = useToken().get();
    if (currentToken) {
      localStorage.setItem('donation_auth_token', currentToken);
    }
    
    const response = await donationStore.donate(payload);
    
    // Store donation ID for verification after redirect
    if (response.success && response.data && response.data.donation_id) {
      localStorage.setItem('currentDonationId', response.data.donation_id);
    }
    
    // Show processing UI
    processingPayment.value = true;
    donating.value = false;
    
    // Redirect to Paystack
    if (response.success && response.data && response.data.authorization_url) {
      window.location.href = response.data.authorization_url;
    } else {
      throw new Error('No payment URL provided');
    }
  } catch (err) {
    donating.value = false;
    swal.fire({
      icon: 'error',
      title: 'Donation Failed',
      text: 'Failed to initialize donation. Please try again.',
    });
  }
};

// We don't need this method anymore since verification happens server-side
const verifyPayment = async (donationId) => {
  try {
    // Check if we have a valid token before making the request
    const tokenService = useToken();
    if (!tokenService.get()) {
      // Token is missing, try to recover from localStorage
      const savedToken = localStorage.getItem('donation_auth_token');
      if (savedToken) {
        tokenService.set(savedToken);
        localStorage.removeItem('donation_auth_token');
      } else {
        // No token available, show a user-friendly message
        throw new Error('Authentication expired. Please log in again.');
      }
    }

    // In our new flow, this only gets donation details - the payment was already
    // verified by the backend during the redirect
    const response = await donationStore.verifyDonation(donationId);
    
    if (response.success) {
      // Clear stored donation ID
      localStorage.removeItem('currentDonationId');
      
      // Show success message
      swal.fire({
        icon: 'success',
        title: 'Donation Successful',
        text: 'Thank you for your generous donation!',
      });
      
      // Emit success event
      emit('donation-successful', {
        amount: response.data.donation.amount, 
        is_anonymous: response.data.donation.is_anonymous, 
        created_at: response.data.donation.created_at,
        user_tag: authStore.user ? authStore.user._tag : 'Anonymous'
      });
      
      // Close modal
      emit('close');
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (err) {
    let errorMessage = 'We could not verify your donation. If your payment was successful, it will be reflected shortly.';
    
    // More specific error message for authentication issues
    if (err.message === 'Authentication expired. Please log in again.') {
      errorMessage = 'Your session has expired. Please log in again to view your donation status.';
    }
    
    swal.fire({
      icon: 'error',
      title: 'Verification Failed',
      text: errorMessage,
    });
    
    emit('close');
  } finally {
    verifyingPayment.value = false;
  }
};
</script>