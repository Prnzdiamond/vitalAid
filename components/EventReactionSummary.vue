<template>
  <div class="event-reaction-summary">
    <div v-if="loading" class="flex items-center gap-1 text-gray-400">
      <span class="text-xs">Loading reactions...</span>
    </div>
    
    <div v-if="!loading && summary" class="flex items-center gap-3">
      <div class="flex items-center" title="Likes">
        <span class="text-green-500 mr-1">👍</span>
        <span class="text-sm font-medium">{{ summary.likes_count }}</span>
      </div>
      
      <div class="flex items-center" title="Dislikes">
        <span class="text-red-500 mr-1">👎</span>
        <span class="text-sm font-medium">{{ summary.dislikes_count }}</span>
      </div>
      
      <div v-if="summary.comments_count > 0" class="flex items-center" title="Comments">
        <span class="text-gray-500 mr-1">💬</span>
        <span class="text-sm font-medium">{{ summary.comments_count }}</span>
      </div>
    </div>
    
    <div v-else-if="!loading && !summary" class="text-xs text-gray-400">
      No reactions yet
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useEventStore } from '~/stores/eventStore';

const props = defineProps({
  eventId: {
    type: String,
    required: true
  }
});

const eventStore = useEventStore();
const loading = ref(true);
const summary = ref(null);

const loadSummary = async () => {
  try {
    loading.value = true;
    const data = await eventStore.fetchReactionSummary(props.eventId);
    summary.value = data;
  } catch (error) {
    console.error('Error loading reaction summary:', error);
  } finally {
    loading.value = false;
  }
};

// Watch for changes in eventId
watch(() => props.eventId, (newId) => {
  if (newId) {
    loadSummary();
  }
});

// Load data on mount
onMounted(() => {
  if (props.eventId) {
    loadSummary();
  }
});
</script>