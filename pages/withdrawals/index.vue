<template>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Withdrawal Management</h1>
        <p class="text-gray-600 mt-2">Request withdrawals from your donation campaigns</p>
      </div>
  
      <!-- Tab Navigation -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'request'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'request'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Request Withdrawal
          </button>
          <button
            @click="activeTab = 'history'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'history'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Withdrawal History
          </button>
        </nav>
      </div>
  
      <!-- Request Withdrawal Tab -->
      <div v-if="activeTab === 'request'" class="space-y-6">
        <!-- Available Campaigns -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Available Campaigns</h2>
          
          <div v-if="loadingCampaigns" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
          
          <div v-else-if="availableCampaigns.length === 0" class="text-center py-8 text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No campaigns with available funds for withdrawal</p>
          </div>
          
          <div v-else class="grid gap-4">
            <div
              v-for="campaign in availableCampaigns"
              :key="campaign.id"
              :class="[
                'border rounded-lg p-4 cursor-pointer transition-all',
                selectedCampaign?.id === campaign.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
              @click="selectCampaign(campaign)"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800">{{ campaign.title }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ campaign.description.substring(0, 100) }}...</p>
                  <div class="flex items-center mt-2 space-x-4">
                    <span class="text-sm text-gray-500">
                      Total Received: ₦{{ formatNumber(campaign.amount_received) }}
                    </span>
                    <span class="text-sm text-gray-500">
                      Previously Withdrawn: ₦{{ formatNumber(campaign.withdrawn_amount || 0) }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">Available Balance</p>
                  <p class="text-lg font-bold text-green-600">
                    ₦{{ formatNumber(campaign.amount_received - (campaign.withdrawn_amount || 0)) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Withdrawal Form -->
        <div v-if="selectedCampaign" class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Withdrawal Request</h2>
          
          <form @submit.prevent="submitWithdrawal" class="space-y-6">
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
                  :max="selectedCampaign.amount_received - (selectedCampaign.withdrawn_amount || 0)"
                  class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter amount to withdraw"
                  required
                />
              </div>
              <p class="text-sm text-gray-500 mt-1">
                Maximum available: ₦{{ formatNumber(selectedCampaign.amount_received - (selectedCampaign.withdrawn_amount || 0)) }}
              </p>
            </div>
  
            <!-- Bank Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bank</label>
                <select
                  v-model="withdrawalForm.bank_code"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  @change="updateBankName"
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
  
            <!-- Submit Button -->
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="submittingWithdrawal"
                class="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center"
              >
                <svg v-if="submittingWithdrawal" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ submittingWithdrawal ? 'Processing...' : 'Request Withdrawal' }}
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Withdrawal History Tab -->
      <div v-if="activeTab === 'history'" class="bg-white rounded-xl shadow-md">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-800">Withdrawal History</h2>
        </div>
        
        <div v-if="loadingHistory" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
        
        <div v-else-if="withdrawalHistory.length === 0" class="text-center py-12 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No withdrawal requests found</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank Details
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="withdrawal in withdrawalHistory" :key="withdrawal.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ withdrawal.donation_request?.title || 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    ₦{{ formatNumber(withdrawal.amount) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ withdrawal.bank_details?.account_name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ withdrawal.bank_details?.account_number }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(withdrawal.status)">
                    {{ withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(withdrawal.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    v-if="withdrawal.status === 'pending'"
                    @click="checkWithdrawalStatus(withdrawal.id)"
                    :disabled="checkingStatus[withdrawal.id]"
                    class="text-green-600 hover:text-green-900 disabled:text-gray-400 flex items-center"
                  >
                    <svg v-if="checkingStatus[withdrawal.id]" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Check Status
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useDonationStore } from '@/stores/donationStore';
  import { useAuthStore } from '@/stores/authStore';
  import { useSwal } from '@/composables/useSwal';
  
  const donationStore = useDonationStore();
  const authStore = useAuthStore();
  const { swal, toast } = useSwal();
  
  // Reactive data
  const activeTab = ref('request');
  const availableCampaigns = ref([]);
  const selectedCampaign = ref(null);
  const banks = ref([]);
  const withdrawalHistory = ref([]);
  const loadingCampaigns = ref(true);
  const loadingHistory = ref(false);
  const submittingWithdrawal = ref(false);
  const checkingStatus = ref({});
  
  // Form data
  const withdrawalForm = ref({
    amount: '',
    bank_code: '',
    account_number: '',
    account_name: ''
  });
  
  // Computed
  const user = computed(() => authStore.user);
  
  // Methods
  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getStatusBadgeClass = (status) => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };
  
  const selectCampaign = (campaign) => {
    selectedCampaign.value = campaign;
    // Reset form
    withdrawalForm.value = {
      amount: '',
      bank_code: '',
      account_number: '',
      account_name: ''
    };
  };
  
  const updateBankName = () => {
    const selectedBank = banks.value.find(bank => bank.code === withdrawalForm.value.bank_code);
    if (selectedBank) {
      // You might want to store the bank name for reference
    }
  };
  
  const loadCampaigns = async () => {
    try {
      loadingCampaigns.value = true;
      const result = await donationStore.fetchOrganizationRequests();
      
      if (result.success) {
        // Filter campaigns that have received donations and have available balance
        availableCampaigns.value = result.data.requests.filter(campaign => {
          const received = campaign.amount_received || 0;
          const withdrawn = campaign.withdrawn_amount || 0;
          return received > withdrawn && received > 0;
        });
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.fire('Failed to load campaigns', { type: 'error' });
    } finally {
      loadingCampaigns.value = false;
    }
  };
  
  const loadBanks = async () => {
    try {
      const result = await donationStore.getBanks();
      if (result.success) {
        banks.value = result.data.banks;
      }
    } catch (error) {
      console.error('Error loading banks:', error);
      toast.fire('Failed to load banks', { type: 'error' });
    }
  };
  
  const loadWithdrawalHistory = async () => {
    try {
      loadingHistory.value = true;
      const result = await donationStore.fetchWithdrawals();
      
      if (result.success) {
        withdrawalHistory.value = result.data.withdrawals;
      }
    } catch (error) {
      console.error('Error loading withdrawal history:', error);
      toast.fire('Failed to load withdrawal history', { type: 'error' });
    } finally {
      loadingHistory.value = false;
    }
  };
  
  const submitWithdrawal = async () => {
    if (!selectedCampaign.value) {
      toast.fire('Please select a campaign', { type: 'warning' });
      return;
    }
  
    const availableBalance = selectedCampaign.value.amount_received - (selectedCampaign.value.withdrawn_amount || 0);
    
    if (withdrawalForm.value.amount > availableBalance) {
      toast.fire('Amount exceeds available balance', { type: 'warning' });
      return;
    }
  
    try {
      submittingWithdrawal.value = true;
      
      const payload = {
        donation_request_id: selectedCampaign.value.id,
        amount: withdrawalForm.value.amount,
        bank_details: {
          account_number: withdrawalForm.value.account_number,
          bank_code: withdrawalForm.value.bank_code,
          account_name: withdrawalForm.value.account_name
        }
      };
  
      const result = await donationStore.requestWithdrawal(payload);
      
      if (result.success) {
        await swal.fire({
          title: 'Success!',
          text: 'Withdrawal request submitted successfully. You will be notified once processed.',
          icon: 'success'
        });
        
        // Reset form and reload data
        selectedCampaign.value = null;
        withdrawalForm.value = {
          amount: '',
          bank_code: '',
          account_number: '',
          account_name: ''
        };
        
        await loadCampaigns();
        if (activeTab.value === 'history') {
          await loadWithdrawalHistory();
        }
      } else {
        throw new Error(result.message || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      await swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || error.message || 'Failed to submit withdrawal request',
        icon: 'error'
      });
    } finally {
      submittingWithdrawal.value = false;
    }
  };
  
  const checkWithdrawalStatus = async (withdrawalId) => {
    try {
      checkingStatus.value[withdrawalId] = true;
      
      const result = await donationStore.checkWithdrawalStatus(withdrawalId);
      
      if (result.success) {
        // Update the withdrawal in the history
        const index = withdrawalHistory.value.findIndex(w => w.id === withdrawalId);
        if (index !== -1) {
          withdrawalHistory.value[index] = result.data.withdrawal;
        }
        
        toast.fire('Status updated', { type: 'success' });
        
        // Reload campaigns if status changed to failed (funds returned)
        if (result.data.withdrawal.status === 'failed') {
          await loadCampaigns();
        }
      }
    } catch (error) {
      console.error('Error checking withdrawal status:', error);
      toast.fire('Failed to check status', { type: 'error' });
    } finally {
      checkingStatus.value[withdrawalId] = false;
    }
  };
  
  // Watch activeTab to load history when needed
  const watchActiveTab = () => {
    if (activeTab.value === 'history' && withdrawalHistory.value.length === 0) {
      loadWithdrawalHistory();
    }
  };
  
  // Initialize data on mount
  onMounted(async () => {
    await Promise.all([
      loadCampaigns(),
      loadBanks()
    ]);
  });
  
  // Watch for tab changes
  watch(activeTab, watchActiveTab);
  </script>
  
  <style scoped>
  /* Add any additional styles here if needed */
  </style>