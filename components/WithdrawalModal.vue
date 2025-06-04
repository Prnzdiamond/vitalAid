<template>
    <div class="fixed inset-0 flex items-center justify-center z-50 p-4">
      <!-- Enhanced Backdrop -->
      <div 
        class="absolute inset-0 bg-black/30 backdrop-blur-sm" 
        @click="$emit('close')"
      />
      <div class="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl relative border border-gray-200">
        <!-- Modal Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Request Withdrawal</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
  
        <!-- Loading banks -->
        <div v-if="loadingBanks" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
  
        <!-- Withdrawal Form -->
        <form v-else @submit.prevent="submitWithdrawal" class="space-y-4">
          <!-- Campaign Info -->
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="text-sm font-medium text-gray-700">{{ campaign.title }}</p>
            <p class="text-lg font-bold text-green-600">Available: ₦{{ formatNumber(availableBalance) }}</p>
          </div>
  
          <!-- Amount Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
              <input
                v-model.number="withdrawalForm.amount"
                type="number"
                step="0.01"
                min="1"
                :max="availableBalance"
                class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter amount to withdraw"
                required
              />
            </div>
            <p class="text-sm text-gray-500 mt-1">
              Maximum available: ₦{{ formatNumber(availableBalance) }}
            </p>
          </div>
  
          <!-- Bank Details -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Bank</label>
              <select
                v-model="withdrawalForm.bank_code"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select Bank</option>
                <option
                  v-for="bank in banks"
                  :key="bank.code"
                  :value="bank.code"
                >
                  {{ bank.name }}
                </option>
              </select>
            </div>
  
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                v-model="withdrawalForm.account_number"
                type="text"
                pattern="[0-9]{10}"
                maxlength="10"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter 10-digit account number"
                required
              />
            </div>
  
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
              <input
                v-model="withdrawalForm.account_name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter account holder name"
                required
              />
            </div>
  
            <!-- PIN Input -->
            <!-- <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Transaction PIN</label>
              <input
                v-model="withdrawalForm.pin"
                type="password"
                maxlength="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter 4-digit PIN"
                required
              />
              <p class="text-xs text-gray-500 mt-1">
                Enter your transaction PIN to authorize this withdrawal
              </p>
            </div> -->
          </div>
  
          <!-- Error Message -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {{ errorMessage }}
          </div>
  
          <!-- Form Actions -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center justify-center"
            >
              <div v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              {{ isSubmitting ? 'Processing...' : 'Request Withdrawal' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useDonationStore } from '@/stores/donationStore';
  import { useSwal } from '@/composables/useSwal';
  
  // Props
  const props = defineProps({
    campaign: {
      type: Object,
      required: true
    },
    availableBalance: {
      type: Number,
      required: true
    }
  });
  
  // Emits
  const emit = defineEmits(['close', 'withdrawal-successful']);
  
  // Store and composables
  const donationStore = useDonationStore();
  const { toast } = useSwal();
  
  // Reactive data
  const banks = ref([]);
  const loadingBanks = ref(true);
  const isSubmitting = ref(false);
  const errorMessage = ref('');
  
  const withdrawalForm = ref({
    amount: '',
    bank_code: '',
    account_number: '',
    account_name: '',
    // pin: '',
    campaign_id: props.campaign.id
  });
  
  // Computed properties
  const isFormValid = computed(() => {
    return withdrawalForm.value.amount &&
           withdrawalForm.value.bank_code &&
           withdrawalForm.value.account_number &&
           withdrawalForm.value.account_name &&
        //    withdrawalForm.value.pin &&
           withdrawalForm.value.amount <= props.availableBalance &&
           withdrawalForm.value.amount > 0;
  });
  
  // Methods
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  const loadBanks = async () => {
    try {
      loadingBanks.value = true;
      const response = await donationStore.getBanks();
      if (response.success) {
        banks.value = response.data.banks || [];
      } else {
        throw new Error(response.message || 'Failed to load banks');
      }
    } catch (error) {
      console.error('Error loading banks:', error);
      errorMessage.value = 'Failed to load banks. Please try again.';
      toast.fire('Failed to load banks', { type: 'error' });
    } finally {
      loadingBanks.value = false;
    }
  };
  
  const submitWithdrawal = async () => {
    if (!isFormValid.value) {
      errorMessage.value = 'Please fill in all required fields correctly.';
      return;
    }
  
    try {
      isSubmitting.value = true;
      errorMessage.value = '';
  
      const payload = {
        donation_request_id: withdrawalForm.value.campaign_id,
        amount: withdrawalForm.value.amount,
        bank_details: {
          account_number: withdrawalForm.value.account_number,
          bank_code: withdrawalForm.value.bank_code,
          account_name: withdrawalForm.value.account_name
        }
      };
  
      const response = await donationStore.requestWithdrawal(payload);
  
      if (response.success) {
        toast.fire('Withdrawal request submitted successfully!', { type: 'success' });
        emit('withdrawal-successful', payload.amount);
        emit('close');
      } else {
        throw new Error(response.message || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      errorMessage.value = error.message || 'Failed to submit withdrawal request. Please try again.';
      toast.fire('Failed to submit withdrawal request', { type: 'error' });
    } finally {
      isSubmitting.value = false;
    }
  };
  
  // Lifecycle
  onMounted(() => {
    loadBanks();
  });
  </script>
  
  <style scoped>
  /* Custom styles for better UX */
  input:focus,
  select:focus {
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  </style>