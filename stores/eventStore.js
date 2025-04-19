import { defineStore } from "pinia";
import { useRuntimeConfig } from "#app";
import { useToken } from "@/composables/useToken";

export const useEventStore = defineStore("event", {
    state: () => ({
        events: [],
        userEvents: [],
        createdEvents: []
    }),

    actions: {
        // ✅ Fetch all events (Public)
        async fetchEvents() {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch("/events", {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                this.events = response.events; // ✅ Ensure correct key
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        },

        // ✅ Fetch an event (Public)
        async fetchEvent(eventId) {
            const config = useRuntimeConfig();
            try {
                return await $fetch(`/events/${eventId}`, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });
            } catch (error) {
                console.error("Error fetching event:", error);
                return null;
            }
        },

        // ✅ Join an event (Authenticated users)
        async joinEvent(eventId) {
            const config = useRuntimeConfig();
            try {
                await $fetch(`/events/${eventId}/join`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                this.userEvents.push(eventId); // ✅ Update userEvents locally
            } catch (error) {
                console.error("Error joining event:", error);
            }
        },

        // ✅ Fetch user’s joined events (Authenticated users)
        async fetchUserEvents() {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch("/user/events", {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                this.userEvents = response.joined_events.map(event => event.id); // ✅ Ensure correct key
            } catch (error) {
                console.error("Error fetching user events:", error);
            }
        },

        // Fetch user's created events (Authenticated users)
        async fetchUserCreatedEvents() {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch("/user/events/created", {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                this.createdEvents = response.created_events.map(event => event.id); // ✅ Ensure correct key
            } catch (error) {
                console.error("Error fetching user created events:", error);
            }
        },

        async createEvent(eventData) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch("/events", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${useToken().get()}`,
                        "Content-Type": "application/json"
                    },
                    body: eventData,
                    baseURL: config.public.apiBase,
                });

                this.events.push(response.event); // Add new event to state
                return response.event;
            } catch (error) {
                console.error("Error creating event:", error);
                throw error;
            }
        },
        async updateEvent(eventId, eventData) {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch(`/events/${eventId}/update`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${useToken().get()}`,
                        "Content-Type": "application/json"
                    },
                    body: eventData,
                    baseURL: config.public.apiBase,
                });
                this.events = this.events.map(event => event.id === eventId ? response.event : event);
                return response.event;
            }
            catch (error) {
                console.error("Error updating event:", error);
                throw error;
            }
        },
        async deleteEvent(eventId) {
            const config = useRuntimeConfig();
            try {
                await $fetch(`/events/${eventId}/delete`, {
                    method: "DELETE",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                this.events = this.events.filter(event => event.id !== eventId); // Remove deleted event from state
            } catch (error) {
                console.error("Error deleting event:", error);
            }
        },
        async leaveEvent(eventId) {
            const config = useRuntimeConfig();
            try {
                await $fetch(`/events/${eventId}/leave`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                this.userEvents = this.userEvents.filter(id => id !== eventId); // Remove event from userEvents
            } catch (error) {
                console.error("Error leaving event:", error);
            }
        },

    },
});
