<template>
  <form @submit.prevent="handleSubmit" class="bg-white border border-green-200 p-6 rounded-lg shadow space-y-4">
    <div>
      <label class="block text-green-800 font-medium">Title</label>
      <input v-model="form.title" type="text" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required />
    </div>

    <div>
      <label class="block text-green-800 font-medium">Description</label>
      <textarea v-model="form.description" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required></textarea>
    </div>

    <div>
      <label class="block text-green-800 font-medium">Location</label>
      <input v-model="form.location" type="text" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required />
    </div>

    <div>
      <label class="block text-green-800 font-medium">Start Time</label>
      <input v-model="form.start_time_formatted" type="datetime-local" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required />
    </div>

    <div>
      <label class="block text-green-800 font-medium">End Time</label>
      <input v-model="form.end_time_formatted" type="datetime-local" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required />
    </div>

    <button type="submit" class="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700">
      {{ initialEvent ? 'Update Event' : 'Create Event' }}
    </button>
  </form>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useEventStore } from "@/stores/eventStore";
import { useToken } from "@/composables/useToken";
import { useRouter } from "vue-router";

const props = defineProps({
  initialEvent: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['event-submitted']);

const eventStore = useEventStore();
const token = useToken();
const router = useRouter();

const form = ref({
  title: "",
  description: "",
  location: "",
  start_time: "",
  end_time: "",
  start_time_formatted: "",
  end_time_formatted: "",
});

const formatDateTimeForInput = (dateTimeString) => {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

watch(
  () => props.initialEvent,
  (newInitialEvent) => {
    if (newInitialEvent) {
      form.value = {
        title: newInitialEvent.title || "",
        description: newInitialEvent.description || "",
        location: newInitialEvent.location || "",
        start_time: newInitialEvent.start_time || "",
        end_time: newInitialEvent.end_time || "",
        start_time_formatted: formatDateTimeForInput(newInitialEvent.start_time),
        end_time_formatted: formatDateTimeForInput(newInitialEvent.end_time),
      };
    } else {
      // Reset the form for creating a new event
      form.value = {
        title: "",
        description: "",
        location: "",
        start_time: "",
        end_time: "",
        start_time_formatted: "",
        end_time_formatted: "",
      };
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  if (!token.get()) {
    alert(`You must be logged in to ${props.initialEvent ? 'edit' : 'create'} an event.`);
    return;
  }

  try {
    const payload = {
      ...form.value,
      start_time: form.value.start_time_formatted ? new Date(form.value.start_time_formatted).toISOString() : null,
      end_time: form.value.end_time_formatted ? new Date(form.value.end_time_formatted).toISOString() : null,
    };
    delete payload.start_time_formatted;
    delete payload.end_time_formatted;

    if (props.initialEvent) {
      emit('event-submitted', payload);
    } else {
      await eventStore.createEvent(payload);
      alert("Event created successfully!");
      router.push("/event");
    }
  } catch (error) {
    console.error(`Failed to ${props.initialEvent ? 'update' : 'create'} event:`, error);
    alert(`Failed to ${props.initialEvent ? 'update' : 'create'} event.`);
  }
};
</script>