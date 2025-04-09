import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';
import { useConsultationStore } from './consultationStore';

export const useMessageStore = defineStore('message', {
    state: () => ({
        subscribedChannels: new Set(),
        messagesByConsultation: {},
        showChat: false,
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
        setMessagesByConsultation(consultationId, messages) {
            this.messagesByConsultation[consultationId] = messages;
        },
        getMessages(consultationId) {
            return this.messagesByConsultation[consultationId] || [];
        },
        listenForMessages(consultationId) {
            if (this.subscribedChannels.has(consultationId)) return;

            this.subscribedChannels.add(consultationId);
            window.Echo.private(`consultations.${consultationId}`)
                .listen('.message.sent', (event) => {
                    if (!this.messagesByConsultation[consultationId]) {
                        this.messagesByConsultation[consultationId] = [];
                    }
                    this.messagesByConsultation[consultationId].push(event.message);
                });
        }
    }
});
