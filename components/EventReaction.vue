<template>
  <div class="event-reactions">
    <!-- Reaction Summary Section -->
    <div class="reaction-summary bg-gray-50 p-4 rounded-lg mb-4">
      <h3 class="text-lg font-semibold mb-2">Event Feedback</h3>
      
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
      
      <div v-else-if="summary" class="flex items-center gap-4">
        <div class="flex items-center">
          <span class="text-green-500 mr-2">👍</span>
          <span class="font-medium">{{ summary.likes_count }}</span>
        </div>
        <div class="flex items-center">
          <span class="text-red-500 mr-2">👎</span>
          <span class="font-medium">{{ summary.dislikes_count }}</span>
        </div>
        <div class="text-sm text-gray-500">
          {{ summary.total_reactions }} total reactions
        </div>
      </div>
      
      <div v-else class="text-gray-500 py-2">
        No reactions yet
      </div>
    </div>
    
    <!-- User's Reaction Form (only for completed events) -->
    <div v-if="event && event.status === 'completed'" class="my-reaction bg-white p-4 rounded-lg border mb-6">
      <h3 class="text-lg font-semibold mb-3">Your Feedback</h3>
      
      <div v-if="userHasReacted" class="mb-4">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-sm text-gray-500">Your reaction:</span>
          <span v-if="userReaction.reaction_type === 'like'" class="text-green-500">👍 Like</span>
          <span v-else class="text-red-500">👎 Dislike</span>
        </div>
        
        <p v-if="userReaction.comment" class="text-gray-700 bg-gray-50 p-3 rounded mb-3">
          {{ userReaction.comment }}
        </p>
        
        <div class="flex gap-2">
          <button 
            @click="editMode = true" 
            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
          >
            <i class="fas fa-edit mr-1"></i> Edit
          </button>
          <button 
            @click="handleDeleteReaction" 
            class="px-3 py-1 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded transition"
          >
            <i class="fas fa-trash-alt mr-1"></i> Delete
          </button>
        </div>
      </div>
      
      <form v-else-if="editMode || !userHasReacted" @submit.prevent="handleSubmitReaction" class="reaction-form">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Your reaction</label>
          <div class="flex gap-3">
            <button 
              type="button"
              @click="reactionForm.reaction_type = 'like'"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-md border transition',
                reactionForm.reaction_type === 'like' 
                  ? 'bg-green-50 border-green-300 text-green-700' 
                  : 'bg-white hover:bg-gray-50'
              ]"
            >
              <i class="fas fa-thumbs-up"></i> Like
            </button>
            <button 
              type="button"
              @click="reactionForm.reaction_type = 'dislike'"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-md border transition',
                reactionForm.reaction_type === 'dislike' 
                  ? 'bg-red-50 border-red-300 text-red-700' 
                  : 'bg-white hover:bg-gray-50'
              ]"
            >
              <i class="fas fa-thumbs-down"></i> Dislike
            </button>
          </div>
        </div>
        
        <div class="mb-4">
          <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
          <textarea
            id="comment"
            v-model="reactionForm.comment"
            rows="3"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Share your thoughts about this event..."
          ></textarea>
        </div>
        
        <div class="flex gap-2">
          <button 
            type="submit" 
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            :disabled="!reactionForm.reaction_type || submitting"
          >
            <span v-if="submitting"><i class="fas fa-spinner fa-spin mr-1"></i> Submitting...</span>
            <span v-else><i class="fas fa-paper-plane mr-1"></i> {{ editMode ? 'Update Feedback' : 'Submit Feedback' }}</span>
          </button>
          
          <button 
            v-if="editMode"
            type="button" 
            @click="cancelEdit" 
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            <i class="fas fa-times mr-1"></i> Cancel
          </button>
        </div>
      </form>
      
      <div v-if="error" class="mt-3 text-red-600 text-sm">
        <i class="fas fa-exclamation-circle mr-1"></i> {{ error }}
      </div>
    </div>
    
    <!-- All Reactions List -->
    <div class="all-reactions">
      <h3 class="text-lg font-semibold mb-3">All Feedback</h3>
      
      <div v-if="loadingReactions" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
      
      <!-- Scrollable feedback container with fixed height -->
      <div v-else-if="reactions && reactions.length > 0" class="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        <div class="space-y-4">
          <div v-for="reaction in reactions" :key="reaction.id" class="bg-white p-4 rounded-lg border">
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                <i class="fas fa-user-circle text-gray-400"></i>
                <span class="font-medium">{{ reaction.user_name }}</span>
                <span 
                  :class="reaction.reaction_type === 'like' ? 'text-green-500' : 'text-red-500'"
                >
                  <i :class="reaction.reaction_type === 'like' ? 'fas fa-thumbs-up' : 'fas fa-thumbs-down'"></i>
                </span>
              </div>
              <span class="text-xs text-gray-500">
                <i class="far fa-clock mr-1"></i> {{ formatDate(reaction.created_at) }}
              </span>
            </div>
            
            <p v-if="reaction.comment" class="text-gray-700">
              {{ reaction.comment }}
            </p>
          </div>
        </div>
      </div>
      
      <div v-else class="text-gray-500 py-4 text-center bg-gray-50 rounded-lg">
        <i class="fas fa-comment-slash mr-1"></i> No feedback has been shared yet
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useEventStore } from '~/stores/eventStore';
import { useAuthStore } from '~/stores/authStore';

const props = defineProps({
  eventId: {
    type: String,
    required: true
  },
  event: {
    type: Object,
    default: null
  }
});

const eventStore = useEventStore();
const authStore = useAuthStore();

// State
const loading = ref(true);
const loadingReactions = ref(true);
const submitting = ref(false);
const error = ref(null);
const editMode = ref(false);
const summary = ref(null);
const reactions = ref([]);
const reactionForm = ref({
  reaction_type: null,
  comment: ''
});

const loadingSpinner = ref(false);

// Computed
const userHasReacted = computed(() => {
  if (!reactions.value || !authStore.user) return false;
  return reactions.value.some(r => r.user_id === authStore.user.id);
});

const userReaction = computed(() => {
  if (!reactions.value || !authStore.user) return null;
  return reactions.value.find(r => r.user_id === authStore.user.id);
});

// Methods
const loadData = async () => {
  try {
    loading.value = true;
    loadingReactions.value = true;
    error.value = null;
    loadingSpinner.value = true;
    
    // Fetch reaction summary
    const summaryData = await eventStore.fetchReactionSummary(props.eventId);
    summary.value = summaryData;
    
    // Fetch all reactions
    const reactionsData = await eventStore.fetchEventReactions(props.eventId);
    if (reactionsData && reactionsData.reactions) {
      reactions.value = reactionsData.reactions;
    }
    
    // If user has already reacted, pre-fill the form
    if (userHasReacted.value) {
      reactionForm.value.reaction_type = userReaction.value.reaction_type;
      reactionForm.value.comment = userReaction.value.comment || '';
    }
  } catch (err) {
    error.value = 'Failed to load reactions. Please try again.';
    console.error('Error loading reactions:', err);
  } finally {
    loading.value = false;
    loadingReactions.value = false;
    loadingSpinner.value = false;
  }
};

const handleSubmitReaction = async () => {
  if (!reactionForm.value.reaction_type) {
    error.value = 'Please select a reaction type';
    return;
  }
  
  try {
    submitting.value = true;
    error.value = null;
    
    await eventStore.addReaction(props.eventId, {
      reaction_type: reactionForm.value.reaction_type,
      comment: reactionForm.value.comment
    });
    
    // Reload data after submission
    await loadData();
    
    // Reset form and exit edit mode
    editMode.value = false;
  } catch (err) {
    error.value = err.message || 'Failed to submit reaction. Please try again.';
    console.error('Error submitting reaction:', err);
  } finally {
    submitting.value = false;
  }
};

const handleDeleteReaction = async () => {
  if (!confirm('Are you sure you want to delete your feedback?')) return;
  
  try {
    submitting.value = true;
    error.value = null;
    
    await eventStore.deleteReaction(props.eventId);
    
    // Reload data after deletion
    await loadData();
    
    // Reset form
    reactionForm.value.reaction_type = null;
    reactionForm.value.comment = '';
  } catch (err) {
    error.value = 'Failed to delete reaction. Please try again.';
    console.error('Error deleting reaction:', err);
  } finally {
    submitting.value = false;
  }
};

const cancelEdit = () => {
  editMode.value = false;
  
  // Reset form to current reaction if user has one
  if (userHasReacted.value) {
    reactionForm.value.reaction_type = userReaction.value.reaction_type;
    reactionForm.value.comment = userReaction.value.comment || '';
  } else {
    reactionForm.value.reaction_type = null;
    reactionForm.value.comment = '';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Watch for changes in eventId
watch(() => props.eventId, (newId) => {
  if (newId) {
    loadData();
  }
});

// Load data on mount
onMounted(() => {
  if (props.eventId) {
    loadData();
  }
});
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}
</style>