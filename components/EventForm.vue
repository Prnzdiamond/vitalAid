<template>
  <form @submit.prevent="submitEvent" class="bg-white border border-green-200 p-6 rounded-lg shadow space-y-4">
    <div>
      <label class="block text-green-800 font-medium">Title</label>
      <input v-model="event.title" type="text" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required />
    </div>

    <div>
      <label class="block text-green-800 font-medium">Description</label>
      <textarea v-model="event.description" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required></textarea>
    </div>

    <div>
      <label class="block text-green-800 font-medium">Location</label>
      <input v-model="event.location" type="text" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required />
    </div>

    <div>
      <label class="block text-green-800 font-medium">Start Time</label>
      <input v-model="event.start_time" type="datetime-local" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required />
    </div>

    <div>
      <label class="block text-green-800 font-medium">End Time</label>
      <input v-model="event.end_time" type="datetime-local" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required />
    </div>

    <button type="submit" class="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700">
      Create Event
    </button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useEventStore } from "@/stores/eventStore";
import { useToken } from "@/composables/useToken";
import { useRouter } from "vue-router";

const eventStore = useEventStore();
const token = useToken();
const router = useRouter();

const event = ref({
  title: "",
  description: "",
  location: "",
  start_time: "",
  end_time: "",
});

const submitEvent = async () => {
  if (!token.get()) {
    alert("You must be logged in to create an event.");
    return;
  }

  try {
    await eventStore.createEvent(event.value);
    alert("Event created successfully!");
    router.push("/event");
  } catch (error) {
    console.log(error)
    alert("Failed to create event.");
  }
};
</script>
