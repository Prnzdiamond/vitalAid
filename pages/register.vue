<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-white">
    <div class="w-full max-w-lg p-8 bg-white shadow-lg rounded-2xl">
      <h2 class="text-3xl font-semibold text-green-600 text-center mb-6">Sign Up for VitalAid</h2>
      
      <form @submit.prevent="registerUser">
        <!-- Name Fields -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700">First Name</label>
            <input v-model="form.first_name" type="text" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
          </div>
          <div>
            <label class="block text-gray-700">Last Name</label>
            <input v-model="form.last_name" type="text" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
          </div>
        </div>

        <!-- Tag Field -->
        <div class="mt-4">
          <label class="block text-gray-700">Tag</label>
          <input v-model="form._tag" type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
        </div>

        <!-- Phone Number -->
        <div class="mt-4">
          <label class="block text-gray-700">Phone Number</label>
          <input v-model="form.phone_number" type="tel" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
        </div>

        <!-- Email -->
        <div class="mt-4">
          <label class="block text-gray-700">Email</label>
          <input v-model="form.email" type="email" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
        </div>

        <!-- Password -->
        <div class="mt-4">
          <label class="block text-gray-700">Password</label>
          <input v-model="form.password" type="password" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
        </div>

        <!-- Role Selection -->
        <div class="mt-4">
          <label class="block text-gray-700">User Role</label>
          <select v-model="form.role" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
            <option value="user">User</option>
            <option value="health_expert">Health Expert</option>
            <option value="charity_Organization">Charity Organization</option>
            <option value="community">Community</option>
          </select>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
          Sign Up
        </button>

        <!-- Login Redirect -->
        <p class="text-center mt-4 text-gray-600">
          Already have an account? 
          <a href="/login" class="text-blue-600 hover:underline">Login</a>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "blank"
})

import { ref } from 'vue';
import { useRouter } from 'vue-router';

const form = ref({
  first_name: '',
  last_name: '',
  _tag: '',
  email: '',
  phone_number: '',
  password: '',
  role: 'user',
});

const errorMessage = ref([]);
const router = useRouter();
const runtimeConfig = useRuntimeConfig();

const registerUser = async () => {
  errorMessage.value = []; // Clear previous errors

  try {
    const response = await $fetch("/register", {
      method: "POST",
      headers: { "Accept": "application/json" },
      baseURL: runtimeConfig.public.apiBase,
      body: form.value
    });

    console.log("Success:");
    router.push('/login'); // Redirect on success
  } catch (error) {
    console.log("Error:", error?.data);
    
    if (error.data.errors) {
      Object.entries(error.data.errors).forEach(([field, messages]) => {
        messages.forEach(msg => errorMessage.value.push(msg));
      });
    } else {
      errorMessage.value.push(error?.data?.message || "An unknown error occurred");
    }
  }
};
</script>
