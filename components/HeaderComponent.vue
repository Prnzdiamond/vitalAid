<template>
  <header class="bg-green-600 p-4 text-white flex justify-between items-center">
    <h1 class="text-xl font-semibold">VitalAid</h1>
    <nav>
      <ul class="flex space-x-4">
        <li><NuxtLink to="/" class="hover:underline">Home</NuxtLink></li>
        <li><NuxtLink to="/dashboard" class="hover:underline">Dashboard</NuxtLink></li>
        <li><NuxtLink to="/profile" class="hover:underline">Profile</NuxtLink></li>
      </ul>
    </nav>
  </header>
</template>
