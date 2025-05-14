import { defineStore } from "pinia";
import { useRuntimeConfig } from "#app";
import { useToken } from "~/composables/useToken";
import { useNotificationStore } from "./notificationStore";
import { useMessageStore } from "./messageStore";

export const useConsultationStore = defineStore("consultation", {
    state: () => ({
        activeConsultationId: null,
        activeConsultationData: null,
        isLoading: false,
        error: null,
    }),

    getters: {
        getConsultationById: (state) => (id) => {
            if (state.activeConsultationData?.id === id) return state.activeConsultationData;
            state.fetchConsultation(id);
            return null;
        },
        activeConsultation: (state) => state.activeConsultationData
    },

    actions: {
        // Core API fetch helper
        async apiCall(endpoint, method = "GET", body = null) {
            const config = useRuntimeConfig();
            try {
                return await $fetch(endpoint, {
                    method,
                    headers: { Authorization: `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                    ...(body && { body })
                });
            } catch (error) {
                this.error = error.message || `API call to ${endpoint} failed`;
                throw error;
            }
        },

        // Notification helper
        showNotification(title, message, type = "success") {
            useNotificationStore().show({ title, message, type });
        },

        // Request a new consultation
        async requestConsultation() {
            this.isLoading = true;
            try {
                const { data } = await this.apiCall("/consultations/request", "POST");
                this.activeConsultationId = data.consultation.id;
                this.activeConsultationData = data.consultation;
                return data.consultation;
            } finally {
                this.isLoading = false;
            }
        },

        // Accept a consultation (for health experts)
        async acceptConsultation(consultationId) {
            this.isLoading = true;
            try {
                const { data } = await this.apiCall(`/consultations/${consultationId}/accept`, "POST");
                const consultation = data.consultation;

                if (consultation) {
                    this.activeConsultationId = consultation.id;

                    // Load messages and setup listeners
                    const messageStore = useMessageStore();
                    messageStore.setMessagesByConsultation(consultation.id, consultation.messages || []);
                    messageStore.listenForMessages(consultation.id);
                    this.listenForConsultationUpdates(consultation.id);

                    navigateTo('/consultations');
                    return consultation;
                }
            } finally {
                this.isLoading = false;
            }
        },

        // Fetch expert consultations on demand
        async fetchExpertConsultations() {
            this.isLoading = true;
            try {
                const { data } = await this.apiCall("/consultations/expert");
                return data.consultation || [];
            } finally {
                this.isLoading = false;
            }
        },

        // Fetch a single consultation by ID
        async fetchConsultation(consultationId) {
            if (!consultationId) return null;

            this.isLoading = true;
            try {
                const { data } = await this.apiCall(`/consultations/${consultationId}`);
                const consultation = data.consultation;

                // Update active consultation if IDs match
                if (this.activeConsultationId === consultationId) {
                    this.activeConsultationData = consultation;
                }

                return consultation;
            } finally {
                this.isLoading = false;
            }
        },

        // Set active consultation
        // Set active consultation
        async setActiveConsultation(consultationId) {
            this.activeConsultationId = consultationId;

            if (!consultationId) return;

            // Fetch consultation if needed
            let consultation = this.activeConsultationData?.id === consultationId
                ? this.activeConsultationData
                : await this.fetchConsultation(consultationId);

            this.activeConsultationData = consultation;

            // Setup listeners and message handling
            this.listenForConsultationUpdates(consultationId);
            const messageStore = useMessageStore();

            if (consultation?.messages?.length > 0) {
                messageStore.setMessagesByConsultation(consultationId, consultation.messages);
            } else {
                messageStore.fetchMessages(consultationId);
            }

            messageStore.listenForMessages(consultationId);

            // Dispatch event to notify components of active consultation change
            document.dispatchEvent(new CustomEvent('consultation:active-changed', {
                detail: { consultation }
            }));
        },

        // End a consultation
        // End a consultation
        async endConsultation(consultationId) {
            this.isLoading = true;
            try {
                await this.apiCall(`/consultations/${consultationId}/end`, "POST");

                if (this.activeConsultationId === consultationId) {
                    this.activeConsultationId = null;
                    this.activeConsultationData = null;
                }

                // Dispatch an event indicating this consultation has ended
                document.dispatchEvent(new CustomEvent('consultation:ended', {
                    detail: { consultationId }
                }));

                return true;
            } finally {
                this.isLoading = false;
            }
        },

        // Expert takes over a consultation
        async takeOverChat(consultationId) {
            this.isLoading = true;
            try {
                const { data } = await this.apiCall(`/consultations/${consultationId}/takeover`, "POST");
                return data.consultation;
            } finally {
                this.isLoading = false;
            }
        },

        // Fetch consultation history
        async fetchConsultationHistory() {
            this.isLoading = true;
            try {
                const { data } = await this.apiCall('/consultations/history');
                return data.consultations || [];
            } finally {
                this.isLoading = false;
            }
        },

        // Submit rating for a consultation
        async rateConsultation(consultationId, rating, comment = '') {
            this.isLoading = true;
            try {
                const { data } = await this.apiCall(
                    `/consultations/${consultationId}/rate`,
                    "POST",
                    { rating, comment }
                );

                if (this.activeConsultationId === consultationId) {
                    this.activeConsultationData = data.consultation;
                }

                this.showNotification('Rating Submitted', 'Thank you for your feedback!');
                return data.consultation;
            } catch (error) {
                this.showNotification('Rating Failed', this.error, 'error');
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // Request follow-up for a consultation
        async requestFollowUp(consultationId, reason = '') {
            this.isLoading = true;
            try {
                const { data } = await this.apiCall(
                    `/consultations/${consultationId}/follow-up`,
                    "POST",
                    { reason }
                );

                if (this.activeConsultationId === consultationId) {
                    this.activeConsultationData = data.consultation;
                }

                this.showNotification('Follow-up Requested', 'Your follow-up request has been submitted.');
                return data.consultation;
            } catch (error) {
                this.showNotification('Follow-up Request Failed', this.error, 'error');
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // Accept a follow-up request
        async acceptFollowUp(consultationId) {
            this.isLoading = true;
            try {
                const { data } = await this.apiCall(`/consultations/${consultationId}/accept-follow-up`, "POST");
                const consultation = data.consultation;

                if (this.activeConsultationId === consultationId) {
                    this.activeConsultationData = consultation;
                }

                this.updateConsultationInLists(consultation);
                this.showNotification('Follow-up Accepted', 'You have accepted the follow-up request.');
                return consultation;
            } catch (error) {
                this.showNotification('Failed to Accept Follow-up', this.error, 'error');
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // Update consultation in lists
        updateConsultationInLists(updatedConsultation) {
            document.dispatchEvent(new CustomEvent('consultation:updated', {
                detail: { consultation: updatedConsultation }
            }));
        },

        // Listen for real-time consultation updates
        listenForConsultationUpdates(consultationId) {
            if (!consultationId || !window.Echo) return;

            console.log(`Listening for updates on consultations.${consultationId}`);

            window.Echo.private(`consultations.${consultationId}`)
                .listen('.consultation.updated', (event) => {
                    console.log("Consultation updated:", event.consultation);

                    this.updateConsultationInLists(event.consultation);
                });
        }
    }
});