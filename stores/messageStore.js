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
        unreadMessages: new Set(), // Track unread message IDs
        lastReadTimestamp: {}, // Track last read timestamp per consultation
    }),

    getters: {
        hasUnreadMessages: (state) => {
            return state.unreadMessages.size > 0;
        },
        
        getUnreadCount: (state) => (consultationId) => {
            if (!consultationId) return 0;
            const messages = state.messagesByConsultation[consultationId] || [];
            const lastRead = state.lastReadTimestamp[consultationId] || 0;
            return messages.filter(msg => 
                new Date(msg.timestamp).getTime() > lastRead && 
                msg.sender !== 'You' // Don't count own messages
            ).length;
        }
    },

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

        markAsRead(consultationId) {
            if (!consultationId) return;
            
            // Update last read timestamp
            this.lastReadTimestamp[consultationId] = Date.now();
            
            // Remove unread messages for this consultation
            const messages = this.messagesByConsultation[consultationId] || [];
            messages.forEach(msg => {
                if (msg.id) {
                    this.unreadMessages.delete(msg.id);
                }
            });
        },

        markMessageAsUnread(messageId) {
            if (messageId) {
                this.unreadMessages.add(messageId);
            }
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
                    
                    // Mark as unread if chat is closed
                    if (!this.showChat && event.message.id) {
                        this.markMessageAsUnread(event.message.id);
                        
                        // Dispatch custom event for notification
                        document.dispatchEvent(new CustomEvent('message:received', {
                            detail: {
                                consultationId,
                                message: event.message
                            }
                        }));
                    }
                });
        }
    }
});