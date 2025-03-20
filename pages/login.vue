<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-white">
    <div class="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
      <h2 class="text-3xl font-semibold text-green-600 text-center mb-6">Welcome Back to VitalAid</h2>

      <ul>
        <li v-for="er in errorMessage">
          <p class="text-red-600 text-sm">{{ er }}</p>
        </li>
      </ul>

      <form @submit.prevent="loginUser">
        <!-- Email or Tag -->
        <div class="mt-4">
          <label class="block text-gray-700">Email or Tag</label>
          <input v-model="form.email_tag" type="text" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
        </div>

        <!-- Password -->
        <div class="mt-4">
          <label class="block text-gray-700">Password</label>
          <input v-model="form.password" type="password" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
        </div>

        <!-- Submit Button -->
        <button type="submit" class="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
          Login
        </button>

        <!-- Forgot Password & Register -->
        <div class="mt-4 text-center">
          <a href="/forgot-password" class="text-blue-600 hover:underline">Forgot Password?</a>
        </div>
        <p class="text-center mt-2 text-gray-600">
          New user? 
          <a href="/register" class="text-blue-600 hover:underline">Register</a>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
// Import useAuthStore

const form = ref({ email_tag: "", password: "" });
const errorMessage = ref("");
const router = useRouter();
const store = useAuthStore();

const loginUser = async () => {
  errorMessage.value = ""; // Clear previous errors

  const response = await store.login(form.value);

  if (response.success) {
    router.push("/dashboard"); // Redirect to dashboard on success
  } else {
    form.value.password = ""; // Clear password field
    errorMessage.value = response.message || "Invalid credentials";
    console.error("Login Error:", errorMessage.value);
  }
};
</script>
