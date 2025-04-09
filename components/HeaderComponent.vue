<template>
  <header class="bg-green-600 text-white p-4 flex justify-between items-center shadow-md">
    <div class="text-xl font-bold">VitalAid 🌍</div>
    <nav>
      <ul class="flex items-center space-x-4">
        <li><NuxtLink to="/dashboard" class="hover:underline">Dashboard</NuxtLink></li>
        <li><NuxtLink to="/profile" class="hover:underline">Profile</NuxtLink></li>
        <NotificationComponent />
        <li><NuxtLink to="/logout" class="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition">Logout</NuxtLink></li>
      </ul>
    </nav>
  </header>
</template>
