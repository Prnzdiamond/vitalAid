<template>
  <div class="consultation-actions border-t border-gray-200">
    <!-- Rating section (collapsed by default) - Only for requester -->
    <div v-if="isRequester && isCompleted && !hasRated" class="rating-section py-2 px-4">
      <button 
        @click="showRatingForm = !showRatingForm" 
        class="w-full flex items-center justify-between bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span class="text-sm font-medium text-blue-800">Rate this consultation</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" :class="{'rotate-180': showRatingForm}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <!-- Expandable rating form -->
      <div v-if="showRatingForm" class="mt-2 bg-white p-3 rounded-lg border border-blue-100 animate-fade-in">
        <div class="star-rating flex mb-2 justify-center">
          <button
            v-for="star in 5"
            :key="star"
            @click="selectRating(star)"
            class="text-2xl focus:outline-none mx-1 transition-transform"
            :class="star <= rating ? 'text-yellow-500' : 'text-gray-300'"
          >
            ★
          </button>
        </div>
        
        <div class="mb-2">
          <textarea
            v-model="ratingComment"
            class="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-sm"
            placeholder="Add a comment (optional)"
            rows="1"
          ></textarea>
        </div>
        
        <div class="flex justify-end">
          <button
            @click="submitRating"
            class="bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            :disabled="rating === 0"
          >
            Submit
          </button>
        </div>
      </div>
    </div>

    <!-- Horizontal layout for follow-up section - Available to both requester and accepter -->
    <div v-if="isCompleted && !followUpRequested" class="follow-up-section py-2 px-4">
      <button 
        @click="showFollowUpForm = !showFollowUpForm" 
        class="w-full flex items-center justify-between bg-green-50 p-2 rounded-lg hover:bg-green-100 transition-colors"
      >
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-sm font-medium text-green-800">Need a follow-up?</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" :class="{'rotate-180': showFollowUpForm}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <!-- Expandable follow-up form -->
      <div v-if="showFollowUpForm" class="mt-2 bg-white p-3 rounded-lg border border-green-100 animate-fade-in">
        <div class="mb-2">
          <textarea
            v-model="followUpReason"
            class="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-400 bg-white text-sm"
            placeholder="Briefly explain why you need a follow-up (optional)"
            rows="1"
          ></textarea>
        </div>
        
        <div class="flex justify-end">
          <button
            @click="submitFollowUpRequest"
            class="bg-green-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            Request Follow-up
          </button>
        </div>
      </div>
    </div>

    <!-- Compact follow-up pending notification -->
    <div v-if="followUpRequested" class="follow-up-pending py-2 px-4">
      <div class="flex items-center bg-blue-50 p-2 rounded-lg">
        <div class="bg-blue-100 p-1 rounded-full mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-blue-800 text-sm font-medium">Follow-up requested</p>
          <p v-if="props.consultation?.follow_up_reason" class="text-xs text-gray-600 truncate">
            "{{ props.consultation?.follow_up_reason }}"
          </p>
        </div>
      </div>
    </div>

    <!-- Compact rating display -->
    <div v-if="hasRated" class="rating-display py-2 px-4">
      <div class="flex items-center bg-gray-50 p-2 rounded-lg">
        <div class="mr-2">
          <p class="text-sm font-medium text-gray-700">
            {{ isRequester ? 'Your rating' : 'Patient\'s rating' }}:
          </p>
        </div>
        <div class="flex text-yellow-500">
          <span v-for="star in 5" :key="star" class="text-sm mx-0.5">
            <span v-if="star <= consultationRating">★</span>
            <span v-else class="text-gray-300">★</span>
          </span>
        </div>
        <button 
          v-if="consultationRatingComment" 
          @click="showRatingComment = !showRatingComment" 
          class="ml-auto text-blue-600 text-xs underline hover:no-underline"
        >
          {{ showRatingComment ? 'Hide comment' : 'Show comment' }}
        </button>
      </div>
      
      <!-- Expandable comment section -->
      <div v-if="showRatingComment && consultationRatingComment" class="mt-1 px-2 animate-fade-in">
        <p class="text-xs text-gray-700 italic bg-gray-50 p-2 rounded-lg">
          "{{ consultationRatingComment }}"
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useConsultationStore } from '@/stores/consultationStore';
import { useSwal } from '~/composables/useSwal';

const props = defineProps({
  consultation: {
    type: Object,
    required: true
  },
  isRequester: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});

const consultationStore = useConsultationStore();
const { swal } = useSwal();

// Rating and follow-up state
const rating = ref(0);
const ratingComment = ref('');
const followUpReason = ref('');

// UI state
const showRatingForm = ref(false);
const showFollowUpForm = ref(false);
const showRatingComment = ref(false);

// Watch for consultation changes
watch(() => props.consultation, (newConsultation) => {
  if (newConsultation?.rating) {
    rating.value = newConsultation.rating;
  }
  
  if (newConsultation?.rating_comment) {
    ratingComment.value = newConsultation.rating_comment;
  }
}, { deep: true, immediate: true });

// Computed properties
const hasRated = computed(() => {
  return props.consultation?.rating > 0;
});

const consultationRating = computed(() => {
  return props.consultation?.rating || 0;
});

const consultationRatingComment = computed(() => {
  return props.consultation?.rating_comment || '';
});

const followUpRequested = computed(() => {
  return props.consultation?.follow_up_requested || false;
});

// Initialize with existing rating if available
onMounted(() => {
  if (props.consultation?.rating) {
    rating.value = props.consultation.rating;
  }
  
  if (props.consultation?.rating_comment) {
    ratingComment.value = props.consultation.rating_comment;
  }
});

// Methods
const selectRating = (value) => {
  rating.value = value;
};

const submitRating = async () => {
  try {
    if (rating.value === 0) {
      swal.fire({
        icon: 'warning',
        title: 'Rating Required',
        text: 'Please select a rating before submitting.',
      });
      return;
    }

    await consultationStore.rateConsultation(props.consultation.id, rating.value, ratingComment.value);
    showRatingForm.value = false;
    
    swal.fire({
      icon: 'success',
      title: 'Thank You!',
      text: 'Your rating has been submitted successfully.',
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Failed to submit rating. Please try again.',
    });
  }
};

const submitFollowUpRequest = async () => {
  try {
    await consultationStore.requestFollowUp(props.consultation.id, followUpReason.value);
    showFollowUpForm.value = false;
    
    swal.fire({
      icon: 'success',
      title: 'Follow-up Requested',
      text: props.isRequester ? 
        'Your follow-up request has been submitted. A health expert will respond soon.' :
        'Your follow-up request has been submitted. The patient will be notified.',
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Failed to request follow-up. Please try again.',
    });
  }
};
</script>

<style scoped>
.consultation-actions {
  transition: all 0.3s ease;
}

.star-rating button {
  transition: all 0.2s ease;
}

.star-rating button:hover {
  transform: scale(1.1);
}

/* Animation for sections appearing */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .consultation-actions {
    padding: 0.5rem;
  }
  
  .star-rating button {
    font-size: 1.25rem;
  }
}
</style>