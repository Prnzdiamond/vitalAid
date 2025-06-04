<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-white py-8">
    <div class="w-full max-w-2xl p-8 bg-white shadow-lg rounded-2xl">
      <h2 class="text-3xl font-semibold text-green-600 text-center mb-6">Join VitalAid</h2>

      <!-- Debug Error Display (Remove in production) -->
      <div v-if="Object.keys(errors).length > 0" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 class="text-red-800 font-medium mb-2">Form Errors:</h4>
        <pre class="text-sm text-red-700">{{ JSON.stringify(errors, null, 2) }}</pre>
      </div>

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
                :class="inputClass('first_name')"
                placeholder="Enter your first name"
              />
              <ErrorMessage :message="getError('first_name')" />
            </div>
            
            <div>
              <label class="block text-gray-700 font-medium mb-1">Last Name *</label>
              <input 
                v-model="form.last_name" 
                type="text" 
                required 
                :class="inputClass('last_name')"
                placeholder="Enter your last name"
              />
              <ErrorMessage :message="getError('last_name')" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-gray-700 font-medium mb-1">Email *</label>
              <input 
                v-model="form.email" 
                type="email" 
                required 
                :class="inputClass('email')"
                placeholder="your.email@example.com"
              />
              <ErrorMessage :message="getError('email')" />
            </div>
            
            <div>
              <label class="block text-gray-700 font-medium mb-1">Phone Number *</label>
              <input 
                v-model="form.phone_number" 
                type="tel" 
                required 
                :class="inputClass('phone_number')"
                placeholder="+1234567890 or (123) 456-7890"
              />
              <ErrorMessage :message="getError('phone_number')" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-gray-700 font-medium mb-1">Username Tag *</label>
              <input 
                v-model="form._tag" 
                type="text" 
                required 
                :class="inputClass('_tag')"
                placeholder="@username"
                @input="formatTag"
              />
              <p class="text-xs text-gray-500 mt-1">Maximum 25 characters</p>
              <ErrorMessage :message="getError('_tag')" />
            </div>
            
            <div>
              <label class="block text-gray-700 font-medium mb-1">Account Type *</label>
              <select v-model="form.role" required :class="inputClass('role')" @change="onRoleChange">
                <option value="">Select your role</option>
                <option value="user">Individual User</option>
                <option value="health_expert">Health Expert</option>
                <option value="charity">Charity Organization</option>
                <option value="community">Community</option>
              </select>
              <ErrorMessage :message="getError('role')" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-gray-700 font-medium mb-1">Password *</label>
              <div class="relative">
                <input 
                  v-model="form.password" 
                  :type="showPassword ? 'text' : 'password'" 
                  required 
                  :class="inputClass('password')"
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              <ErrorMessage :message="getError('password')" />
            </div>
            
            <div>
              <label class="block text-gray-700 font-medium mb-1">Confirm Password *</label>
              <div class="relative">
                <input 
                  v-model="form.password_confirmation" 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  required 
                  :class="inputClass('password_confirmation')"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Eye v-if="!showConfirmPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              <ErrorMessage :message="getError('password_confirmation')" />
            </div>
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
                :class="textareaClass('description')"
                placeholder="Tell us about your organization..."
                maxlength="1000"
                rows="3"
              ></textarea>
              <ErrorMessage :message="getError('description')" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 font-medium mb-1">Location</label>
                <input 
                  v-model="form.location" 
                  type="text" 
                  :class="inputClass('location')"
                  placeholder="City, Country"
                />
                <ErrorMessage :message="getError('location')" />
              </div>
              
              <div>
                <label class="block text-gray-700 font-medium mb-1">Website</label>
                <input 
                  v-model="form.website" 
                  type="url" 
                  :class="inputClass('website')"
                  placeholder="https://yourwebsite.com"
                />
                <ErrorMessage :message="getError('website')" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 font-medium mb-1">Organization Type</label>
                <select v-model="form.type" :class="inputClass('type')">
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
                <ErrorMessage :message="getError('type')" />
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-1">Visibility</label>
                <select v-model="form.visibility" :class="inputClass('visibility')">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option v-if="form.role === 'community'" value="invite_only">Invite Only</option>
                </select>
                <ErrorMessage :message="getError('visibility')" />
              </div>
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
                  :class="inputClass('specialization')"
                  placeholder="e.g., Cardiology, General Practice"
                />
                <ErrorMessage :message="getError('specialization')" />
              </div>
              
              <div>
                <label class="block text-gray-700 font-medium mb-1">Years of Experience</label>
                <input 
                  v-model.number="form.experience_years" 
                  type="number" 
                  min="0" 
                  :class="inputClass('experience_years')"
                  placeholder="0"
                />
                <ErrorMessage :message="getError('experience_years')" />
              </div>
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-1">Qualifications</label>
              <textarea 
                v-model="form.qualifications" 
                :class="textareaClass('qualifications')"
                placeholder="List your medical qualifications and certifications..."
                maxlength="500"
                rows="3"
              ></textarea>
              <ErrorMessage :message="getError('qualifications')" />
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
                  :class="inputClass('registration_number')"
                  placeholder="Official registration number"
                />
                <ErrorMessage :message="getError('registration_number')" />
              </div>
              
              <div>
                <label class="block text-gray-700 font-medium mb-1">Founding Date</label>
                <input 
                  v-model="form.founding_date" 
                  type="date" 
                  :class="inputClass('founding_date')"
                />
                <ErrorMessage :message="getError('founding_date')" />
              </div>
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-1">Mission Statement</label>
              <textarea 
                v-model="form.mission_statement" 
                :class="textareaClass('mission_statement')"
                placeholder="Describe your organization's mission and goals..."
                maxlength="1000"
                rows="3"
              ></textarea>
              <ErrorMessage :message="getError('mission_statement')" />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-1">Target Audience</label>
              <input 
                v-model="form.target_audience" 
                type="text" 
                :class="inputClass('target_audience')"
                placeholder="Who does your organization serve?"
                maxlength="500"
              />
              <ErrorMessage :message="getError('target_audience')" />
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
import { ref, computed, nextTick, onBeforeMount } from 'vue'
import { User, Settings, Loader2, Eye, EyeOff } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { definePageMeta, useFetch } from '#imports'
import Swal from 'sweetalert2'

definePageMeta({
  layout: "blank",
})

const router = useRouter()
const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()

// Enhanced Error Message Component with better styling
const ErrorMessage = {
  props: ['message'],
  template: `
    <div v-if="message" class="mt-1">
      <p class="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md border-l-4 border-red-400 flex items-start">
        <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>{{ message }}</span>
      </p>
    </div>
  `
}

const form = ref({
  first_name: '',
  last_name: '',
  _tag: '',
  email: '',
  phone_number: '',
  password: '',
  password_confirmation: '',
  role: '',
  description: '',
  location: '',
  type: '',
  visibility: 'public',
  website: '',
  specialization: '',
  qualifications: '',
  experience_years: null,
  registration_number: '',
  founding_date: '',
  mission_statement: '',
  target_audience: ''
})

const errors = ref({})
const isSubmitting = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const isOrganizationRole = computed(() => {
  return ['health_expert', 'charity', 'community'].includes(form.value.role)
})

// Fixed getError function to properly handle the error structure
const getError = (field) => {
  const error = errors.value[field]
  if (!error) return null
  
  // Handle array format (which is what your backend sends)
  if (Array.isArray(error)) {
    return error[0] // Return first error message
  }
  
  // Handle string format
  if (typeof error === 'string') {
    return error
  }
  
  // Handle object format
  if (typeof error === 'object' && error !== null) {
    const firstKey = Object.keys(error)[0]
    if (firstKey) {
      const firstValue = error[firstKey]
      return Array.isArray(firstValue) ? firstValue[0] : firstValue
    }
  }
  
  return error
}

const inputClass = (field) => {
  const baseClass = "w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 transition-colors"
  return errors.value[field] 
    ? `${baseClass} border-red-300 focus:border-red-500 bg-red-50`
    : `${baseClass} border-gray-300 focus:border-green-500`
}

const textareaClass = (field) => {
  const baseClass = "w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 transition-colors resize-none"
  return errors.value[field] 
    ? `${baseClass} border-red-300 focus:border-red-500 bg-red-50`
    : `${baseClass} border-gray-300 focus:border-green-500`
}

const formatTag = (event) => {
  let value = event.target.value.trim()
  if (!value.startsWith('@')) {
    value = '@' + value.replace('@', '')
  }
  form.value._tag = value.substring(0, 26) // @username = 25 chars max
}

const onRoleChange = () => {
  // Reset role-specific fields when role changes
  const fieldsToReset = ['description', 'location', 'type', 'website', 'specialization', 'qualifications', 'experience_years', 'registration_number', 'founding_date', 'mission_statement', 'target_audience']
  fieldsToReset.forEach(field => {
    if (field === 'experience_years') {
      form.value[field] = null
    } else {
      form.value[field] = ''
    }
  })
  form.value.visibility = 'public'
  // Clear errors for role-specific fields
  errors.value = {}
}

const getRoleTitle = () => {
  const titles = {
    health_expert: 'Health Expert',
    charity: 'Charity Organization',
    community: 'Community'
  }
  return titles[form.value.role] || ''
}

// Enhanced error processing function
const processErrors = (errorData) => {
  console.log('Processing errors:', errorData)
  
  if (!errorData) return {}
  
  // If errorData.errors exists, use it
  if (errorData.errors) {
    return errorData.errors
  }
  
  // If errorData itself is the errors object
  if (typeof errorData === 'object' && !errorData.message && !errorData.success) {
    return errorData
  }
  
  return {}
}

const registerUser = async () => {
  // Clear previous errors
  errors.value = {}
  isSubmitting.value = true

  try {
    // Clean up form data - remove empty fields
    const cleanedForm = Object.fromEntries(
      Object.entries(form.value).filter(([key, value]) => 
        value !== '' && value !== null && value !== undefined
      )
    )

    console.log('Submitting form data:', cleanedForm)

    const response = await useFetch("/register", {
      method: "POST",
      headers: { "Accept": "application/json" },
      baseURL: runtimeConfig.public.apiBase,
      body: cleanedForm
    })

    console.log('Full response:', response)

    // Handle successful registration
    if (response.data.value?.success) {
      await Swal.fire({
        title: 'Success!',
        text: 'Registration successful! Please log in to continue.',
        icon: 'success',
        confirmButtonText: 'Continue to Login',
        confirmButtonColor: '#059669'
      })
      router.push('/login')
      return
    }

    // Handle error response
    if (response.error.value) {
      const errorData = response.error.value.data
      console.log('Error response data:', errorData)
      
      // Process and set errors
      const processedErrors = processErrors(errorData)
      if (Object.keys(processedErrors).length > 0) {
        errors.value = processedErrors
        console.log('Set errors:', errors.value)
      }
      
      // Show error message
      await Swal.fire({
        title: 'Registration Failed',
        text: errorData?.message || 'Please check the form for errors and try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      })
    } else if (response.data.value && !response.data.value.success) {
      // Handle server-side validation failures
      const processedErrors = processErrors(response.data.value)
      if (Object.keys(processedErrors).length > 0) {
        errors.value = processedErrors
        console.log('Set errors from data:', errors.value)
      }
      
      await Swal.fire({
        title: 'Registration Failed',
        text: response.data.value.message || 'Please check the form for errors and try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      })
    }

  } catch (error) {
    console.error("Registration error:", error)
    
    // Handle any additional error cases
    const processedErrors = processErrors(error?.data)
    if (Object.keys(processedErrors).length > 0) {
      errors.value = processedErrors
    }
    
    await Swal.fire({
      title: 'Error',
      text: error?.data?.message || 'Registration failed. Please try again.',
      icon: 'error',
      confirmButtonColor: '#dc2626'
    })
  } finally {
    isSubmitting.value = false
    
    // Scroll to first error if any exist
    if (Object.keys(errors.value).length > 0) {
      console.log('Scrolling to first error. Current errors:', errors.value)
      nextTick(() => {
        const firstErrorElement = document.querySelector('.border-red-300')
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          firstErrorElement.focus()
        }
      })
    }
  }
}

onBeforeMount(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>