<template>
  <div class="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-white py-8 px-4">
    <div class="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

      <div class="md:col-span-1">
        <div class="flex flex-col items-center pt-6">
          <div class="relative w-24 h-24 rounded-full bg-gray-300 overflow-hidden border-4 border-white mb-4">
            <img v-if="user && user.profile_picture" :src="user.profile_picture" alt="Profile Picture" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-xl font-semibold text-gray-600">{{ user ? user.first_name.charAt(0) : '?' }}</div>
          </div>
          <h2 v-if="user" class="text-xl font-semibold text-green-600 mb-1">{{ user.first_name }} {{ user.last_name }}</h2>
          <p v-if="user && user._tag" class="text-sm text-gray-600 mb-4">{{ user._tag }}</p>
          <p v-if="user && user.email" class="text-xs text-gray-400 mb-4">Member since {{ formatDate(user.created_at) }}</p>
          <button class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition w-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2 inline-block">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125m-6.234 1.343l-4.746 4.746m1.088-1.088l4.746-4.746m-5.525 5.525l4.743-4.743" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      <div class="md:col-span-2">
        <div class="border-b border-gray-300">
          <nav class="-mb-px flex space-x-4">
            <button
              @click="activeTab = 'donations'"
              :class="{'border-b-2 border-green-600 text-green-600': activeTab === 'donations', 'text-gray-700': activeTab !== 'donations'}"
              class="py-2 px-4 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2 inline-block">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Donations
            </button>
            <button
              @click="activeTab = 'consultations-main'"
              :class="{'border-b-2 border-green-600 text-green-600': activeTab.startsWith('consultations'), 'text-gray-700': !activeTab.startsWith('consultations')}"
              class="py-2 px-4 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2 inline-block">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Consultations
            </button>
            <button
              @click="activeTab = 'events'"
              :class="{'border-b-2 border-green-600 text-green-600': activeTab === 'events', 'text-gray-700': activeTab !== 'events'}"
              class="py-2 px-4 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2 inline-block">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m-3 3V9m9 3v3m-3-3h6m-6 3H9" />
              </svg>
              Events
            </button>
            <button
              @click="activeTab = 'details'"
              :class="{'border-b-2 border-green-600 text-green-600': activeTab === 'details', 'text-gray-700': activeTab !== 'details'}"
              class="py-2 px-4 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2 inline-block">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.125h15.003m-15.003-5.5c0-1.389.896-2.62 2.25-2.922l2.436-.812C11.322 10.126 12.678 10.126 13.926 9.29l2.436.812c1.354.302 2.25 1.533 2.25 2.922v5.5m-15.003-5.5H21.75" />
              </svg>
              Details
            </button>
          </nav>
        </div>

        <div class="mt-2">
          <div v-if="activeTab === 'donations'">
            <h3 class="text-xl font-semibold text-green-600 mb-4">Your Donations</h3>
            <div v-if="userDonations.length" class="relative w-full overflow-auto">
              <table class="w-full caption-bottom text-sm">
                <thead class="[&_tr]:border-b">
                  <tr>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Donation</th>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Date</th>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Amount</th>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="[&_tr:last-child]:border-0">
                  <tr v-for="donation in userDonations" :key="donation.id" class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{{ donation.charityName }}</td>
                    <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{{ formatDate(donation.date) }}</td>
                    <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">${{ donation.amount }}</td>
                    <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      <span :class="`inline-flex items-center px-2 py-1 rounded-full text-xs ${donation.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`">
                        {{ donation.status }}
                      </span>
                    </td>
                    <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
                      <button class="text-blue-500 hover:underline text-sm">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="mt-4">
              <p class="text-gray-500">No donations made yet.</p>
            </div>
            <button class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition mt-4">Create New Donation</button>
          </div>

          <div v-if="activeTab === 'consultations-main'">
            <div class="border-b border-gray-300">
              <nav class="-mb-px flex space-x-4">
                <button
                  @click="consultationTab = 'requested'"
                  :class="{'border-b-2 border-green-600 text-green-600': consultationTab === 'requested', 'text-gray-700': consultationTab !== 'requested'}"
                  class="py-2 px-4 focus:outline-none"
                >
                  Requested
                </button>
                <button
                  v-if="user && user.role === 'health_expert'"
                  @click="consultationTab = 'accepted'"
                  :class="{'border-b-2 border-green-600 text-green-600': consultationTab === 'accepted', 'text-gray-700': consultationTab !== 'accepted'}"
                  class="py-2 px-4 focus:outline-none"
                >
                  Accepted
                </button>
              </nav>
            </div>

            <div class="mt-2">
              <div v-if="consultationTab === 'requested'">
                <h4 class="text-lg font-semibold text-gray-700 mb-2">Requested Consultations</h4>
                <div v-if="requestedConsultations.length > 0" class="relative w-full overflow-auto">
                  <table class="w-full caption-bottom text-sm">
                    <thead class="[&_tr]:border-b">
                      <tr>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Doctor ID</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Date</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
                      </tr>
                    </thead>
                    <tbody class="[&_tr:last-child]:border-0">
                      <tr v-for="consultation in requestedConsultations.slice(0, 5)" :key="consultation.id" class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{{ consultation.doctor_tag ?? "AI" }}</td>
                        <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{{ formatDate(consultation.date) }}</td>
                        <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{{ consultation.status }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <button v-if="requestedConsultations.length > 5" class="text-blue-500 hover:underline text-sm mt-2">Show More</button>
                </div>
                <div v-else class="mt-2">
                  <p class="text-gray-500">No requested consultations.</p>
                </div>
              </div>

              <div v-if="consultationTab === 'accepted' && user && user.role == 'health_expert'">
                <h4 class="text-lg font-semibold text-gray-700 mb-2">Accepted Consultations</h4>
                <div v-if="acceptedConsultations.length > 0" class="relative w-full overflow-auto">
                  <table class="w-full caption-bottom text-sm">
                    <thead class="[&_tr]:border-b">
                      <tr>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">User ID</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Date</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
                      </tr>
                    </thead>
                    <tbody class="[&_tr:last-child]:border-0">
                      <tr v-for="consultation in acceptedConsultations.slice(0, 5)" :key="consultation.id" class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{{ consultation.user_tag }}</td>
                        <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{{ formatDate(consultation.date) }}</td>
                        <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{{ consultation.status }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <button v-if="acceptedConsultations.length > 5" class="text-blue-500 hover:underline text-sm mt-2">Show More</button>
                </div>
                <div v-else class="mt-2">
                  <p class="text-gray-500">No accepted consultations yet.</p>
                </div>
              </div>
            </div>
            <button class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition mt-4">Book New Consultation</button>
          </div>

          <div v-if="activeTab === 'events'">
            <h3 class="text-xl font-semibold text-green-600 mb-4">Your Events</h3>
            <div v-if="/* your events data exists */ false" class="relative w-full overflow-auto">
              <table class="w-full caption-bottom text-sm">
                <thead class="[&_tr]:border-b">
                  <tr>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Event</th>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Date</th>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Role</th>
                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="[&_tr:last-child]:border-0">
                  <tr v-for="event in /* your events data */ []" :key="event.id" class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{{ event.title }}</td>
                    <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{{ formatDate(event.date) }}</td>
                    <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      <span :class="`inline-flex items-center px-2 py-1 rounded-full text-xs ${event.status === 'Attended' ? 'bg-gray-100 text-gray-800' : event.status === 'Created' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`">
                        {{ event.status }}
                      </span>
                    </td>
                    <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">{{ event.role }}</td>
                    <td class="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
                      <button class="text-blue-500 hover:underline text-sm">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="mt-4">
              <p class="text-gray-500">No events available.</p>
            </div>
            <button class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition mt-4">Explore Events</button>
          </div>

          <div v-if="activeTab === 'details'">
            <h3 class="text-xl font-semibold text-green-600 mb-4">Profile Details</h3>
            <div v-if="user" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-500">Full Name</h4>
                  <p class="text-gray-700">{{ user.first_name }} {{ user.last_name }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-500">Email</h4>
                  <p class="text-gray-700">{{ user.email }}</p>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-500">Role</h4>
                  <p class="text-gray-700">{{ user.role }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-500">Member Since</h4>
                  <p class="text-gray-700">{{ formatDate(user.created_at) }}</p>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-500">Bio</h4>
                <p class="text-gray-700">{{ user.bio || 'No bio available.' }}</p>
              </div>
            </div>
            <div v-else class="mt-4">
              <p class="text-gray-500">Loading user details...</p>
            </div>
            <button class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition mt-6">Edit Profile</button>
          </div>
        </div>
      </div>

      <div class="md:col-span-3 flex justify-end mt-8">
        <button @click="logout" class="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 inline-block">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/authStore';
import { useConsultationStore } from '~/stores/consultationStore';
import { useDonationStore } from '~/stores/donationStore';
import { useRouter } from 'vue-router';
import { useSwal } from '~/composables/useSwal'; // Assuming this is the correct path

const authStore = useAuthStore();
const consultationStore = useConsultationStore();
const donationStore = useDonationStore();
const router = useRouter();
const { swal } = useSwal();

const user = ref(authStore.user);
const activeTab = ref('donations'); // Default tab
const consultationTab = ref('requested'); // Default consultation sub-tab
const userDonations = ref([]);
const requestedConsultations = ref([]);
const acceptedConsultations = ref([]);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const fetchProfileData = async () => {
  if (user.value && user.value.id) {
    try {
      const donationsData = await donationStore.fetchUserDonations();
      console.log('User Donations:', donationsData);
      userDonations.value = donationsData?.data?.donations || [];

      const consultationHistoryData = await consultationStore.consultationHistory();
      console.log('Consultation History:', consultationHistoryData);
      const allConsultations = consultationHistoryData?.data?.consultations || [];

      requestedConsultations.value = allConsultations.filter(
        (consultation) => consultation.user_id === user.value.id
      );

      acceptedConsultations.value = allConsultations.filter(
        (consultation) => consultation.doctor_id === user.value.id
      );

    } catch (error) {
      console.error('Error fetching profile data:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load profile data. Please try again later.',
      });
    }
  }
};

onMounted(fetchProfileData);

const goToSettingsPage = () => {
  console.log('Navigating to settings...');
  // TODO: Implement navigation to settings page
};

const logout = () => {
  swal.fire({
    title: 'Logout',
    text: 'Are you sure you want to logout?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, logout!',
  }).then((result) => {
    if (result.isConfirmed) {
      authStore.logout();
      router.push('/login');
      swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been successfully logged out.',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
};
</script>

<style scoped>
/* Enhanced UI Styles */
.text-muted-foreground {
  color: hsl(240, 10%, 3.9%); /* Replace with your actual muted foreground color */
}

.bg-muted {
  background-color: hsl(240, 4.8%, 95.9%); /* Replace with your actual muted background color */
}
</style>