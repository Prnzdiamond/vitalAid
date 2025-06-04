<template>
    <div class="mb-1">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="action in actions"
          :key="action.label"
          @click="$emit('navigate', action.path)"
          :disabled="action.requiresVerification && !isVerified"
          :class="[
            'p-4 rounded-xl border-2 border-dashed transition-all duration-200 text-left group',
            action.requiresVerification && !isVerified
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50 cursor-pointer hover:shadow-md'
          ]"
        >
          <div class="flex items-center space-x-3">
            <div :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
              action.requiresVerification && !isVerified
                ? 'bg-gray-200'
                : 'bg-green-100 group-hover:bg-green-200 group-hover:scale-110'
            ]">
              <component 
                :is="action.icon" 
                :class="[
                  'w-5 h-5 transition-colors',
                  action.requiresVerification && !isVerified
                    ? 'text-gray-400'
                    : 'text-green-600 group-hover:text-green-700'
                ]" 
              />
            </div>
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <span :class="[
                  'font-medium transition-colors',
                  action.requiresVerification && !isVerified
                    ? 'text-gray-400'
                    : 'text-gray-900 group-hover:text-green-900'
                ]">
                  {{ action.label }}
                </span>
                <Lock v-if="action.requiresVerification && !isVerified" class="w-3 h-3 text-gray-400" />
              </div>
              <p :class="[
                'text-xs mt-1 transition-colors',
                action.requiresVerification && !isVerified
                  ? 'text-gray-400'
                  : 'text-gray-500 group-hover:text-gray-600'
              ]">
                {{ action.description }}
              </p>
            </div>
            <ChevronRight :class="[
              'w-4 h-4 transition-all duration-200',
              action.requiresVerification && !isVerified
                ? 'text-gray-300'
                : 'text-gray-400 group-hover:text-green-600 group-hover:translate-x-1'
            ]" />
          </div>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { Lock, ChevronRight } from 'lucide-vue-next'
  
  defineProps({
    actions: Array,
    isVerified: Boolean
  })
  
  defineEmits(['navigate'])
  </script>