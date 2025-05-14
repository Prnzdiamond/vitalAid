import { defineStore } from "pinia";
import { useRuntimeConfig } from "#app";
import { useToken } from "@/composables/useToken";

export const useCommunityStore = defineStore("community", {
    state: () => ({
        // Maintain minimal state for UI reactivity when needed
        userCommunities: [], // Communities the user has joined
        communityMembers: {}, // Store members by community ID
    }),

    actions: {
        // Fetch all communities (Public)
        async fetchCommunities(params = {}) {
            const config = useRuntimeConfig();
            try {
                // Build query string for pagination and filtering
                const queryParams = new URLSearchParams();
                for (const [key, value] of Object.entries(params)) {
                    if (value !== null && value !== undefined && value !== '') {
                        queryParams.append(key, value);
                    }
                }

                const queryString = queryParams.toString();
                const url = queryString ? `/community/list?${queryString}` : '/community/list';

                const response = await $fetch(url, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                return {
                    communities: response.data.communities || [],
                    pagination: response.data.pagination || null
                };
            } catch (error) {
                console.error("Error fetching communities:", error);
                throw error;
            }
        },

        // Search communities with specific criteria
        async searchCommunities(searchParams = {}) {
            const config = useRuntimeConfig();
            try {
                // Build query string
                const queryParams = new URLSearchParams();
                for (const [key, value] of Object.entries(searchParams)) {
                    if (value !== null && value !== undefined && value !== '') {
                        queryParams.append(key, value);
                    }
                }

                const queryString = queryParams.toString();
                const url = `/community/list?${queryString}`;

                const response = await $fetch(url, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                return {
                    communities: response.data.communities || [],
                    pagination: response.data.pagination || null
                };
            } catch (error) {
                console.error("Error searching communities:", error);
                throw error;
            }
        },

        // Fetch a community (Public)
        async fetchCommunity(communityId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/community/${communityId}`, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });
                console.log(response)
                return response.data;

            } catch (error) {
                console.error("Error fetching community:", error);
                throw error;
            }
        },

        // Join a community (Authenticated users)
        async joinCommunity(communityId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/community/${communityId}/join`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                // Refresh user communities after joining
                await this.fetchUserCommunities();

                return response.data;
            } catch (error) {
                console.error("Error joining community:", error);
                throw error;
            }
        },

        // Leave a community (Authenticated users)
        async leaveCommunity(communityId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/community/${communityId}/leave`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                // Update local state after leaving
                this.userCommunities = this.userCommunities.filter(community => community.id !== communityId);

                return response.data;
            } catch (error) {
                console.error("Error leaving community:", error);
                throw error;
            }
        },

        // Fetch user's communities (communities the user has joined)
        async fetchUserCommunities() {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch("/community/my/list", {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                this.userCommunities = response.data.communities || [];
                return this.userCommunities;
            } catch (error) {
                console.error("Error fetching user communities:", error);
                throw error;
            }
        },

        // Get community members
        async getCommunityMembers(communityId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/community/${communityId}/members`, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                // Store in state for reactivity if needed
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

        // Notify community members (for community admins only)
        async notifyCommunityMembers(notificationData) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/community/notify-members`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    body: notificationData,
                    baseURL: config.public.apiBase,
                });
                return response.data;
            } catch (error) {
                console.error("Error notifying community members:", error);
                throw error;
            }
        }
    },
}); 