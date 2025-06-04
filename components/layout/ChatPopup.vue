<template>
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50 p-4">
          <!-- Enhanced Backdrop -->
          <div 
            class="absolute inset-0 bg-black/30 backdrop-blur-sm" 
            @click="$emit('close')"
          />
  
          <!-- Chat Container -->
          <div class="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl relative border border-gray-200 overflow-hidden">
            <!-- Loading State - Only show when actually loading and no consultation data -->
            <div v-if="loading && !consultationData" class="p-6 flex flex-col items-center justify-center h-full">
              <div class="relative">
                <!-- Simplified Loading Spinner -->
                <div class="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <div class="mt-4 text-center">
                <p class="text-gray-600 text-sm">Loading consultation...</p>
              </div>
            </div>
            
            <!-- Close Button -->
            <button 
              @click="$emit('close')" 
              class="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200 z-10 group"
            >
              <X class="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>
            
            <!-- Chat Header - Show when consultation data is available OR when we have a consultationId -->
            <div v-if="consultationData || consultationId" class="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 border-b border-gray-100">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Health Consultation</h3>
                  <p class="text-sm text-gray-600">
                    Status: <span :class="statusClass">{{ formatStatus(consultationData?.status || 'requested') }}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Chatbox Content - Show when we have consultation data, consultationId, OR when not loading -->
            <div v-if="consultationData || consultationId || (!loading && !consultationData)" class="h-full">
              <Chatbox 
                :key="`popup-chat-${consultationId || 'new'}`"
                :consultation-id="consultationId" 
                :consultation="consultationData"
                class="h-full"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </template>


  <script setup>
  import { computed } from 'vue'
  import { X, MessageCircle } from 'lucide-vue-next'
  import Chatbox from '@/components/Chatbox.vue'
  
  const props = defineProps({
    show: Boolean,
    consultationId: [String, Number],
    consultationData: Object,
    loading: Boolean
  })
  
  defineEmits(['close', 'update:show'])
  
  const statusClass = computed(() => {
    if (!props.consultationData?.status) return 'text-gray-500'
    
    const statusColors = {
      'requested': 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium',
      'in_progress': 'text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium',
      'completed': 'text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium',
      'cancelled': 'text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-medium'
    }
    
    return statusColors[props.consultationData.status] || 'text-gray-500'
  })
  
  const formatStatus = (status) => {
    if (!status) return 'Unknown'
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  </script>
  
  <style scoped>
  @keyframes reverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
  
  .animate-reverse {
    animation-direction: reverse;
  }
  </style>