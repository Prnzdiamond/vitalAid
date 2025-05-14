import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';
import { useConsultationStore } from './consultationStore';
import { useToken } from '~/composables/useToken';

export const useMessageStore = defineStore('message', {
    state: () => ({
        subscribedChannels: new Set(),
        messagesByConsultation: {},
        showChat: false,
        isLoading: false,
    }),

    actions: {
        async sendMessage(consultationId, message) {
            if (!message.trim()) return;

            const config = useRuntimeConfig();
            const consultationStore = useConsultationStore();

            if (!consultationId) return;

            try {
                const response = await $fetch(`/consultations/${consultationId}/message`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${useToken().get()}`
                    },
                    baseURL: config.public.apiBase,
                    body: { message },
                });

                // Push immediately if response includes message
                if (response.message) {
                    if (!this.messagesByConsultation[consultationId]) {
                        this.messagesByConsultation[consultationId] = [];
                    }
                    this.messagesByConsultation[consultationId].push(response.message);
                }
            } catch (error) {
                console.error("Error sending message:", error);
            }
        },

        async fetchMessages(consultationId) {
            if (!consultationId) return [];

            this.isLoading = true;
            const config = useRuntimeConfig();

            try {
                const response = await $fetch(`/consultations/${consultationId}/messages`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${useToken().get()}`
                    },
                    baseURL: config.public.apiBase,
                });

                const messages = response.data?.messages || [];
                this.setMessagesByConsultation(consultationId, messages);
                return messages;
            } catch (error) {
                console.error("Error fetching messages:", error);
                return [];
            } finally {
                this.isLoading = false;
            }
        },

        setMessagesByConsultation(consultationId, messages) {
            this.messagesByConsultation[consultationId] = messages;
        },

        getMessages(consultationId) {
            return this.messagesByConsultation[consultationId] || [];
        },

        listenForMessages(consultationId) {
            if (!window.Echo || this.subscribedChannels.has(consultationId)) return;

            this.subscribedChannels.add(consultationId);
            console.log(`Listening for messages on consultations.${consultationId}`);

            window.Echo.private(`consultations.${consultationId}`)
                .listen('.message.sent', (event) => {
                    if (!this.messagesByConsultation[consultationId]) {
                        this.messagesByConsultation[consultationId] = [];
                    }
                    console.log("New message received:", event.message);
                    this.messagesByConsultation[consultationId].push(event.message);
                });
        }
    }
});