<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Welcome Card -->
    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center space-x-4 mb-4 lg:mb-0">
          <div class="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {{ user?.first_name?.charAt(0) || user?.name?.charAt(0) || '?' }}
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Welcome back, {{ user?._tag || 'User' }}!
            </h1>
            <p class="text-gray-600 flex items-center mt-1">
              <span class="capitalize">{{ user?.role?.replace('_', ' ') || 'Member' }}</span>
              <span class="mx-2">•</span>
              <span class="text-sm">VitalAid Community</span>
            </p>
          </div>
        </div>
        
        <button 
          @click="$emit('toggle-mobile-menu')"
          class="lg:hidden bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors"
        >
          <Menu class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Quick Navigation Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <NuxtLink 
        v-for="item in (navigationItems || [])" 
        :key="item.name"
        :to="item.href"
        class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300"
      >
        <div class="flex items-center justify-between mb-4">
          <div :class="[
            'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
            item.color
          ]">
            <component :is="item.icon" class="w-6 h-6 text-white" />
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight class="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">{{ item.name }}</h3>
        <p class="text-sm text-gray-600">{{ item.description }}</p>
      </NuxtLink>
    </div>

    <!-- Role-specific Quick Actions -->
    <QuickActions 
      v-if="roleSpecificActions && roleSpecificActions.length > 0"
      :actions="roleSpecificActions"
      :is-verified="isVerified"
      @navigate="$emit('navigate', $event)"
    />
  </section>
</template>

<script setup>
import { Menu, ChevronRight } from 'lucide-vue-next'
import QuickActions from './QuickActions.vue'

const props = defineProps({
user: Object,
navigationItems: Array,
roleSpecificActions: Array,
isVerified: Boolean
})

// Add default values to prevent undefined errors
const { user, navigationItems, roleSpecificActions, isVerified } = toRefs(props)

defineEmits(['toggle-mobile-menu', 'navigate'])
</script>