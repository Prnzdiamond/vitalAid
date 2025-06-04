<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white py-8 px-4">
    <div class="max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Shield class="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Account Verification</h1>
              <p class="text-gray-600">{{ getRoleTitle() }} Verification Process</p>
            </div>
          </div>
          <button @click="$router.go(-1)" class="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Verification Progress</h2>
          <span :class="statusBadgeClass">
            <component :is="statusIcon" class="w-4 h-4 mr-2" />
            {{ statusText }}
          </span>
        </div>
        
        <div class="bg-gray-200 rounded-full h-3 mb-2">
          <div 
            class="bg-green-600 h-3 rounded-full transition-all duration-500" 
            :style="{ width: `${verificationProgress}%` }"
          ></div>
        </div>
        <p class="text-sm text-gray-600">{{ verificationProgress }}% Complete ({{ completedDocuments }}/{{ totalDocuments }} documents)</p>
      </div>

      <!-- Status Messages -->
      <div v-if="isVerificationRejected" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div class="flex items-start">
          <ShieldX class="w-6 h-6 text-red-600 mr-3 mt-1" />
          <div>
            <h3 class="font-semibold text-red-800 mb-2">Verification Rejected</h3>
            <p class="text-red-700 mb-4">{{ verificationRejectionReason }}</p>
            <p class="text-sm text-red-600">Please review the requirements below and resubmit your documents.</p>
          </div>
        </div>
      </div>

      <div v-else-if="verificationStatus === 'pending'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div class="flex items-start">
          <Clock class="w-6 h-6 text-yellow-600 mr-3 mt-1" />
          <div>
            <h3 class="font-semibold text-yellow-800 mb-2">Verification Under Review</h3>
            <p class="text-yellow-700 mb-2">Your documents have been submitted and are being reviewed by our team.</p>
            <p class="text-sm text-yellow-600">This process usually takes 1-3 business days. You'll receive an email notification once the review is complete.</p>
          </div>
        </div>
      </div>

      <div v-else-if="isVerified" class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <div class="flex items-start">
          <ShieldCheck class="w-6 h-6 text-green-600 mr-3 mt-1" />
          <div>
            <h3 class="font-semibold text-green-800 mb-2">Account Verified</h3>
            <p class="text-green-700 mb-2">Congratulations! Your account has been successfully verified.</p>
            <p class="text-sm text-green-600">You now have access to all platform features and enhanced credibility with the community.</p>
          </div>
        </div>
      </div>

      <!-- Document Upload Section -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Required Documents</h2>
        <p class="text-gray-600 mb-6">Please upload the following documents to verify your {{ user?.role?.replace('_', ' ') }} account:</p>
        
        <div class="space-y-4">
          <div 
            v-for="(docName, docType) in requiredDocuments" 
            :key="docType"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <component :is="getDocumentIcon(docType)" class="w-5 h-5 mr-3 text-gray-600" />
                <div>
                  <h3 class="font-medium">{{ docName }}</h3>
                  <p class="text-sm text-gray-500">{{ getDocumentDescription(docType) }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <CheckCircle v-if="hasDocument(docType)" class="w-5 h-5 text-green-600" />
                <XCircle v-else class="w-5 h-5 text-red-500" />
              </div>
            </div>
            
            <!-- Document Upload/Display -->
            <div v-if="hasDocument(docType)" class="bg-green-50 border border-green-200 rounded p-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-green-700 font-medium">Document uploaded</span>
                <div class="space-x-2">
                  <button 
                    @click="triggerFileUpload(docType)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Replace
                  </button>
                  <button 
                    @click="removeDocument(docType)"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            
            <div v-else class="space-y-3">
              <!-- Hidden file input -->
              <input 
                :id="`file-${docType}`"
                type="file" 
                :accept="acceptedFileTypes"
                @change="handleFileUpload($event, docType)"
                class="hidden"
              />
              
              <!-- Upload button -->
              <label 
                :for="`file-${docType}`"
                class="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer block"
              >
                <Upload class="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <span class="text-sm text-gray-600">Click to upload {{ docName.toLowerCase() }}</span>
                <p class="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DOC (max 5MB)</p>
              </label>
            </div>

            <!-- Upload Progress -->
            <div v-if="uploadingDocuments[docType]" class="mt-3">
              <div class="flex items-center justify-between text-sm text-blue-600 mb-1">
                <span>Uploading...</span>
                <span>{{ uploadProgress[docType] || 0 }}%</span>
              </div>
              <div class="bg-blue-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: `${uploadProgress[docType] || 0}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Optional Documents -->
      <div v-if="Object.keys(optionalDocuments).length > 0" class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Optional Documents</h2>
        <p class="text-gray-600 mb-6">These documents can help strengthen your verification (recommended but not required):</p>
        
        <div class="space-y-4">
          <div 
            v-for="(docName, docType) in optionalDocuments" 
            :key="docType"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <component :is="getDocumentIcon(docType)" class="w-5 h-5 mr-3 text-gray-600" />
                <div>
                  <h3 class="font-medium">{{ docName }}</h3>
                  <p class="text-sm text-gray-500">{{ getDocumentDescription(docType) }}</p>
                </div>
              </div>
              <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Optional</span>
            </div>
            
            <!-- Similar upload interface for optional documents -->
            <div v-if="hasDocument(docType)" class="bg-blue-50 border border-blue-200 rounded p-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-blue-700 font-medium">Document uploaded</span>
                <div class="space-x-2">
                  <button 
                    @click="triggerFileUpload(docType)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Replace
                  </button>
                  <button 
                    @click="removeDocument(docType)"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            
            <div v-else>
              <!-- Hidden file input -->
              <input 
                :id="`file-${docType}`"
                type="file" 
                :accept="acceptedFileTypes"
                @change="handleFileUpload($event, docType)"
                class="hidden"
              />
              
              <!-- Upload button -->
              <label 
                :for="`file-${docType}`"
                class="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer block"
              >
                <Upload class="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <span class="text-sm text-gray-600">Click to upload {{ docName.toLowerCase() }}</span>
                <p class="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DOC (max 5MB)</p>
              </label>

              <!-- Upload Progress -->
              <div v-if="uploadingDocuments[docType]" class="mt-3">
                <div class="flex items-center justify-between text-sm text-blue-600 mb-1">
                  <span>Uploading...</span>
                  <span>{{ uploadProgress[docType] || 0 }}%</span>
                </div>
                <div class="bg-blue-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    :style="{ width: `${uploadProgress[docType] || 0}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex flex-col sm:flex-row gap-4 justify-end">
          <button 
            @click="$router.push('/profile')"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back to Profile
          </button>
          
          <button 
            v-if="!isVerified && hasAnyDocuments && !isAnyUploading"
            @click="submitAllDocuments"
            :disabled="isSubmitting"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Loader2 v-if="isSubmitting" class="w-5 h-5 mr-2 animate-spin" />
            {{ isSubmitting ? 'Submitting...' : 'Submit All for Review' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { 
  Shield, ShieldCheck, ShieldX, ArrowLeft, CheckCircle, XCircle, 
  Upload, FileText, CreditCard, GraduationCap, Building, Users, 
  Clock, Loader2, AlertCircle
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Reactive data
const user = ref(authStore.user)
const isSubmitting = ref(false)
const uploadedDocuments = ref({}) // Store File objects, not base64
const uploadingDocuments = reactive({})
const uploadProgress = reactive({})
const acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.doc,.docx'

// Computed properties
const isVerified = computed(() => authStore.isVerified)
const verificationStatus = computed(() => user.value?.verification_status)
const verificationProgress = computed(() => authStore.verificationProgress)
const isVerificationRejected = computed(() => authStore.isVerificationRejected)
const verificationRejectionReason = computed(() => authStore.verificationRejectionReason)
const requiredDocuments = computed(() => authStore.requiredDocuments)
const optionalDocuments = computed(() => authStore.optionalDocuments)

const totalDocuments = computed(() => Object.keys(requiredDocuments.value).length)
const completedDocuments = computed(() => {
  return Object.keys(requiredDocuments.value).filter(docType => hasDocument(docType)).length
})

const hasAnyDocuments = computed(() => {
  return Object.keys(uploadedDocuments.value).length > 0 || 
         Object.keys(authStore.verificationDocuments).length > 0
})

const isAnyUploading = computed(() => {
  return Object.values(uploadingDocuments).some(uploading => uploading)
})

const statusText = computed(() => {
  if (isVerified.value) return 'Verified'
  if (isVerificationRejected.value) return 'Rejected'
  if (verificationStatus.value === 'pending') return 'Under Review'
  return 'In Progress'
})

const statusIcon = computed(() => {
  if (isVerified.value) return ShieldCheck
  if (isVerificationRejected.value) return ShieldX
  if (verificationStatus.value === 'pending') return Clock
  return Shield
})

const statusBadgeClass = computed(() => {
  const baseClass = 'px-3 py-1 rounded-full text-sm font-medium flex items-center '
  if (isVerified.value) return baseClass + 'bg-green-100 text-green-800'
  if (isVerificationRejected.value) return baseClass + 'bg-red-100 text-red-800'
  if (verificationStatus.value === 'pending') return baseClass + 'bg-yellow-100 text-yellow-800'
  return baseClass + 'bg-blue-100 text-blue-800'
})

// Methods
const getRoleTitle = () => {
  const titles = {
    health_expert: 'Health Expert',
    charity: 'Charity Organization',
    community: 'Community Organization'
  }
  return titles[user.value?.role] || 'User'
}

const hasDocument = (documentType) => {
  return !!(uploadedDocuments.value[documentType] || authStore.hasDocument(documentType))
}

const getDocumentIcon = (docType) => {
  const iconMap = {
    government_id: CreditCard,
    representative_id: CreditCard,
    professional_license: FileText,
    education_proof: GraduationCap,
    registration_certificate: Building,
    leadership_letter: Users,
    health_council_id: CreditCard,
    online_profile: FileText,
    website_proof: FileText,
    partnership_letters: FileText,
    lga_endorsement: Building,
    community_certificates: Building,
    default: FileText
  }
  return iconMap[docType] || iconMap.default
}

const getDocumentDescription = (docType) => {
  const descriptions = {
    government_id: 'Valid government-issued photo ID (passport, driver\'s license, national ID)',
    representative_id: 'Government-issued ID of organization representative',
    professional_license: 'Current professional license or certification',
    education_proof: 'Degree, diploma, or educational certificate',
    employment_letter: 'Letter from current employer or practice',
    registration_number: 'Professional registration number document',
    registration_certificate: 'Official organization registration certificate',
    tax_identification: 'Tax ID number or certificate',
    mission_statement: 'Official mission statement or constitution document',
    address_proof: 'Utility bill or official address verification',
    trustees_list: 'List of trustees, board members, or executives',
    leadership_letter: 'Letter from community leaders or endorsement',
    group_constitution: 'Group constitution or meeting minutes',
    group_evidence: 'Photos of group activities or events',
    location_proof: 'Proof of community location or meeting place',
    health_council_id: 'Health Council ID Card',
    online_profile: 'LinkedIn or online portfolio link',
    website_proof: 'Official website or social media verification',
    partnership_letters: 'Partnership letters with verified organizations',
    lga_endorsement: 'Local Government Area or NGO endorsements',
    community_certificates: 'Community registry or recognition certificates'
  }
  return descriptions[docType] || 'Required verification document'
}

const triggerFileUpload = (docType) => {
  const fileInput = document.getElementById(`file-${docType}`)
  if (fileInput) {
    fileInput.click()
  }
}

const handleFileUpload = async (event, docType) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB')
    event.target.value = '' // Reset input
    return
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowedTypes.includes(file.type)) {
    alert('Please upload a valid file type (PDF, JPG, PNG, DOC, DOCX)')
    event.target.value = '' // Reset input
    return
  }

  try {
    // Set uploading state
    uploadingDocuments[docType] = true
    uploadProgress[docType] = 0

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (uploadProgress[docType] < 90) {
        uploadProgress[docType] += 10
      }
    }, 100)

    // Store the actual File object (not base64)
    uploadedDocuments.value[docType] = file
    
    // Complete progress
    uploadProgress[docType] = 100
    clearInterval(progressInterval)
    
    // Auto-submit single document with File object
    await submitSingleDocument(docType, file)
    
  } catch (error) {
    console.error('Error uploading file:', error)
    alert('Error uploading file. Please try again.')
  } finally {
    // Reset uploading state
    uploadingDocuments[docType] = false
    uploadProgress[docType] = 0
    event.target.value = '' // Reset input
  }
}

const submitSingleDocument = async (docType, file) => {
  try {
    // Pass the File object directly to authStore
    const result = await authStore.updateVerificationDocument(docType, file)
    if (result.success) {
      // Update user data
      user.value = result.user
      // Remove from pending uploads since it's now saved
      delete uploadedDocuments.value[docType]
      alert('Document uploaded successfully!')
    } else {
      alert(result.message || 'Failed to upload document')
      // Remove from uploaded documents if failed
      delete uploadedDocuments.value[docType]
    }
  } catch (error) {
    console.error('Error submitting document:', error)
    alert('Error submitting document. Please try again.')
    // Remove from uploaded documents if failed
    delete uploadedDocuments.value[docType]
  }
}

const removeDocument = async (docType) => {
  if (confirm('Are you sure you want to remove this document?')) {
    try {
      const result = await authStore.removeVerificationDocument(docType)
      if (result.success) {
        delete uploadedDocuments.value[docType]
        user.value = result.user
        alert('Document removed successfully!')
      } else {
        alert(result.message || 'Failed to remove document')
      }
    } catch (error) {
      console.error('Error removing document:', error)
      alert('Error removing document. Please try again.')
    }
  }
}

const submitAllDocuments = async () => {
  if (Object.keys(uploadedDocuments.value).length === 0) {
    alert('All documents have been uploaded individually. Your verification is ready for review!')
    return
  }

  isSubmitting.value = true
  try {
    // Pass File objects directly to authStore
    const result = await authStore.submitVerification(uploadedDocuments.value)
    if (result.success) {
      user.value = result.user
      uploadedDocuments.value = {}
      alert('Verification submitted successfully! You will receive an email notification once the review is complete.')
    } else {
      alert(result.message || 'Failed to submit verification')
    }
  } catch (error) {
    console.error('Error submitting verification:', error)
    alert('Error submitting verification. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Redirect if user doesn't need verification
// const needsVerification = computed(() => authStore.needsVerification)

onMounted(async () => {
  // Fetch verification status on mount
  await authStore.fetchVerificationStatus()

  // if (!needsVerification.value) {
  //   router.push('/profile')
  //   return
  // }
})
</script>