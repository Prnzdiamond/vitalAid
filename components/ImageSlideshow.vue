<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" @click.self="emit('close')">
    <!-- Close button -->
    <button 
      @click="emit('close')" 
      class="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
      aria-label="Close slideshow"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    
    <!-- Image counter -->
    <div class="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
      {{ currentIndex + 1 }} / {{ images.length }}
    </div>
    
    <!-- Main image container -->
    <div class="relative w-full h-full flex items-center justify-center p-4 md:p-8">
      <img 
        :src="images[currentIndex]" 
        :alt="`Image ${currentIndex + 1}`" 
        class="max-w-full max-h-full object-contain"
      />
    </div>
    
    <!-- Navigation buttons -->
    <button 
      v-if="images.length > 1"
      @click="prevImage" 
      class="absolute left-2 md:left-6 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 focus:outline-none transition-opacity"
      aria-label="Previous image"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    
    <button 
      v-if="images.length > 1"
      @click="nextImage" 
      class="absolute right-2 md:right-6 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 focus:outline-none transition-opacity"
      aria-label="Next image"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
    
    <!-- Thumbnail navigation (for desktop) -->
    <div class="hidden md:flex absolute bottom-4 left-0 right-0 justify-center space-x-2 px-4">
      <button 
        v-for="(image, index) in images" 
        :key="index"
        @click="currentIndex = index"
        :class="[
          'h-16 w-16 border-2 transition-all',
          currentIndex === index ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
        ]"
      >
        <img :src="image" :alt="`Thumbnail ${index + 1}`" class="h-full w-full object-cover" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    required: true
  },
  initialIndex: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['close']);
const currentIndex = ref(props.initialIndex);

// Methods for navigation
const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // Loop back to the first image
  }
};

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.images.length - 1; // Loop to the last image
  }
};

// Keyboard navigation
const handleKeyDown = (e) => {
  if (e.key === 'ArrowRight') {
    nextImage();
  } else if (e.key === 'ArrowLeft') {
    prevImage();
  } else if (e.key === 'Escape') {
    emit('close');
  }
};

// Watch for changes to initialIndex prop
watch(() => props.initialIndex, (newIndex) => {
  currentIndex.value = newIndex;
});

// Add keyboard event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  
  // Prevent scrolling while slideshow is open
  document.body.style.overflow = 'hidden';
});

// Clean up event listeners
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  
  // Restore scrolling
  document.body.style.overflow = '';
});
</script>