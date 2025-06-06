<template>
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="open" class="fixed inset-0 z-50 lg:hidden">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('update:open', false)" />
          
          <!-- Slide-out Panel -->
          <Transition
            enter-active-class="transition-transform duration-300 ease-out"
            enter-from-class="translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition-transform duration-300 ease-in"
            leave-from-class="translate-x-0"
            leave-to-class="translate-x-full"
          >
            <nav v-if="open" class="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl">
              <div class="flex flex-col h-full">
                <!-- Header -->
                <div class="p-6 border-b border-gray-100">
                  <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-semibold text-gray-900">Navigation</h2>
                    <button 
                      @click="$emit('update:open', false)"
                      class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X class="w-5 h-5" />
                    </button>
                  </div>
                  
                  <!-- User Profile -->
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {{ user?.first_name?.charAt(0) || user?.name?.charAt(0) || '?' }}
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">{{ user?._tag || 'User' }}</h3>
                      <p class="text-sm text-gray-500 capitalize">{{ user?.role?.replace('_', ' ') || 'Member' }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Navigation Items -->
                <div class="flex-1 overflow-y-auto px-6 py-4">
                  <div class="space-y-2">
                    <NuxtLink 
                      v-for="item in navigationItems" 
                      :key="item.name"
                      :to="item.href" 
                      @click="$emit('update:open', false)"
                      class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div :class="[
                        'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
                        item.color,
                        'group-hover:scale-110'
                      ]">
                        <component :is="item.icon" class="w-5 h-5 text-white" />
                      </div>
                      <div class="flex-1">
                        <span class="font-medium">{{ item.name }}</span>
                        <p class="text-xs text-gray-500 mt-0.5">{{ item.description }}</p>
                      </div>
                      <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </NuxtLink>
                  </div>
                </div>
                
                <!-- Footer Actions -->
                <div class="p-6 border-t border-gray-100 space-y-2">
                  <NuxtLink 
                    to="/profile"
                    @click="$emit('update:open', false)"
                    class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Settings class="w-5 h-5" />
                    <span class="font-medium">Settings</span>
                  </NuxtLink>
                  <NuxtLink 
            to="/dashboard" 
            @click="$emit('update:open', false)"
            class="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 group"
          >
            <Home class="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span class="font-medium">Dashboard</span>
          </NuxtLink>
          
          <NuxtLink 
            to="/profile"
            @click="$emit('update:open', false)"
            class="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
          >
            <User class="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span class="font-medium text-sm">Profile</span>
          </NuxtLink>
                  
                  <button 
                    @click="handleLogout"
                    class="flex items-center space-x-3 w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut class="w-5 h-5" />
                    <span class="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </nav>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </template>
  
  <script setup>
  import { X, ChevronRight, Settings, LogOut } from 'lucide-vue-next'
  import { useAuthStore } from '~/stores/authStore'
  import { useRouter } from 'vue-router'
  
  defineProps({
    open: Boolean,
    user: Object,
    navigationItems: Array
  })
  
  defineEmits(['update:open'])
  
  const authStore = useAuthStore()
  const router = useRouter()
  
  const handleLogout = async () => {
    try {
      await authStore.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  </script>