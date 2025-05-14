<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-6">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-gray-500 text-sm font-medium mb-1">{{ title }}</h3>
          <div class="text-3xl font-semibold text-gray-800">{{ value }}</div>
          <div class="flex items-center mt-1">
            <component :is="icon" v-if="icon" class="h-4 w-4 text-green-600 mr-1" />
            <span class="text-sm text-gray-500">{{ info }}</span>
          </div>
        </div>
        <div v-if="iconComponent" class="bg-green-100 p-3 rounded-lg">
          <component :is="iconComponent" class="h-6 w-6 text-green-600" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  BadgeCheck, 
  Calendar, 
  Clock, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Users 
} from 'lucide-vue-next';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  info: {
    type: String,
    default: ''
  }
});

const iconComponent = computed(() => {
  switch (props.icon) {
    case 'BadgeCheck':
      return BadgeCheck;
    case 'Calendar':
      return Calendar;
    case 'Clock':
      return Clock;
    case 'Heart':
      return Heart;
    case 'MessageCircle':
      return MessageCircle;
    case 'TrendingUp':
      return TrendingUp;
    case 'Users':
      return Users;
    default:
      return null;
  }
});
</script>