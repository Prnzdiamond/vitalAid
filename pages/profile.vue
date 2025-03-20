<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-white">
    <div class="w-full max-w-lg bg-white shadow-lg rounded-2xl p-8">
      <h2 class="text-3xl font-semibold text-green-600 text-center mb-6">Profile</h2>

      <!-- User Info -->
      <div class="space-y-4">
        <div>
          <label class="block text-gray-700 font-medium">Full Name</label>
          <input v-model="user.fullName" type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200" disabled>
        </div>
        
        <div>
          <label class="block text-gray-700 font-medium">Email</label>
          <input v-model="user.email" type="email" class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200" disabled>
        </div>

        <div>
          <label class="block text-gray-700 font-medium">Role</label>
          <input v-model="user.role" type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200" disabled>
        </div>
      </div>

      <!-- Edit Profile (For MVP, Only Name is Editable) -->
      <div class="mt-6">
        <label class="block text-gray-700 font-medium">Update Name</label>
        <input v-model="user.fullName" type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
      </div>

      <!-- Buttons -->
      <div class="mt-6 flex justify-between">
        <button @click="updateProfile" class="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition">
          Save Changes
        </button>
        <button @click="logout" class="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const user = ref({
  fullName: 'John Doe',
  email: 'johndoe@example.com',
  role: 'User',
});

const updateProfile = () => {
  console.log('Updated Profile:', user.value);
  // TODO: Connect to Laravel API for profile updates
};

const logout = () => {
  console.log('User Logged Out');
  // TODO: Implement actual logout logic
};
</script>

<style scoped>
/* Optional additional styles */
</style>
