<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-white">
    <div class="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
      <h2 class="text-3xl font-semibold text-green-600 text-center mb-6">Welcome Back to VitalAid</h2>

      <form @submit.prevent="loginUser">
        <div class="mt-4">
          <label class="block text-gray-700">Email or Tag</label>
          <input v-model="form.email_tag" type="text" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
          <p v-if="errors.email_tag" class="text-red-600 text-sm mt-1">{{ errors.email_tag[0] }}</p>
        </div>

        <div class="mt-4">
          <label class="block text-gray-700">Password</label>
          <input v-model="form.password" type="password" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-green-200">
          <p v-if="errors.password" class="text-red-600 text-sm mt-1">{{ errors.password[0] }}</p>
        </div>

        <div v-if="responseMessage && !response.success" class="mt-4 text-red-600">
          <p>{{ responseMessage }}</p>
        </div>

        <button type="submit" class="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
          Login
        </button>

        <div class="mt-4 text-center">
          <a href="/forgot-password" class="text-blue-600 hover:underline">Forgot Password?</a>
        </div>
        <p class="text-center mt-2 text-gray-600">
          New user?
          <NuxtLink to="/register" class="text-blue-600 hover:underline">Register</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>
<script setup>
definePageMeta({
  layout: "blank",
})

import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useSwal } from "@/composables/useSwal"; // Import useSwal
const authStore = useAuthStore();

 

const form = ref({ email_tag: "", password: "" });
const errors = ref({});
const response = ref({});
const responseMessage = ref("");
const router = useRouter();
const store = useAuthStore();
const { swal } = useSwal(); // Destructure swal

async function loginUser() {
  errors.value = {};
  responseMessage.value = "";
  response.value = {};

  const res = await store.login(form.value);
  console.log(res);

  response.value = res;
  if (!res.success) {
    // If backend returned validation errors
    if (res.errors) {
      errors.value = res.errors;
      let errorMessage = "";
      for (const field in res.errors) {
        console.log(res.errors[field]);
        const messages = Array.isArray(res.errors[field]) 
  ? res.errors[field].join(", ") 
  : res.errors[field]; // fallback if it's a string or something else

errorMessage += `${messages}\n`;

      }
      swal.fire({
        icon: 'error',
        title: 'Login Failed',
        html: `<pre>${errorMessage}</pre>`,
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: res.message,
      });
      responseMessage.value = res.message;
    }
  } else {
    swal.fire({
      icon: 'success',
      title: 'Login Successful!',
      text: 'You have been successfully logged in.',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      router.push("/"); // Redirect to homepage (or dashboard)
    });
  }
}

onBeforeMount(() => {
  if (authStore.isAuthenticated) {
    router.push("/dashboard"); // Redirect to homepage if already logged in
  }
})

</script>
