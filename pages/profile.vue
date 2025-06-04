<template>
  <div class="space-y-6">
    <!-- Profile Header -->
    <div class="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white rounded-xl shadow-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-xl font-bold">
            {{ user?.first_name?.charAt(0) || '?' }}
          </div>
          <div>
            <h1 class="text-xl font-bold">{{ user?.name || 'User' }}</h1>
            <p class="text-white/80 text-sm">{{ user?._tag }}</p>
            <div class="flex items-center space-x-2 mt-1">
              <span class="text-xs bg-white/20 px-2 py-1 rounded-full capitalize">
                {{ user?.role?.replace('_', ' ') }}
              </span>
              <!-- Verification Badge -->
              <span v-if="needsVerification" :class="verificationBadgeClass">
                <component :is="verificationIcon" class="w-3 h-3 mr-1" />
                {{ verificationStatusText }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex space-x-2">
          <button @click="navigateTo('/edit-profile')" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center text-sm">
            <Edit class="w-4 h-4 mr-2" />
            Edit
          </button>
          <!-- Verification Button -->
          <button v-if="needsVerification" @click="navigateTo('/verification')" :class="verificationButtonClass">
            <component :is="verificationIcon" class="w-4 h-4 mr-2" />
            {{ verificationButtonText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Verification Alert (if needed) -->
    <div v-if="showVerificationAlert" :class="verificationAlertClass" class="rounded-xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <component :is="verificationAlertIcon" class="w-5 h-5 mr-3" />
          <div>
            <p class="font-medium">{{ verificationAlertTitle }}</p>
            <p class="text-sm opacity-90">{{ verificationAlertMessage }}</p>
          </div>
        </div>
        <button @click="navigateTo('/verification')" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
          {{ verificationAlertAction }}
        </button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
      <h3 class="text-sm font-semibold mb-3 text-gray-700">Quick Actions</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          v-for="action in quickActions" 
          :key="action.label"
          @click="navigateTo(action.path)"
          :disabled="action.requiresVerification && !isVerified"
          :class="[
            'flex flex-col items-center p-4 border border-gray-200/50 rounded-lg transition-colors text-xs',
            action.requiresVerification && !isVerified 
              ? 'bg-gray-100/50 text-gray-400 cursor-not-allowed' 
              : 'bg-white/50 hover:bg-white/70 text-gray-700'
          ]"
        >
          <component :is="action.icon" class="w-5 h-5 mb-2" :class="action.requiresVerification && !isVerified ? 'text-gray-400' : 'text-gray-600'" />
          <span class="text-center">{{ action.label }}</span>
          <Lock v-if="action.requiresVerification && !isVerified" class="w-3 h-3 mt-1 text-gray-400" />
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
      <div class="p-6 border-b border-gray-200/50">
        <nav class="flex space-x-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors',
              activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4 mr-2" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-6 min-h-[300px]">
        <!-- Verification Tab (only for roles that need verification) -->
        <div v-if="activeTab === 'verification' && needsVerification">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">Verification Status</h3>
              <span :class="verificationBadgeClass">
                <component :is="verificationIcon" class="w-4 h-4 mr-2" />
                {{ verificationStatusText }}
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-600 h-2 rounded-full transition-all duration-300" 
                :style="{ width: `${verificationProgress}%` }"
              ></div>
            </div>
            <p class="text-sm text-gray-600">{{ verificationProgress }}% Complete</p>

            <!-- Required Documents -->
            <div class="bg-gray-50/50 rounded-lg p-4">
              <h4 class="font-medium mb-3">Required Documents</h4>
              <div class="space-y-2">
                <div 
                  v-for="(docName, docType) in requiredDocuments" 
                  :key="docType"
                  class="flex items-center justify-between p-2 bg-white/50 rounded border border-gray-200/50"
                >
                  <span class="text-sm">{{ docName }}</span>
                  <div class="flex items-center">
                    <CheckCircle v-if="hasDocument(docType)" class="w-4 h-4 text-green-600" />
                    <XCircle v-else class="w-4 h-4 text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Rejection Reason (if applicable) -->
            <div v-if="isVerificationRejected" class="bg-red-50/50 border border-red-200/50 rounded-lg p-4">
              <div class="flex items-start">
                <AlertCircle class="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                <div>
                  <h4 class="font-medium text-red-800">Verification Rejected</h4>
                  <p class="text-sm text-red-700 mt-1">{{ verificationRejectionReason }}</p>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <button 
              @click="navigateTo('/verification')" 
              class="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              {{ verificationActionText }}
            </button>
          </div>
        </div>

        <!-- Donations -->
        <div v-if="activeTab === 'donations'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Donations</h3>
            <span class="text-sm text-gray-500">{{ donations.length }} total</span>
          </div>
          
          <div v-if="donations.length > 0" class="space-y-3 max-h-80 overflow-y-auto">
            <div v-for="donation in displayedDonations" :key="donation.id" class="bg-gray-50/50 rounded-lg p-3">
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-3">
                  <Heart class="w-8 h-8 p-2 bg-green-100 text-green-600 rounded-full" />
                  <div>
                    <p class="font-medium text-sm">{{ donation.donation_request?.title || 'Donation' }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(donation.created_at) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-sm">${{ donation.amount }}</p>
                  <span :class="getStatusClass(donation.payment_status)">{{ donation.payment_status }}</span>
                </div>
              </div>
            </div>
            
            <button
              v-if="donations.length > displayedDonations.length"
              @click="showAllDonations = !showAllDonations"
              class="w-full py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {{ showAllDonations ? 'Show Less' : `Show ${donations.length - displayedDonations.length} More` }}
            </button>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <Heart class="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No donations yet</p>
          </div>
        </div>

        <!-- Details -->
        <div v-if="activeTab === 'details'" class="space-y-4">
          <h3 class="text-lg font-semibold">Profile Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div v-if="user?.name">
              <label class="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
              <p class="text-gray-900">{{ user.name }}</p>
            </div>
            
            <div v-if="user?.email">
              <label class="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <p class="text-gray-900">{{ user.email }}</p>
            </div>
            
            <div v-if="user?.phone_number">
              <label class="block text-xs font-medium text-gray-500 mb-1">Phone</label>
              <p class="text-gray-900">{{ user.phone_number }}</p>
            </div>
            
            <div v-if="user?.location">
              <label class="block text-xs font-medium text-gray-500 mb-1">Location</label>
              <p class="text-gray-900">{{ user.location }}</p>
            </div>
            
            <div v-if="user?.role">
              <label class="block text-xs font-medium text-gray-500 mb-1">Role</label>
              <p class="text-gray-900 capitalize">{{ user.role.replace('_', ' ') }}</p>
            </div>
            
            <div v-if="user?.created_at">
              <label class="block text-xs font-medium text-gray-500 mb-1">Member Since</label>
              <p class="text-gray-900">{{ formatDate(user.created_at) }}</p>
            </div>
            
            <!-- Verification Status in Details -->
            <div v-if="needsVerification">
              <label class="block text-xs font-medium text-gray-500 mb-1">Verification Status</label>
              <div class="flex items-center">
                <component :is="verificationIcon" class="w-4 h-4 mr-2" :class="verificationIconColor" />
                <span :class="verificationTextColor">{{ verificationStatusText }}</span>
              </div>
            </div>
            
            <template v-if="user?.role === 'health_expert'">
              <div v-if="user?.specialization">
                <label class="block text-xs font-medium text-gray-500 mb-1">Specialization</label>
                <p class="text-gray-900">{{ user.specialization }}</p>
              </div>
              
              <div v-if="user?.experience_years">
                <label class="block text-xs font-medium text-gray-500 mb-1">Experience</label>
                <p class="text-gray-900">{{ user.experience_years }} years</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 flex justify-between items-center">
      <span class="text-xs text-gray-500">VitalAid Profile</span>
      <button @click="handleLogout" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center text-sm">
        <LogOut class="w-4 h-4 mr-2" />
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  User, Edit, MessageCircle, Heart, Calendar, Users, Clock, Plus, DollarSign, 
  CreditCard, Bell, LogOut, Trash2, CheckCircle, XCircle, AlertCircle, 
  Shield, ShieldCheck, ShieldX, Lock
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/authStore'
import { useDonationStore } from '~/stores/donationStore'
import { useConsultationStore } from '~/stores/consultationStore'
import { useEventStore } from '~/stores/eventStore'
import { useRouter } from 'vue-router'

// Stores and router
const authStore = useAuthStore()
const donationStore = useDonationStore()
const consultationStore = useConsultationStore()
const eventStore = useEventStore()
const router = useRouter()

// Reactive data
const user = ref(authStore.user)
const activeTab = ref('donations')
const donations = ref([])
const consultations = ref([])
const events = ref([])

// View states
const showAllDonations = ref(false)

// Computed properties for verification
const isVerified = computed(() => authStore.isVerified)
const needsVerification = computed(() => authStore.needsVerification)
const verificationProgress = computed(() => authStore.verificationProgress)
const verificationStatus = computed(() => user.value?.verification_status)
const isVerificationRejected = computed(() => authStore.isVerificationRejected)
const verificationRejectionReason = computed(() => authStore.verificationRejectionReason)
const requiredDocuments = computed(() => authStore.requiredDocuments)

// Verification UI computed properties
const verificationStatusText = computed(() => {
  if (isVerified.value) return 'Verified'
  if (isVerificationRejected.value) return 'Rejected'
  if (verificationStatus.value === 'pending') return 'Under Review'
  return 'Not Verified'
})

const verificationIcon = computed(() => {
  if (isVerified.value) return ShieldCheck
  if (isVerificationRejected.value) return ShieldX
  if (verificationStatus.value === 'pending') return Shield
  return Shield
})

const verificationIconColor = computed(() => {
  if (isVerified.value) return 'text-green-600'
  if (isVerificationRejected.value) return 'text-red-600'
  if (verificationStatus.value === 'pending') return 'text-yellow-600'
  return 'text-gray-600'
})

const verificationTextColor = computed(() => {
  if (isVerified.value) return 'text-green-700'
  if (isVerificationRejected.value) return 'text-red-700'
  if (verificationStatus.value === 'pending') return 'text-yellow-700'
  return 'text-gray-700'
})

const verificationBadgeClass = computed(() => {
  const baseClass = 'text-xs px-2 py-1 rounded-full flex items-center font-medium '
  if (isVerified.value) return baseClass + 'bg-green-100 text-green-800'
  if (isVerificationRejected.value) return baseClass + 'bg-red-100 text-red-800'
  if (verificationStatus.value === 'pending') return baseClass + 'bg-yellow-100 text-yellow-800'
  return baseClass + 'bg-gray-100 text-gray-800'
})

const verificationButtonClass = computed(() => {
  const baseClass = 'px-4 py-2 rounded-lg transition-colors flex items-center text-sm font-medium '
  if (isVerified.value) return baseClass + 'bg-green-600/20 hover:bg-green-600/30 text-green-100'
  if (isVerificationRejected.value) return baseClass + 'bg-red-600/20 hover:bg-red-600/30 text-red-100'
  return baseClass + 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-100'
})

const verificationButtonText = computed(() => {
  if (isVerified.value) return 'View Verification'
  if (isVerificationRejected.value) return 'Resubmit'
  if (verificationStatus.value === 'pending') return 'View Status'
  return 'Get Verified'
})

const verificationActionText = computed(() => {
  if (isVerified.value) return 'View Verification Details'
  if (isVerificationRejected.value) return 'Resubmit Documents'
  if (verificationStatus.value === 'pending') return 'View Verification Status'
  return 'Start Verification Process'
})

const showVerificationAlert = computed(() => {
  return needsVerification.value && (!isVerified.value || isVerificationRejected.value)
})

const verificationAlertClass = computed(() => {
  const baseClass = 'p-4 '
  if (isVerificationRejected.value) return baseClass + 'bg-red-50/50 border border-red-200/50 text-red-800'
  if (verificationStatus.value === 'pending') return baseClass + 'bg-yellow-50/50 border border-yellow-200/50 text-yellow-800'
  return baseClass + 'bg-blue-50/50 border border-blue-200/50 text-blue-800'
})

const verificationAlertIcon = computed(() => {
  if (isVerificationRejected.value) return ShieldX
  if (verificationStatus.value === 'pending') return Shield
  return Shield
})

const verificationAlertTitle = computed(() => {
  if (isVerificationRejected.value) return 'Verification Rejected'
  if (verificationStatus.value === 'pending') return 'Verification Under Review'
  return 'Verification Required'
})

const verificationAlertMessage = computed(() => {
  if (isVerificationRejected.value) return 'Your verification was rejected. Please review and resubmit your documents.'
  if (verificationStatus.value === 'pending') return 'Your documents are being reviewed. This usually takes 1-3 business days.'
  return 'Complete your verification to access all features and build trust with the community.'
})

const verificationAlertAction = computed(() => {
  if (isVerificationRejected.value) return 'Resubmit'
  if (verificationStatus.value === 'pending') return 'View Status'
  return 'Start Now'
})

// Tabs with conditional verification tab
const tabs = computed(() => {
  const baseTabs = [
    { id: 'donations', label: 'Donations', icon: Heart },
    { id: 'details', label: 'Details', icon: User }
  ]
  
  if (needsVerification.value) {
    baseTabs.unshift({ id: 'verification', label: 'Verification', icon: Shield })
  }
  
  return baseTabs
})

// Quick actions with verification requirements
const quickActions = computed(() => {
  const actions = {
    user: [
      { icon: MessageCircle, label: 'Book Consultation', path: '/consultations', requiresVerification: false },
      { icon: Heart, label: 'Make Donation', path: '/donate', requiresVerification: false },
      { icon: Calendar, label: 'Join Events', path: '/events', requiresVerification: false },
      { icon: Users, label: 'Find Communities', path: '/community', requiresVerification: false }
    ],
    health_expert: [
      { icon: Clock, label: 'Pending Requests', path: '/consultations', requiresVerification: true },
      { icon: MessageCircle, label: 'Active Chats', path: '/consultations', requiresVerification: true },
      { icon: Heart, label: 'Make Donation', path: '/donate', requiresVerification: false },
      { icon: Calendar, label: 'Join Events', path: '/events', requiresVerification: false }
    ],
    charity: [
      { icon: Plus, label: 'Create Request', path: '/donate/create', requiresVerification: true },
      { icon: DollarSign, label: 'Manage Donations', path: '/donate/my_request', requiresVerification: true },
      { icon: CreditCard, label: 'Withdrawals', path: '/withdrawals', requiresVerification: true }
    ],
    community: [
      { icon: Plus, label: 'Create Event', path: '/events/create', requiresVerification: true },
      { icon: Users, label: 'Manage Members', path: '/community/members', requiresVerification: true },
      { icon: Bell, label: 'Notify Members', path: `/community/${user.value?.id}`, requiresVerification: true }
    ]
  }
  return actions[user.value?.role] || actions.user
})

const displayedDonations = computed(() => showAllDonations.value ? donations.value : donations.value.slice(0, 3))

// Helper methods
const hasDocument = (documentType) => authStore.hasDocument(documentType)

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getStatusClass = (status) => {
  const classes = {
    success: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    ongoing: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return `px-2 py-1 rounded-full text-xs font-medium ${classes[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`
}

const navigateTo = (path) => router.push(path)

const handleLogout = async () => {
  if (confirm('Are you sure you want to logout?')) {
    await authStore.logout()
    navigateTo('/login')
  }
}

const fetchData = async () => {
  try {
    const donationsData = await donationStore.fetchUserDonations()
    donations.value = donationsData?.data?.donations || []
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Set default tab based on verification needs
onMounted(() => {
  fetchData()
})

// Set default tab based on verification needs
onMounted(() => {
  if (needsVerification.value && !isVerified.value) {
    activeTab.value = 'verification'
  }
  fetchData()
})
</script>