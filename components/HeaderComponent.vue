<template>
  <header class="bg-white/90 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-40">
    <div class=" px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo Section -->
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-lg">V</span>
          </div>
          <div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              VitalAid
            </h1>
            <p class="text-xs text-gray-500 hidden sm:block">Health & Community Platform</p>
          </div>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center space-x-2">
          <!-- Navigation Items -->
          <NuxtLink 
            v-for="item in navigationItems.slice(0, 4)" 
            :key="item.name"
            :to="item.href"
            class="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 group relative"
            :class="item.name === 'Dashboard' ? 'hover:text-green-600 hover:bg-green-50' : item.name === 'Profile' ? 'hover:text-blue-600 hover:bg-blue-50' : 'hover:text-gray-900'"
          >
            <div :class="[
              'w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 group-hover:scale-110',
              item.color
            ]">
              <component :is="item.icon" class="w-3.5 h-3.5 text-white" />
            </div>
            <span class="font-medium text-sm">{{ item.name }}</span>
          </NuxtLink>

          <!-- More Items Dropdown if there are more than 4 -->
          <div v-if="navigationItems.length > 4" class="relative" ref="moreNavRef">
            <button 
              @click="toggleMoreNav"
              :class="[
                'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200',
                moreNavOpen 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-700 hover:bg-gray-50'
              ]"
            >
              <MoreHorizontal class="w-4 h-4" />
              <span class="font-medium text-sm">More</span>
              <ChevronDown :class="['w-4 h-4 transition-transform', moreNavOpen && 'rotate-180']" />
            </button>

            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div v-if="moreNavOpen" class="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <NuxtLink 
                  v-for="item in navigationItems.slice(4)" 
                  :key="item.name"
                  :to="item.href"
                  @click="moreNavOpen = false"
                  class="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors group"
                >
                  <div :class="[
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110',
                    item.color
                  ]">
                    <component :is="item.icon" class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium">{{ item.name }}</p>
                    <p class="text-xs text-gray-500">{{ item.description }}</p>
                  </div>
                </NuxtLink>
              </div>
            </Transition>
          </div>

          <!-- Divider -->
          <div class="w-px h-6 bg-gray-200 mx-2"></div>
          <NuxtLink 
            to="/dashboard" 
            class="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 group"
          >
            <Home class="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span class="font-medium">Dashboard</span>
          </NuxtLink>
          
          <NuxtLink 
            to="/profile" 
            class="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
          >
            <User class="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span class="font-medium text-sm">Profile</span>
          </NuxtLink>

          <!-- Notification Component -->
          <div class="relative">
            <NotificationComponent />
          </div>

          <!-- User Menu -->
          <div class="relative" ref="userMenuRef">
            <button 
              @click="toggleUserMenu"
              :class="[
                'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200',
                userMenuOpen 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-700 hover:bg-gray-50'
              ]"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                {{ user?.first_name?.charAt(0) || user?.name?.charAt(0) || '?' }}
              </div>
              <ChevronDown :class="['w-4 h-4 transition-transform', userMenuOpen && 'rotate-180']" />
            </button>

            <!-- User Dropdown Menu -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div v-if="userMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900">{{ user?._tag || 'User' }}</p>
                  <p class="text-xs text-gray-500 capitalize">{{ user?.role?.replace('_', ' ') || 'Member' }}</p>
                </div>
                
                <NuxtLink 
                  to="/profile" 
                  @click="userMenuOpen = false"
                  class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings class="w-4 h-4" />
                  <span>Settings</span>
                </NuxtLink>
                
                <NuxtLink 
                  to="/logout"
                  class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut class="w-4 h-4" />
                  <span>Sign Out</span>
                </NuxtLink>
              </div>
            </Transition>
          </div>
        </nav>

        <!-- Mobile Menu Button -->
        <button 
          @click="$emit('toggle-mobile-menu')"
          class="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Menu class="w-6 h-6" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Home, User, ChevronDown, Settings, LogOut, Menu, MoreHorizontal } from 'lucide-vue-next'
import NotificationComponent from './NotificationComponent.vue'
import { useAuthStore } from '~/stores/authStore'
import { useRouter } from 'vue-router'

const props = defineProps({
  user: Object,
  navigationItems: Array
})

const emit = defineEmits(['toggle-mobile-menu'])

const authStore = useAuthStore()
const router = useRouter()

const userMenuOpen = ref(false)
const moreNavOpen = ref(false)
const userMenuRef = ref(null)
const moreNavRef = ref(null)

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
  if (userMenuOpen.value) {
    moreNavOpen.value = false
  }
}

const toggleMoreNav = () => {
  moreNavOpen.value = !moreNavOpen.value
  if (moreNavOpen.value) {
    userMenuOpen.value = false
  }
}



// Close menus when clicking outside
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    userMenuOpen.value = false
  }
  if (moreNavRef.value && !moreNavRef.value.contains(event.target)) {
    moreNavOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>