<template>
  <div>
    <!-- Dashboard Content -->
    <div class="space-y-6">
      <!-- Dashboard Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 class="text-3xl font-semibold text-gray-800">Dashboard Overview</h2>
          <p class="text-gray-600 mt-1">
            Welcome back, {{ user._tag }}!
            <span v-if="user.role === 'user'">Track your consultations, donations, and upcoming events.</span>
            <span v-else-if="user.role === 'health_expert'">Manage your consultation requests and track your impact.</span>
            <span v-else-if="user.role === 'charity'">Monitor donation campaigns and volunteer activities.</span>
            <span v-else-if="user.role === 'community'">Coordinate events and engage members.</span>
          </p>
        </div>
        
        <!-- Optional: Demo selector for testing different roles -->
        <div v-if="isDevelopment" class="mt-4 md:mt-0">
          <select 
            v-model="selectedRole" 
            @change="handleRoleChange"
            class="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="user">User</option>
            <option value="health_expert">Health Expert</option>
            <option value="charity">Charity</option>
            <option value="community">Community</option>
          </select>
        </div>
      </div>

      <!-- Stats Section (Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- User Stats -->
        <template v-if="user.role === 'user'">
          <StatsCard 
            title="Consultations" 
            :value="dashboardData.consultations_count || 0" 
            icon="MessageCircle" 
            info="Total consultations"
          />
          <StatsCard 
            title="Donations" 
            :value="dashboardData.donations_count || 0" 
            icon="Heart" 
            info="Made so far"
          />
          <StatsCard 
            title="Events Attended" 
            :value="dashboardData.events_attended_count || 0" 
            icon="Users" 
            info="Past events"
          />
          <StatsCard 
            title="Upcoming Events" 
            :value="dashboardData.upcoming_events_count || 0" 
            icon="Calendar" 
            info="Scheduled"
          />
        </template>

        <!-- Health Expert Stats -->
        <template v-else-if="user.role === 'health_expert'">
          <StatsCard 
            title="Total Consultations" 
            :value="dashboardData.consultations_handled_count || 0" 
            icon="MessageCircle" 
            info="Provided"
          />
          <StatsCard 
            title="Active Requests" 
            :value="dashboardData.active_consultations_count || 0" 
            icon="Clock" 
            info="Pending response"
          />
          <StatsCard 
            title="Average Rating" 
            :value="dashboardData.average_rating || 0" 
            icon="BadgeCheck" 
            info="Out of 5.0"
          />
          <StatsCard 
            title="Upcoming Events" 
            :value="dashboardData.upcoming_events_count || 0" 
            icon="Calendar" 
            info="To present at"
          />
        </template>

        <!-- Charity Stats -->
        <template v-else-if="user.role === 'charity'">
          <StatsCard 
            title="Donations Received" 
            :value="dashboardData.donations_received_count || 0" 
            icon="Heart" 
            info="Total count"
          />
          <StatsCard 
            title="Total Amount" 
            :value="`$${formatAmount(dashboardData.total_amount_raised || 0)}`" 
            icon="TrendingUp" 
            info="Raised so far"
          />
          <StatsCard 
            title="Ongoing Campaigns" 
            :value="dashboardData.ongoing_donations_count || 0" 
            icon="Clock" 
            info="Active now"
          />
          <StatsCard 
            title="Volunteers" 
            :value="42" 
            icon="Users" 
            info="Registered"
          />
        </template>

        <!-- Community Stats -->
        <template v-else-if="user.role === 'community'">
          <StatsCard 
            title="Members" 
            :value="dashboardData.members_count || 0" 
            icon="Users" 
            info="Total registered"
          />
          <StatsCard 
            title="Events Hosted" 
            :value="dashboardData.events_hosted_this_year_count || 0" 
            icon="Calendar" 
            info="This year"
          />
          <StatsCard 
            title="Active Discussions" 
            :value="17" 
            icon="MessageCircle" 
            info="Ongoing topics"
          />
          <StatsCard 
            title="Resources Shared" 
            :value="58" 
            icon="BadgeCheck" 
            info="Total count"
          />
        </template>
      </div>

      <!-- Role-specific Content Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- User Content -->
        <template v-if="user.role === 'user'">
          <!-- Upcoming Events -->
          <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-800">Upcoming Events</h3>
            </div>
            <div class="p-6">
              <div v-if="dashboardData.first_three_upcoming_events && dashboardData.first_three_upcoming_events.length > 0">
                <div v-for="event in dashboardData.first_three_upcoming_events" :key="event.id" 
                  class="mb-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium text-gray-800">{{ event.title }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ formatDate(event.date) }} • {{ event.location }}</p>
                    </div>
                    <NuxtLink :to="`/events/${event.id}`" 
                      class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                      Details
                    </NuxtLink>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 py-4 text-center">No upcoming events</div>
            </div>
            <div class="px-6 py-3 bg-gray-50/50 border-t border-gray-200/50">
              <NuxtLink to="/events" class="flex items-center justify-center text-green-600 hover:text-green-700 font-medium">
                View all events
                <ArrowRight class="w-4 h-4 ml-1" />
              </NuxtLink>
            </div>
          </div>
          
          <!-- Recent Consultations -->
          <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200/50">
              <h3 class="text-lg font-semibold text-gray-800">Recent Consultations</h3>
            </div>
            <div class="p-6">
              <div v-if="dashboardData.first_three_recent_consultations && dashboardData.first_three_recent_consultations.length > 0">
                <div v-for="consultation in dashboardData.first_three_recent_consultations" :key="consultation.id" 
                  class="mb-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0">
                  <h4 class="font-medium text-gray-800">{{ consultation.messages[0]?.content?.slice(0, 30) || 'Consultation' }}...</h4>
                  <p class="text-sm text-gray-600 mt-1">Date: {{ formatDate(consultation.last_message_at) }}</p>
                </div>
              </div>
              <div v-else class="text-gray-500 py-4 text-center">No recent consultations</div>
            </div>
            <div class="px-6 py-3 bg-gray-50/50 border-t border-gray-200/50">
              <NuxtLink to="/consultations" class="flex items-center justify-center text-green-600 hover:text-green-700 font-medium">
                View all consultations
                <ArrowRight class="w-4 h-4 ml-1" />
              </NuxtLink>
            </div>
          </div>
        </template>
        
        <!-- Health Expert Content -->
        <template v-else-if="user.role === 'health_expert'">
          <!-- Recent Consultations -->
          <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200/50">
              <h3 class="text-lg font-semibold text-gray-800">Recent Consultations</h3>
            </div>
            <div class="p-6">
              <div v-if="dashboardData.first_three_recent_consultations_accepted && dashboardData.first_three_recent_consultations_accepted.length > 0">
                <div v-for="consultation in dashboardData.first_three_recent_consultations_accepted" :key="consultation.id" 
                  class="mb-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium text-gray-800">{{ consultation.messages[0]?.content?.slice(0, 30) || 'Consultation' }}...</h4>
                      <p class="text-sm text-gray-600 mt-1">With: {{ consultation.user_tag }} • {{ formatDate(consultation.last_message_at) }}</p>
                    </div>
                    <NuxtLink :to="`/consultations/${consultation.id}`" 
                      class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                      Follow up
                    </NuxtLink>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 py-4 text-center">No recent consultations</div>
            </div>
            <div class="px-6 py-3 bg-gray-50/50 border-t border-gray-200/50">
              <NuxtLink to="/consultations" class="flex items-center justify-center text-green-600 hover:text-green-700 font-medium">
                View all consultations
                <ArrowRight class="w-4 h-4 ml-1" />
              </NuxtLink>
            </div>
          </div>
          
          <!-- Your Schedule -->
          <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200/50">
              <h3 class="text-lg font-semibold text-gray-800">Your Schedule</h3>
            </div>
            <div class="p-6">
              <div v-if="dashboardData.upcoming_events && dashboardData.upcoming_events.length > 0">
                <div v-for="event in dashboardData.upcoming_events.slice(0, 3)" :key="event.id" 
                  class="mb-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium text-gray-800">{{ event.title }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ formatDate(event.date) }} • {{ event.location }}</p>
                    </div>
                    <NuxtLink :to="`/events/${event.id}`" 
                      class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                      Manage
                    </NuxtLink>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 py-4 text-center">No upcoming events</div>
            </div>
            <div class="px-6 py-3 bg-gray-50/50 border-t border-gray-200/50">
              <NuxtLink to="/calendar" class="flex items-center justify-center text-green-600 hover:text-green-700 font-medium">
                View full calendar
                <ArrowRight class="w-4 h-4 ml-1" />
              </NuxtLink>
            </div>
          </div>
        </template>
        
        <!-- Charity Content -->
        <template v-else-if="user.role === 'charity'">
          <!-- Donation Campaigns -->
          <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200/50">
              <h3 class="text-lg font-semibold text-gray-800">Donation Campaigns</h3>
            </div>
            <div class="p-6">
              <div v-if="dashboardData.first_three_ongoing_donations && dashboardData.first_three_ongoing_donations.length > 0">
                <div v-for="campaign in dashboardData.first_three_ongoing_donations" :key="campaign.id" 
                  class="mb-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0">
                  <h4 class="font-medium text-gray-800">{{ campaign.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">${{ formatAmount(campaign.amount_received) }} / ${{ formatAmount(campaign.amount_needed) }}</p>
                  <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div class="bg-green-600 h-2.5 rounded-full" :style="`width: ${calculateProgress(campaign.amount_received, campaign.amount_needed)}%`"></div>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 py-4 text-center">No active campaigns</div>
            </div>
            <div class="px-6 py-3 bg-gray-50/50 border-t border-gray-200/50">
              <NuxtLink to="/donations/manage" class="flex items-center justify-center text-green-600 hover:text-green-700 font-medium">
                Manage campaigns
                <ArrowRight class="w-4 h-4 ml-1" />
              </NuxtLink>
            </div>
          </div>
          
          <!-- Upcoming Events -->
          <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200/50">
              <h3 class="text-lg font-semibold text-gray-800">Upcoming Events</h3>
            </div>
            <div class="p-6">
              <div v-if="dashboardData.first_three_upcoming_events && dashboardData.first_three_upcoming_events.length > 0">
                <div v-for="event in dashboardData.first_three_upcoming_events" :key="event.id" 
                  class="mb-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium text-gray-800">{{ event.title }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ formatDate(event.date) }} • {{ event.location }}</p>
                    </div>
                    <NuxtLink :to="`/events/${event.id}`" 
                      class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                      Manage
                    </NuxtLink>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 py-4 text-center">No upcoming events</div>
            </div>
            <div class="px-6 py-3 bg-gray-50/50 border-t border-gray-200/50">
              <NuxtLink to="/events/create" class="flex items-center justify-center text-green-600 hover:text-green-700 font-medium">
                Create new event
                <ArrowRight class="w-4 h-4 ml-1" />
              </NuxtLink>
            </div>
          </div>
        </template>
        
        <!-- Community Content -->
        <template v-else-if="user.role === 'community'">
          <!-- Community Events -->
          <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200/50">
              <h3 class="text-lg font-semibold text-gray-800">Community Events</h3>
            </div>
            <div class="p-6">
              <div v-if="dashboardData.first_three_upcoming_events && dashboardData.first_three_upcoming_events.length > 0">
                <div v-for="event in dashboardData.first_three_upcoming_events" :key="event.id" 
                  class="mb-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium text-gray-800">{{ event.title }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ formatDate(event.date) }} • {{ event.location }}</p>
                    </div>
                    <NuxtLink :to="`/events/${event.id}`" 
                      class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                      Manage
                    </NuxtLink>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 py-4 text-center">No upcoming events</div>
            </div>
            <div class="px-6 py-3 bg-gray-50/50 border-t border-gray-200/50">
              <NuxtLink to="/events" class="flex items-center justify-center text-green-600 hover:text-green-700 font-medium">
                View all events
                <ArrowRight class="w-4 h-4 ml-1" />
              </NuxtLink>
            </div>
          </div>
          
          <!-- Resource Sharing -->
          <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200/50">
              <h3 class="text-lg font-semibold text-gray-800">Resource Sharing</h3>
            </div>
            <div class="p-6">
              <div class="mb-4 pb-4 border-b border-gray-100">
                <h4 class="font-medium text-gray-800">COVID-19 Prevention Guide</h4>
                <p class="text-sm text-gray-600 mt-1">Shared by: Dr. Williams • 3 days ago</p>
              </div>
              <div class="mb-4 pb-4 border-b border-gray-100">
                <h4 class="font-medium text-gray-800">Mental Health Resources</h4>
                <p class="text-sm text-gray-600 mt-1">Shared by: Hope Foundation • 5 days ago</p>
              </div>
              <div class="mb-0">
                <h4 class="font-medium text-gray-800">First Aid Training Materials</h4>
                <p class="text-sm text-gray-600 mt-1">Shared by: Red Cross • 1 week ago</p>
              </div>
            </div>
            <div class="px-6 py-3 bg-gray-50/50 border-t border-gray-200/50">
              <NuxtLink to="/resources/share" class="flex items-center justify-center text-green-600 hover:text-green-700 font-medium">
                Share new resource
                <ArrowRight class="w-4 h-4 ml-1" />
              </NuxtLink>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { MessageCircle, ArrowRight, BadgeCheck, Calendar, Clock, Heart, TrendingUp, Users, XCircle } from "lucide-vue-next";
import { useAuthStore } from "~/stores/authStore";
import { useDashboardStore } from "~/stores/dashboardStore";

// Store references
const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

// Component state
const user = ref({ _tag: "Loading...", role: "user" });
const isDevelopment = process.env.NODE_ENV === 'development' || true;
const selectedRole = ref("user");
const dashboardData = ref({});
const isLoading = ref(true);

// Functions
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};

const formatAmount = (amount) => {
  return Number(amount).toLocaleString('en-US');
};

const calculateProgress = (received, needed) => {
  if (!received || !needed) return 0;
  const progress = (received / needed) * 100;
  return Math.min(progress, 100);
};

const handleRoleChange = async () => {
  user.value.role = selectedRole.value;
  await fetchDashboardData();
};

const fetchDashboardData = async () => {
  isLoading.value = true;
  try {
    await dashboardStore.fetchDashboardData();
    dashboardData.value = dashboardStore.dashboardData;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  if (authStore.user) {
    user.value = authStore.user;
    selectedRole.value = authStore.user.role || "user";
  } else {
    await authStore.fetchUser();
    if (authStore.user) {
      user.value = authStore.user;
      selectedRole.value = authStore.user.role || "user";
    }
  }
  
  await fetchDashboardData();
});
</script>