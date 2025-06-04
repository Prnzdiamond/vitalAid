import { defineStore } from "pinia";
import { useRuntimeConfig } from "#app";
import { useToken } from "@/composables/useToken";

export const useCommunityStore = defineStore("community", {
    state: () => ({
        userCommunities: [],
        communityMembers: {},
    }),

    actions: {
        // Helper for API calls
        async apiCall(endpoint, method = "GET", body = null) {
            const config = useRuntimeConfig();
            return await $fetch(endpoint, {
                method,
                headers: { 'Authorization': `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
                ...(body && { body })
            });
        },

        // Build query params helper
        buildQuery(params) {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    queryParams.append(key, value);
                }
            });
            return queryParams.toString();
        },

        // Fetch communities with optional params
        async fetchCommunities(params = {}) {
            try {
                const query = this.buildQuery(params);
                const url = query ? `/community/list?${query}` : '/community/list';
                const response = await this.apiCall(url);
                return {
                    communities: response.data.communities || [],
                    pagination: response.data.pagination || null
                };
            } catch (error) {
                console.error("Error fetching communities:", error);
                throw error;
            }
        },

        // Search communities (uses same endpoint as fetch)
        async searchCommunities(searchParams = {}) {
            return this.fetchCommunities(searchParams);
        },

        // Fetch single community
        async fetchCommunity(communityId) {
            try {
                const response = await this.apiCall(`/community/${communityId}`);
                console.log(response);
                return response.data;
            } catch (error) {
                console.error("Error fetching community:", error);
                throw error;
            }
        },

        // Join community
        async joinCommunity(communityId) {
            try {
                const response = await this.apiCall(`/community/${communityId}/join`, "POST");
                await this.fetchUserCommunities();
                return response.data;
            } catch (error) {
                console.error("Error joining community:", error);
                throw error;
            }
        },

        // Leave community
        async leaveCommunity(communityId) {
            try {
                const response = await this.apiCall(`/community/${communityId}/leave`, "POST");
                this.userCommunities = this.userCommunities.filter(c => c.id !== communityId);
                return response.data;
            } catch (error) {
                console.error("Error leaving community:", error);
                throw error;
            }
        },

        // Fetch user's communities
        async fetchUserCommunities() {
            try {
                const response = await this.apiCall("/community/my/list");
                this.userCommunities = response.data.communities || [];
                return this.userCommunities;
            } catch (error) {
                console.error("Error fetching user communities:", error);
                throw error;
            }
        },

        // Get community members
        async getCommunityMembers(communityId) {
            try {
                const response = await this.apiCall(`/community/${communityId}/members`);
                this.communityMembers[communityId] = response.data.members || [];
                return {
                    members: response.data.members || [],
                    pagination: response.data.pagination || null
                };
            } catch (error) {
                console.error("Error fetching community members:", error);
                throw error;
            }
        },

        // Notify community members
        async notifyCommunityMembers(notificationData) {
            try {
                const response = await this.apiCall(`/community/notify-members`, "POST", notificationData);
                return response.data;
            } catch (error) {
                console.error("Error notifying community members:", error);
                throw error;
            }
        }
    },
});