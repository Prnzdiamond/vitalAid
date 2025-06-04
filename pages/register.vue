<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-white py-8">
    <div class="w-full max-w-2xl p-8 bg-white shadow-lg rounded-2xl">
      <h2 class="text-3xl font-semibold text-green-600 text-center mb-6">Join VitalAid</h2>

      <form @submit.prevent="registerUser" class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <User class="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 font-medium mb-1">First Name *</label>
              <input 
                v-model="form.first_name" 
                type="text" 
                required 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Enter your first name"
              />
              <p v-if="errors.first_name" class="text-red-600 text-sm mt-1">{{ errors.first_name[0] }}</p>
            </div>
            
            <div>
              <label class="block text-gray-700 font-medium mb-1">Last Name *</label>
              <input 
                v-model="form.last_name" 
                type="text" 
                required 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Enter your last name"
              />
              <p v-if="errors.last_name" class="text-red-600 text-sm mt-1">{{ errors.last_name[0] }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-gray-700 font-medium mb-1">Email *</label>
              <input 
                v-model="form.email" 
                type="email" 
                required 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="your.email@example.com"
              />
              <p v-if="errors.email" class="text-red-600 text-sm mt-1">{{ errors.email[0] }}</p>
            </div>
            
            <div>
              <label class="block text-gray-700 font-medium mb-1">Phone Number *</label>
              <input 
                v-model="form.phone_number" 
                type="tel" 
                required 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="+1234567890"
              />
              <p v-if="errors.phone_number" class="text-red-600 text-sm mt-1">{{ errors.phone_number[0] }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-gray-700 font-medium mb-1">Username Tag *</label>
              <input 
                v-model="form._tag" 
                type="text" 
                required 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="@username"
                @input="formatTag"
              />
              <p class="text-xs text-gray-500 mt-1">3-30 characters, letters and numbers only</p>
              <p v-if="errors._tag" class="text-red-600 text-sm mt-1">{{ errors._tag[0] }}</p>
            </div>
            
            <div>
              <label class="block text-gray-700 font-medium mb-1">Account Type *</label>
              <select v-model="form.role" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" @change="onRoleChange">
                <option value="">Select your role</option>
                <option value="user">Individual User</option>
                <option value="health_expert">Health Expert</option>
                <option value="charity">Charity Organization</option>
                <option value="community">Community</option>
              </select>
              <p v-if="errors.role" class="text-red-600 text-sm mt-1">{{ errors.role[0] }}</p>
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-gray-700 font-medium mb-1">Password *</label>
            <input 
              v-model="form.password" 
              type="password" 
              required 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Minimum 6 characters"
            />
            <p v-if="errors.password" class="text-red-600 text-sm mt-1">{{ errors.password[0] }}</p>
          </div>
        </div>

        <!-- Role-specific Fields -->
        <div v-if="form.role && form.role !== 'user'" class="bg-blue-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <Settings class="w-5 h-5 mr-2" />
            {{ getRoleTitle() }} Information
          </h3>

          <!-- Common Organization Fields -->
          <div v-if="isOrganizationRole" class="space-y-4">
            <div>
              <label class="block text-gray-700 font-medium mb-1">Description</label>
              <textarea 
                v-model="form.description" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors h-24"
                placeholder="Tell us about your organization..."
                maxlength="1000"
              ></textarea>
              <p v-if="errors.description" class="text-red-600 text-sm mt-1">{{ errors.description[0] }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 font-medium mb-1">Location</label>
                <input 
                  v-model="form.location" 
                  type="text" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="City, Country"
                />
                <p v-if="errors.location" class="text-red-600 text-sm mt-1">{{ errors.location[0] }}</p>
              </div>
              
              <div>
                <label class="block text-gray-700 font-medium mb-1">Website</label>
                <input 
                  v-model="form.website" 
                  type="url" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="https://yourwebsite.com"
                />
                <p v-if="errors.website" class="text-red-600 text-sm mt-1">{{ errors.website[0] }}</p>
              </div>
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-1">Organization Type</label>
              <select v-model="form.type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
                <option value="">Select type</option>
                <template v-if="form.role === 'community'">
                  <option value="local">Local Community</option>
                  <option value="regional">Regional Community</option>
                  <option value="national">National Community</option>
                  <option value="international">International Community</option>
                  <option value="special_interest">Special Interest Group</option>
                </template>
                <template v-if="form.role === 'charity'">
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
              <label class="block text-gray-700 font-medium mb-1">Visibility</label>
              <select v-model="form.visibility" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option v-if="form.role === 'community'" value="invite_only">Invite Only</option>
              </select>
              <p v-if="errors.visibility" class="text-red-600 text-sm mt-1">{{ errors.visibility[0] }}</p>
            </div>
          </div>

          <!-- Health Expert Specific Fields -->
          <div v-if="form.role === 'health_expert'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 font-medium mb-1">Specialization</label>
                <input 
                  v-model="form.specialization" 
                  type="text" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="e.g., Cardiology, General Practice"
                />
                <p v-if="errors.specialization" class="text-red-600 text-sm mt-1">{{ errors.specialization[0] }}</p>
              </div>
              
              <div>
                <label class="block text-gray-700 font-medium mb-1">Years of Experience</label>
                <input 
                  v-model.number="form.experience_years" 
                  type="number" 
                  min="0" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="0"
                />
                <p v-if="errors.experience_years" class="text-red-600 text-sm mt-1">{{ errors.experience_years[0] }}</p>
              </div>
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-1">Qualifications</label>
              <textarea 
                v-model="form.qualifications" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors h-20"
                placeholder="List your medical qualifications and certifications..."
                maxlength="500"
              ></textarea>
              <p v-if="errors.qualifications" class="text-red-600 text-sm mt-1">{{ errors.qualifications[0] }}</p>
            </div>
          </div>

          <!-- Charity Specific Fields -->
          <div v-if="form.role === 'charity'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 font-medium mb-1">Registration Number</label>
                <input 
                  v-model="form.registration_number" 
                  type="text" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Official registration number"
                />
                <p v-if="errors.registration_number" class="text-red-600 text-sm mt-1">{{ errors.registration_number[0] }}</p>
              </div>
              
              <div>
                <label class="block text-gray-700 font-medium mb-1">Founding Date</label>
                <input 
                  v-model="form.founding_date" 
                  type="date" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
                <p v-if="errors.founding_date" class="text-red-600 text-sm mt-1">{{ errors.founding_date[0] }}</p>
              </div>
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-1">Mission Statement</label>
              <textarea 
                v-model="form.mission_statement" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors h-24"
                placeholder="Describe your organization's mission and goals..."
                maxlength="1000"
              ></textarea>
              <p v-if="errors.mission_statement" class="text-red-600 text-sm mt-1">{{ errors.mission_statement[0] }}</p>
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-1">Target Audience</label>
              <input 
                v-model="form.target_audience" 
                type="text" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Who does your organization serve?"
                maxlength="500"
              />
              <p v-if="errors.target_audience" class="text-red-600 text-sm mt-1">{{ errors.target_audience[0] }}</p>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Loader2 v-if="isSubmitting" class="w-5 h-5 mr-2 animate-spin" />
          {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
        </button>

        <p class="text-center text-gray-600">
          Already have an account?
          <NuxtLink to="/login" class="text-blue-600 hover:underline font-medium">Sign In</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { User, Settings, Loader2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { definePageMeta, useFetch } from '#imports'

definePageMeta({
  layout: "blank"
})

const router = useRouter()
const runtimeConfig = useRuntimeConfig()

const form = ref({
  first_name: '',
  last_name: '',
  _tag: '',
  email: '',
  phone_number: '',
  password: '',
  role: '',
  // Organization fields
  description: '',
  location: '',
  type: '',
  visibility: 'public',
  website: '',
  // Health expert fields
  specialization: '',
  qualifications: '',
  experience_years: null,
  // Charity fields
  registration_number: '',
  founding_date: '',
  mission_statement: '',
  target_audience: ''
})

const errors = ref({})
const isSubmitting = ref(false)

const isOrganizationRole = computed(() => {
  return ['health_expert', 'charity', 'community'].includes(form.value.role)
})

const formatTag = (event) => {
  let value = event.target.value
  if (!value.startsWith('@')) {
    value = '@' + value.replace('@', '')
  }
  form.value._tag = value.replace(/[^a-zA-Z0-9@]/g, '').substring(0, 31)
}

const onRoleChange = () => {
  // Reset role-specific fields when role changes
  form.value.description = ''
  form.value.location = ''
  form.value.type = ''
  form.value.visibility = 'public'
  form.value.website = ''
  form.value.specialization = ''
  form.value.qualifications = ''
  form.value.experience_years = null
  form.value.registration_number = ''
  form.value.founding_date = ''
  form.value.mission_statement = ''
  form.value.target_audience = ''
}

const getRoleTitle = () => {
  const titles = {
    health_expert: 'Health Expert',
    charity: 'Charity Organization',
    community: 'Community'
  }
  return titles[form.value.role] || ''
}

const registerUser = async () => {
  errors.value = {}
  isSubmitting.value = true

  try {
    // Clean up form data - remove empty fields
    const cleanedForm = Object.fromEntries(
      Object.entries(form.value).filter(([key, value]) => 
        value !== '' && value !== null && value !== undefined
      )
    )

    const response = await useFetch("/register", {
      method: "POST",
      headers: { "Accept": "application/json" },
      baseURL: runtimeConfig.public.apiBase,
      body: cleanedForm
    })

    if (response.data.value.success) {
      alert('Registration successful! Please log in to continue.')
      router.push('/login')
    } else {
      if (response.data.value.errors) {
        errors.value = response.data.value.errors
      }
      alert(response.data.value.message || 'Registration failed')
    }
  } catch (error) {
    console.error("Registration error:", error)
    
    if (error?.data?.errors) {
      errors.value = error.data.errors
    }
    
    alert(error?.data?.message || 'Registration failed. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>