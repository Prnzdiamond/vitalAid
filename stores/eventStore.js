import { defineStore } from "pinia";
import { useRuntimeConfig } from "#app";
import { useToken } from "@/composables/useToken";

export const useEventStore = defineStore("event", {
    state: () => ({
        events: [],
        userEvents: [],
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

    },
});
