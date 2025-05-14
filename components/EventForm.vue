<template>
  <form @submit.prevent="handleSubmit" class="bg-white border border-gray-200 p-6 rounded-lg shadow space-y-4">
    <div>
      <label class="block text-green-800 font-medium mb-1">Event Banner</label>
      <div 
        @click="$refs.fileInput.click()" 
        class="border-2 border-dashed rounded-lg p-4 relative bg-gray-100 text-gray-500 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div v-if="previewImage || form.banner_url" class="w-full h-32 mb-2">
          <img 
            :src="previewImage || form.banner_url" 
            class="w-full h-full object-cover rounded" 
            alt="Event banner preview"
          />
        </div>
        <div v-else>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mb-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.35-.537m-1.35-1.013A5.25 5.25 0 014 15V13m0-1.5a5.25 5.25 0 011.35-1.013m1.35-.537A4.5 4.5 0 018 6.75V8.5m0 0l-3-3m3 3l3-3m1.5-3a4.5 4.5 0 011.35.537m1.35 1.013A5.25 5.25 0 0120 9v2m0 1.5a5.25 5.25 0 01-1.35 1.013m-1.35.537A4.5 4.5 0 0116 17.25V15.5m0 0l3 3m-3-3l-3 3" />
          </svg>
          <p class="text-sm font-medium">Click to upload banner image</p>
          <p class="text-xs text-gray-400">Supports JPG, PNG (max 2MB)</p>
        </div>
        <input 
          ref="fileInput" 
          type="file" 
          class="hidden" 
          accept="image/jpeg,image/png" 
          @change="handleFileUpload"
        />
      </div>
      <p v-if="fileError" class="text-red-500 text-sm mt-1">{{ fileError }}</p>
    </div>

    <!-- Rest of the form remains the same -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-green-800 font-medium mb-1">Category</label>
        <select v-model="form.category" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="environment">Environment</option>
          <option value="community">Community</option>
          <option value="education">Education</option>
          <option value="healthcare">Healthcare</option>
          <option value="animal-welfare">Animal Welfare</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label class="block text-green-800 font-medium mb-1">Capacity</label>
        <input v-model="form.capacity" type="number" min="1" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Maximum number of volunteers" />
      </div>
    </div>

    <div>
      <label class="block text-green-800 font-medium mb-1">Title</label>
      <input v-model="form.title" type="text" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required placeholder="Enter event title" />
    </div>

    <div>
      <label class="block text-green-800 font-medium mb-1">Description</label>
      <textarea 
        v-model="form.description" 
        class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" 
        rows="4" 
        required 
        placeholder="Describe your event and what volunteers will be doing"
      ></textarea>
    </div>

    <div>
      <label class="block text-green-800 font-medium mb-1">Location</label>
      <input v-model="form.location" type="text" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required placeholder="Enter event location" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-green-800 font-medium mb-1">Start Time</label>
        <input v-model="form.start_time_formatted" type="datetime-local" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required />
      </div>

      <div>
        <label class="block text-green-800 font-medium mb-1">End Time</label>
        <input v-model="form.end_time_formatted" type="datetime-local" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" required />
      </div>
    </div>

    <div>
      <label class="block text-green-800 font-medium mb-1">Contact Information</label>
      <input v-model="form.contact_info" type="text" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Phone number or email for inquiries" />
    </div>

    <div class="bg-green-50 p-4 rounded-lg mt-2">
      <h3 class="text-green-800 font-medium mb-2">Event Details</h3>
      <div class="space-y-2">
        <div class="flex items-center">
          <input v-model="form.requires_verification" type="checkbox" id="requires_verification" class="mr-2 h-4 w-4 text-green-600 focus:ring-green-500" />
          <label for="requires_verification" class="text-gray-700">Requires verification from organizer</label>
        </div>
        
        <div class="flex items-center">
          <input v-model="form.provides_certificate" type="checkbox" id="provides_certificate" class="mr-2 h-4 w-4 text-green-600 focus:ring-green-500" />
          <label for="provides_certificate" class="text-gray-700">Provides volunteer certificate</label>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-4">
      <button type="button" class="py-2 px-4 border border-gray-300 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300" @click="handleCancel">
        Cancel
      </button>
      <button type="submit" class="py-2 px-6 bg-green-600 text-white rounded hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500">
        {{ initialEvent ? 'Update Event' : 'Create Event' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useEventStore } from "@/stores/eventStore";
import { useToken } from "@/composables/useToken";
import { useRouter } from "vue-router";
import { useSwal } from "@/composables/useSwal"; // Import useSwal

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
const { swal } = useSwal(); // Destructure swal
const fileInput = ref(null);
const previewImage = ref(null);
const fileError = ref(null);
const uploadFile = ref(null);

const form = ref({
  title: "",
  description: "",
  location: "",
  category: "community",
  capacity: 10,
  contact_info: "",
  requires_verification: false,
  provides_certificate: false,
  start_time: "",
  end_time: "",
  start_time_formatted: "",
  end_time_formatted: "",
  banner_url: "", // For storing the URL of the banner image
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
        category: newInitialEvent.category || "community",
        capacity: newInitialEvent.capacity || 10,
        contact_info: newInitialEvent.contact_info || "",
        requires_verification: newInitialEvent.requires_verification || false,
        provides_certificate: newInitialEvent.provides_certificate || false,
        start_time: newInitialEvent.start_time || "",
        end_time: newInitialEvent.end_time || "",
        start_time_formatted: formatDateTimeForInput(newInitialEvent.start_time),
        end_time_formatted: formatDateTimeForInput(newInitialEvent.end_time),
        banner_url: newInitialEvent.banner_url || "", // Include the banner URL
      };
    } else {
      // Reset the form for creating a new event
      form.value = {
        title: "",
        description: "",
        location: "",
        category: "community",
        capacity: 10,
        contact_info: "",
        requires_verification: false,
        provides_certificate: false,
        start_time: "",
        end_time: "",
        start_time_formatted: "",
        end_time_formatted: "",
        banner_url: "",
      };
      previewImage.value = null;
      uploadFile.value = null;
    }
  },
  { immediate: true }
);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  fileError.value = null;

  if (!file) return;

  // Check file type
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    fileError.value = "Please upload a JPEG or PNG image.";
    return;
  }

  // Check file size (2MB limit)
  if (file.size > 2 * 1024 * 1024) {
    fileError.value = "File size must be less than 2MB.";
    return;
  }

  // Set the file for upload
  uploadFile.value = file;

  // Create preview URL
  previewImage.value = URL.createObjectURL(file);
};

const handleSubmit = async () => {
  if (!token.get()) {
    swal.fire({
      icon: 'warning',
      title: 'Unauthorized',
      text: `You must be logged in to ${props.initialEvent ? 'edit' : 'create'} an event.`,
    });
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

    const formData = new FormData();

    if (uploadFile.value) {
      formData.append('banner_image', uploadFile.value);
    }

    // Append other form fields directly
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('location', payload.location);
    formData.append('start_time', payload.start_time);
    formData.append('end_time', payload.end_time);
    formData.append('category', payload.category);
    formData.append('capacity', payload.capacity);
    formData.append('contact_info', payload.contact_info);
    formData.append('requires_verification', payload.requires_verification ? 1 : 0);
    formData.append('provides_certificate', payload.provides_certificate ? 1 : 0);

    console.log('Form Data being sent:', formData); // Inspect FormData

    if (props.initialEvent) {
      await eventStore.updateEvent(props.initialEvent.id, formData);
      emit('event-submitted', payload);
      swal.fire({
        icon: 'success',
        title: 'Event Updated',
        text: 'Event updated successfully!',
      });
    } else {
      await eventStore.createEvent(formData);
      swal.fire({
        icon: 'success',
        title: 'Event Created',
        text: 'Event created successfully!',
      }).then(() => {
        router.push("/events");
      });
    }
  } catch (error) {
    console.error(`Failed to ${props.initialEvent ? 'update' : 'create'} event:`, error);
    swal.fire({
      icon: 'error',
      title: 'Action Failed',
      text: `Failed to ${props.initialEvent ? 'update' : 'create'} event.`,
    });
  }
};


const handleCancel = () => router.back();
</script>