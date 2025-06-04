<template>
    <div class="fixed bottom-6 right-6 z-40">
      <button
        @click="$emit('toggle')"
        :class="[
          'group relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center',
          'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
          'hover:scale-110 active:scale-95'
        ]"
      >
        <!-- Chat Icon -->
        <MessageCircle class="w-6 h-6 transition-transform group-hover:scale-110" />
        
        <!-- Notification Badge -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="scale-0 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-0 opacity-0"
        >
          <div 
            v-if="hasUnreadMessages" 
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse"
          >
            <span class="text-xs text-white font-medium">!</span>
          </div>
        </Transition>
        
        <!-- Ripple Effect -->
        <div class="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-300"></div>
      </button>
      
      <!-- Tooltip -->
      <div class="absolute bottom-16 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div class="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
          {{ hasUnreadMessages ? 'New messages!' : 'Open chat' }}
          <div class="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { MessageCircle } from 'lucide-vue-next'
  
  defineProps({
    hasUnreadMessages: Boolean
  })
  
  defineEmits(['toggle'])
  </script>