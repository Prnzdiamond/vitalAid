<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-white">
    <div class="w-full max-w-lg p-8 bg-white shadow-lg rounded-2xl">
      <h2 class="text-3xl font-semibold text-green-600 text-center mb-6">Sign Up for VitalAid</h2>

      <form @submit.prevent="registerUser">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700">First Name</label>
            <input v-model="form.first_name" type="text" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
            <p v-if="errors.first_name" class="text-red-600 text-sm mt-1">{{ errors.first_name[0] }}</p>
          </div>
          <div>
            <label class="block text-gray-700">Last Name</label>
            <input v-model="form.last_name" type="text" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
            <p v-if="errors.last_name" class="text-red-600 text-sm mt-1">{{ errors.last_name[0] }}</p>
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-gray-700">Tag</label>
          <input v-model="form._tag" type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
          <p v-if="errors._tag" class="text-red-600 text-sm mt-1">{{ errors._tag[0] }}</p>
        </div>

        <div class="mt-4">
          <label class="block text-gray-700">Phone Number</label>
          <input v-model="form.phone_number" type="tel" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
          <p v-if="errors.phone_number" class="text-red-600 text-sm mt-1">{{ errors.phone_number[0] }}</p>
        </div>

        <div class="mt-4">
          <label class="block text-gray-700">Email</label>
          <input v-model="form.email" type="email" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
          <p v-if="errors.email" class="text-red-600 text-sm mt-1">{{ errors.email[0] }}</p>
        </div>

        <div class="mt-4">
          <label class="block text-gray-700">Password</label>
          <input v-model="form.password" type="password" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
          <p v-if="errors.password" class="text-red-600 text-sm mt-1">{{ errors.password[0] }}</p>
        </div>

        <div class="mt-4">
          <label class="block text-gray-700">User Role</label>
          <select v-model="form.role" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
            <option value="user">User</option>
            <option value="health_expert">Health Expert</option>
            <option value="charity">Charity Organization</option>
            <option value="community">Community</option>
          </select>
          <p v-if="errors.role" class="text-red-600 text-sm mt-1">{{ errors.role[0] }}</p>
        </div>

        <div v-if="responseMessage.length > 0 && !response.success" class="mt-4 text-red-600">
          <ul>
            <li v-for="err in responseMessage" :key="err">{{ err }}</li>
          </ul>
        </div>

        <button type="submit" class="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
          Sign Up
        </button>

        <p class="text-center mt-4 text-gray-600">
          Already have an account?
          <NuxtLink to="/login" class="text-blue-600 hover:underline">Login</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "blank"
})

import { ref} from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useSwal } from '@/composables/useSwal'; // Import useSwal

const form = ref({
  first_name: '',
  last_name: '',
  _tag: '',
  email: '',
  phone_number: '',
  password: '',
  role: 'user',
});

const errors = ref({});
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const response = ref({ success: true, message: '' });
const responseMessage = ref([]);
const store = useAuthStore();
const { swal } = useSwal(); // Destructure swal

const registerUser = async () => {
  errors.value = {}; // Clear previous field-specific errors
  response.value = { success: true, message: '' };
  responseMessage.value = [];

  try {
    const apiResponse = await $fetch("/register", {
      method: "POST",
      headers: { "Accept": "application/json" },
      baseURL: runtimeConfig.public.apiBase,
      body: form.value
    });

    response.value = apiResponse;

    if (response.value.success) {
      console.log("Success:", response.value);
      swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Your account has been created successfully. You can now log in.',
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        router.push('/login'); // Redirect on success
      });
    } else {
      console.log("Registration Error:", response.value?.errors);
      let errorMessage = '';
      if (response.errors) {
        errors.value = response.errors; // Directly assign the errors object
        for (const field in response.errors) {
          errorMessage += `${response.errors[field].join(", ")}\n`;
        }
        swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          html: `<pre>${errorMessage}</pre>`,
        });
        responseMessage.value = response.value.message ? [response.value.message] : [];
      } else {
        swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: response.value?.message || "An unknown error occurred during registration.",
        });
        responseMessage.value.push(response.value?.message || "An unknown error occurred during registration.");
      }
    }
  } catch (error) {
    console.error("Registration Catch Error:", error?.data);

    response.value = { success: false, message: error?.data?.message || "An unexpected error occurred." };

    // Assign field-specific errors if they exist
    if (error?.data?.errors) {
      errors.value = error.data.errors;
      let errorMessage = '';
      for (const field in error.data.errors) {
        errorMessage += `${error.data.errors[field].join(", ")}\n`;
      }
      swal.fire({
        icon: 'error',
        title: 'Registration Error',
        html: `<pre>${errorMessage}</pre>`,
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Registration Error',
        text: error?.data?.message || "An unexpected error occurred.",
      });
    }

    // Always show the general message too
    responseMessage.value.push(error?.data?.message || "An unexpected error occurred.");
  }
};
</script>