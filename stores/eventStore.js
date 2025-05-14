import { defineStore } from "pinia";
import { useRuntimeConfig } from "#app";
import { useToken } from "@/composables/useToken";

export const useEventStore = defineStore("event", {
    state: () => ({
        // Maintain minimal state for UI reactivity when needed
        eventReactions: {}, // Store reactions by event ID
        reactionSummaries: {}, // Store reaction summaries by event ID
    }),

    actions: {
        // Fetch all events (Public)
        async fetchEvents(params = {}) {
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
                const url = queryString ? `/events?${queryString}` : '/events';

                const response = await $fetch(url, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });



                return {
                    events: response.data.events || [],
                    pagination: response.data.pagination || null
                };
            } catch (error) {
                console.error("Error fetching events:", error);
                throw error;
            }
        },

        // Search events with specific criteria
        async searchEvents(searchParams = {}) {
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
                const url = `/events/search?${queryString}`;

                const response = await $fetch(url, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                return {
                    events: response.data.events || [],
                    pagination: response.data.pagination || null
                };
            } catch (error) {
                console.error("Error searching events:", error);
                throw error;
            }
        },

        // Fetch an event (Public)
        async fetchEvent(eventId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/events/${eventId}`, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });
                return response.data.event;
            } catch (error) {
                console.error("Error fetching event:", error);
                throw error;
            }
        },

        // Join an event (Authenticated users)
        async joinEvent(eventId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/events/${eventId}/join`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });
                return response.data;
            } catch (error) {
                console.error("Error joining event:", error);
                throw error;
            }
        },

        // Fetch user's joined events (Authenticated users)
        async fetchUserEvents() {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch("events/user/attending", {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                return response.data.joined_events;
            } catch (error) {
                console.error("Error fetching user events:", error);
                throw error;
            }
        },

        // Fetch user's created events (Authenticated users)
        async fetchUserCreatedEvents() {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch("events/user/created", {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                return response.data.created_events;
            } catch (error) {
                console.error("Error fetching user created events:", error);
                throw error;
            }
        },

        // Create a new event
        async createEvent(eventData) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch("/events", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${useToken().get()}`,
                    },
                    body: eventData,
                    baseURL: config.public.apiBase,
                });
                return response.data.event;
            } catch (error) {
                console.error("Error creating event:", error);
                throw error;
            }
        },

        // Update an event
        async updateEvent(eventId, eventData) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/events/${eventId}/update`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${useToken().get()}`
                    },
                    body: eventData,
                    baseURL: config.public.apiBase,
                });
                return response.data.event;
            } catch (error) {
                console.error("Error updating event:", error);
                throw error;
            }
        },

        // Delete an event
        async deleteEvent(eventId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/events/${eventId}/delete`, {
                    method: "DELETE",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });
                return response.data;
            } catch (error) {
                console.error("Error deleting event:", error);
                throw error;
            }
        },

        // Leave an event
        async leaveEvent(eventId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/events/${eventId}/leave`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });
                return response.data;
            } catch (error) {
                console.error("Error leaving event:", error);
                throw error;
            }
        },

        // Get event participants
        async getEventParticipants(eventId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/events/${eventId}/participants`, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });
                return response.data.participants;
            } catch (error) {
                console.error("Error fetching event participants:", error);
                throw error;
            }
        },

        // Complete an event
        async completeEvent(eventId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/events/${eventId}/complete`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });
                return response.data;
            } catch (error) {
                console.error("Error completing event:", error);
                throw error;
            }
        },

        // REACTION METHODS

        // Fetch reactions for an event
        async fetchEventReactions(eventId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/events/${eventId}/reactions`, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                // Cache the reactions in the store for UI reactivity if needed
                this.eventReactions[eventId] = response.data.reactions;
                return response.data;
            } catch (error) {
                console.error("Error fetching event reactions:", error);
                throw error;
            }
        },

        // Add a reaction to an event
        async addReaction(eventId, reactionData) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/events/${eventId}/reactions`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    body: reactionData,
                    baseURL: config.public.apiBase,
                });

                // Update local state
                await this.fetchEventReactions(eventId);
                await this.fetchReactionSummary(eventId);

                return response.data;
            } catch (error) {
                console.error("Error adding reaction:", error);
                throw error;
            }
        },

        // Delete a reaction from an event
        async deleteReaction(eventId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/events/${eventId}/reactions`, {
                    method: "DELETE",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                // Update local state
                await this.fetchEventReactions(eventId);
                await this.fetchReactionSummary(eventId);

                return response.data;
            } catch (error) {
                console.error("Error deleting reaction:", error);
                throw error;
            }
        },

        // Fetch reaction summary for an event
        async fetchReactionSummary(eventId) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/events/${eventId}/reaction-summary`, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                // Cache the summary in the store for UI reactivity if needed
                this.reactionSummaries[eventId] = response.data;
                return response.data;
            } catch (error) {
                console.error("Error fetching reaction summary:", error);
                throw error;
            }
        }
    },
});