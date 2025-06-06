<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <User class="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Edit Profile</h1>
            <p class="text-gray-600">Update your account information</p>
          </div>
        </div>
        <button 
          @click="$router.go(-1)"
          class="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back
        </button>
      </div>
    </div>

    <form @submit.prevent="updateProfile" class="space-y-6">
      <!-- Basic Information -->
      <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <User class="w-5 h-5 mr-2 text-green-600" />
          Basic Information
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-700 font-medium mb-2">First Name</label>
            <input 
              v-model="form.first_name" 
              type="text" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white/70"
              placeholder="Enter your first name"
            />
            <p v-if="errors.first_name" class="text-red-600 text-sm mt-1">{{ errors.first_name[0] }}</p>
          </div>
          
          <div>
            <label class="block text-gray-700 font-medium mb-2">Last Name</label>
            <input 
              v-model="form.last_name" 
              type="text" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white/70"
              placeholder="Enter your last name"
            />
            <p v-if="errors.last_name" class="text-red-600 text-sm mt-1">{{ errors.last_name[0] }}</p>
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Phone Number</label>
            <input 
              v-model="form.phone_number" 
              type="tel" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white/70"
              placeholder="+1234567890"
            />
            <p v-if="errors.phone_number" class="text-red-600 text-sm mt-1">{{ errors.phone_number[0] }}</p>
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Email</label>
            <input 
              :value="user?.email" 
              type="email" 
              class="w-full p-3 border border-gray-300 rounded-lg bg-gray-100/70 cursor-not-allowed" 
              disabled
            />
            <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </div>

      <!-- Role-specific Information -->
      <div v-if="user?.role && user.role !== 'user'" class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Settings class="w-5 h-5 mr-2 text-green-600" />
          {{ getRoleTitle() }} Information
        </h2>

        <!-- Common Organization Fields -->
        <div v-if="isOrganizationRole" class="space-y-6">
          <div>
            <label class="block text-gray-700 font-medium mb-2">Description</label>
            <textarea 
              v-model="form.description" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors h-32 bg-white/70"
              placeholder="Tell us about your organization..."
              maxlength="1000"
            ></textarea>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span v-if="errors.description" class="text-red-600">{{ errors.description[0] }}</span>
              <span class="ml-auto">{{ (form.description || '').length }}/1000</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Location</label>
              <input 
                v-model="form.location" 
                type="text" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white/70"
                placeholder="City, Country"
              />
              <p v-if="errors.location" class="text-red-600 text-sm mt-1">{{ errors.location[0] }}</p>
            </div>
            
            <div>
              <label class="block text-gray-700 font-medium mb-2">Website</label>
              <input 
                v-model="form.website" 
                type="url" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white/70"
                placeholder="https://yourwebsite.com"
              />
              <p v-if="errors.website" class="text-red-600 text-sm mt-1">{{ errors.website[0] }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Organization Type</label>
              <select v-model="form.type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white/70">
                <option value="">Select type</option>
                <template v-if="user?.role === 'community'">
                  <option value="local">Local Community</option>
                  <option value="regional">Regional Community</option>
                  <option value="national">National Community</option>
                  <option value="international">International Community</option>
                  <option value="special_interest">Special Interest Group</option>
                </template>
                <template v-if="user?.role === 'charity'">
                  <option value="nonprofit">Non-Profit</option>
                  <option value="foundation">Foundation</option>
                  <option value="ngo">NGO</option>
                  <option value="cbo">Community-Based Organization</option>
                  <option value="other">Other</option>
                </template>
              </select>
              <p v-if="errors.type" class="text-red-600 text-sm mt-1">{{ errors.type[0] }}</p>
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Visibility</label>
              <select v-model="form.visibility" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white/70">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option v-if="user?.role === 'community'" value="invite_only">Invite Only</option>
              </select>
              <p v-if="errors.visibility" class="text-red-600 text-sm mt-1">{{ errors.visibility[0] }}</p>
            </div>
          </div>
        </div>

        <!-- Health Expert Specific Fields -->
        <div v-if="user?.role === 'health_expert'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Specialization</label>
              <input 
                v-model="form.specialization" 
                type="text" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white/70"
                placeholder="e.g., Cardiology, General Practice"
              />
              <p v-if="errors.specialization" class="text-red-600 text-sm mt-1">{{ errors.specialization[0] }}</p>
            </div>
            
            <div>
              <label class="block text-gray-700 font-medium mb-2">Years of Experience</label>
              <input 
                v-model.number="form.experience_years" 
                type="number" 
                min="0" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white/70"
                placeholder="0"
              />
              <p v-if="errors.experience_years" class="text-red-600 text-sm mt-1">{{ errors.experience_years[0] }}</p>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Qualifications</label>
            <textarea 
              v-model="form.qualifications" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors h-24 bg-white/70"
              placeholder="List your medical qualifications and certifications..."
              maxlength="500"
            ></textarea>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span v-if="errors.qualifications" class="text-red-600">{{ errors.qualifications[0] }}</span>
              <span class="ml-auto">{{ (form.qualifications || '').length }}/500</span>
            </div>
          </div>
        </div>

        <!-- Charity Specific Fields -->
        <div v-if="user?.role === 'charity'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Registration Number</label>
              <input 
                v-model="form.registration_number" 
                type="text" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white/70"
                placeholder="Official registration number"
              />
              <p v-if="errors.registration_number" class="text-red-600 text-sm mt-1">{{ errors.registration_number[0] }}</p>
            </div>
            
            <div>
              <label class="block text-gray-700 font-medium mb-2">Founding Date</label>
              <input 
                v-model="form.founding_date" 
                type="date" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white/70"
              />
              <p v-if="errors.founding_date" class="text-red-600 text-sm mt-1">{{ errors.founding_date[0] }}</p>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Mission Statement</label>
            <textarea 
              v-model="form.mission_statement" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors h-32 bg-white/70"
              placeholder="Describe your organization's mission and goals..."
              maxlength="1000"
            ></textarea>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span v-if="errors.mission_statement" class="text-red-600">{{ errors.mission_statement[0] }}</span>
              <span class="ml-auto">{{ (form.mission_statement || '').length }}/1000</span>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Target Audience</label>
            <input 
              v-model="form.target_audience" 
              type="text" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white/70"
              placeholder="Who does your organization serve?"
              maxlength="500"
            />
            <p v-if="errors.target_audience" class="text-red-600 text-sm mt-1">{{ errors.target_audience[0] }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <div class="flex flex-col sm:flex-row gap-4 justify-end">
          <button 
            type="button"
            @click="resetForm"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50/70 transition-colors font-medium"
          >
            Reset Changes
          </button>
          <button 
            type="submit" 
            :disabled="isUpdating"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Loader2 v-if="isUpdating" class="w-5 h-5 mr-2 animate-spin" />
            {{ isUpdating ? 'Updating...' : 'Update Profile' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
import { ref, computed, onMounted } from 'vue'
import { User, Settings, ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const user = ref(authStore.user)
const errors = ref({})
const isUpdating = ref(false)

const form = ref({
  first_name: '',
  last_name: '',
  phone_number: '',
  description: '',
  location: '',
  type: '',
  visibility: '',
  website: '',
  specialization: '',
  qualifications: '',
  experience_years: null,
  registration_number: '',
  founding_date: '',
  mission_statement: '',
  target_audience: ''
})

const isOrganizationRole = computed(() => {
  return ['health_expert', 'charity', 'community'].includes(user.value?.role)
})

const getRoleTitle = () => {
  const titles = {
    health_expert: 'Health Expert',
    charity: 'Charity Organization',
    community: 'Community'
  }
  return titles[user.value?.role] || ''
}

const loadUserData = () => {
  if (user.value) {
    form.value = {
      first_name: user.value.first_name || '',
      last_name: user.value.last_name || '',
      phone_number: user.value.phone_number || '',
      description: user.value.description || '',
      location: user.value.location || '',
      type: user.value.type || '',
      visibility: user.value.visibility || 'public',
      website: user.value.website || '',
      specialization: user.value.specialization || '',
      qualifications: user.value.qualifications || '',
      experience_years: user.value.experience_years || null,
      registration_number: user.value.registration_number || '',
      founding_date: user.value.founding_date || '',
      mission_statement: user.value.mission_statement || '',
      target_audience: user.value.target_audience || ''
    }
  }
}

onMounted(() => {
  loadUserData()
})

const resetForm = () => {
  loadUserData()
  errors.value = {}
}

const updateProfile = async () => {
  errors.value = {}
  isUpdating.value = true

  try {
    // Clean up form data - remove empty fields
    const cleanedForm = Object.fromEntries(
      Object.entries(form.value).filter(([key, value]) => 
        value !== '' && value !== null && value !== undefined
      )
    )

    const result = await authStore.updateProfile(cleanedForm)
    
    if (result.success) {
      user.value = result.user
      alert('Profile updated successfully!')
    } else {
      if (result.errors) {
        errors.value = result.errors
      }
      alert(result.message || 'Failed to update profile')
    }
  } catch (error) {
    console.error('Profile update error:', error)
    alert('An error occurred while updating your profile')
  } finally {
    isUpdating.value = false
  }
}
</script>