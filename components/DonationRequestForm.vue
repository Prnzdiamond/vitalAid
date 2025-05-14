<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block font-semibold">Title</label>
      <input v-model="form.title" type="text" class="w-full border p-2 rounded" required placeholder="Enter donation title" />
    </div>

    <div>
      <label class="block font-semibold">Category</label>
      <input v-model="form.category" type="text" class="w-full border p-2 rounded" required placeholder="e.g., Medical, Education" />
    </div>

    <div>
      <label class="block font-semibold">Description</label>
      <textarea v-model="form.description" class="w-full border p-2 rounded min-h-[100px]" rows="4" required placeholder="Describe the purpose of this donation request"></textarea>
    </div>

    <div>
      <label class="block font-semibold">Amount Needed (₦)</label>
      <input v-model.number="form.amount_needed" type="number" min="0" step="0.01" class="w-full border p-2 rounded" required placeholder="Enter amount needed" />
    </div>

    <div>
      <label class="block font-semibold">Cover Image</label>
      <div class="border-2 border-dashed rounded-lg p-4 relative">
        <div v-if="form.banner_url" class="relative">
          <img :src="form.banner_url" alt="Cover" class="w-full h-48 object-cover rounded-lg" />
          <button type="button" class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600" @click="clearBannerImage">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-else class="flex flex-col items-center justify-center h-48">
          <label for="banner-upload" class="cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-gray-400 mb-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 9 9 0 1018-3.75m-8.185 8.175c.895 1.286 2.105 2.286 3.57 2.286h.75M5.25 12h13.5" />
            </svg>
            <p class="text-sm text-gray-500 mb-2">Upload Cover Image</p>
            <input type="file" id="banner-upload" accept="image/*" class="hidden" @change="handleBannerUpload" />
            <span class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Choose File</span>
          </label>
        </div>
      </div>
    </div>

    <div>
      <label class="block font-semibold">Other Images (Optional)</label>
      <div class="border-2 border-dashed rounded-lg p-4">
        <div v-if="form.other_images && form.other_images.length > 0" class="flex space-x-2 mb-2">
          <div v-for="(imgUrl, index) in form.other_images" :key="index" class="relative w-24 h-24 rounded-md overflow-hidden">
            <img :src="imgUrl" alt="Other Image" class="w-full h-full object-cover" />
            <button type="button" class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 -mr-1 -mt-1" @click="removeOtherImage(index)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <label for="other-images-upload" class="cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-400 mb-1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 9 9 0 1018-3.75m-8.185 8.175c.895 1.286 2.105 2.286 3.57 2.286h.75M5.25 12h13.5" />
          </svg>
          <p class="text-sm text-gray-500">Upload Other Images</p>
          <input type="file" id="other-images-upload" accept="image/*" class="hidden" multiple @change="handleOtherImagesUpload" />
          <span class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Choose Files</span>
        </label>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <input v-model="form.is_urgent" type="checkbox" class="w-4 h-4" id="is_urgent" :true-value="true" :false-value="false" />
      <label for="is_urgent" class="block font-semibold">Mark as Urgent</label>
    </div>

    <div class="flex justify-end gap-2 pt-4">
      <button type="button" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" @click="handleCancel">
        Cancel
      </button>
      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        {{ isEdit ? "Update Request" : "Create Request" }}
      </button>
    </div>

    <input type="hidden" v-model="form.org_id" />
  </form>
</template>

<script setup>
import { reactive, toRefs, watchEffect, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useSwal } from "@/composables/useSwal"; // Import useSwal

const emit = defineEmits(["submit", "cancel"]);
const route = useRouter();
const { swal } = useSwal(); // Destructure swal
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      org_id: null,
      title: "",
      description: "",
      amount_needed: 0,
      banner_url: null,
      other_images: [],
      category: "",
      is_urgent: false,
    }),
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const form = reactive({ ...props.initialData });
const bannerFile = ref(null);
const otherImageFiles = ref([]);

watch(() => props.initialData, (newData) => {
  Object.assign(form, newData);
  bannerFile.value = null;
  otherImageFiles.value = [];
}, { immediate: true });

const handleBannerUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    bannerFile.value = file;
    const reader = new FileReader();
    reader.onloadend = () => {
      form.banner_url = reader.result; // For preview
    };
    reader.readAsDataURL(file);
  } else {
    bannerFile.value = null;
  }
};

const clearBannerImage = () => {
  swal.fire({
    title: 'Are you sure?',
    text: "Are you sure you want to remove the banner image?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, remove it!',
  }).then((result) => {
    if (result.isConfirmed) {
      form.banner_url = null;
      bannerFile.value = null;
      swal.fire(
        'Removed!',
        'The banner image has been removed.',
        'success'
      );
    }
  });
};

const handleOtherImagesUpload = (event) => {
  const files = event.target.files;
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      otherImageFiles.value.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        form.other_images.push(reader.result); // For preview
      };
      reader.readAsDataURL(file);
    }
  }
};

const removeOtherImage = (index) => {
  swal.fire({
    title: 'Are you sure?',
    text: "Are you sure you want to remove this image?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, remove it!',
  }).then((result) => {
    if (result.isConfirmed) {
      form.other_images.splice(index, 1);
      otherImageFiles.value.splice(index, 1); // Keep the file list in sync
      swal.fire(
        'Removed!',
        'The image has been removed.',
        'success'
      );
    }
  });
};

function handleSubmit() {
  const payload = { ...form };
  console.log("bannerFile.value in handleSubmit:", bannerFile.value);
  if (bannerFile.value) {
    payload.bannerFile = bannerFile.value;
    delete payload.banner_url;
  }
  if (otherImageFiles.value.length > 0) {
    payload.otherImageFiles = otherImageFiles.value;
    delete payload.other_images; // Remove base64 previews
  }
  payload.is_urgent = payload.is_urgent === true; // Strictly ensure boolean true or false
  emit("submit", payload);
}

function handleCancel() {
  swal.fire({
    title: 'Are you sure?',
    text: "Are you sure you want to cancel?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, cancel!',
  }).then((result) => {
    if (result.isConfirmed) {
      route.back();
      emit("cancel");
    }
  });
}
</script>