import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const useConsultationStore = defineStore('consultation', {
    state: () => ({
        consultations: [],
        activeConsultation: null,
        messages: [],
        unreadConsultations: []
    }),

    actions: {
        async requestConsultation() {
            const config = useRuntimeConfig();
            try {
                console.log(useToken().get());
                const data = await $fetch('/consultations/request', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${useToken().get()}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    baseURL: config.public.apiBase,
                });
                this.activeConsultation = data.consultation;
            } catch (error) {
                console.error('Error requesting consultation:', error);
            }
        },

        async acceptConsultation(consultationId) {
            const config = useRuntimeConfig();
            try {
                const data = await $fetch(`/consultations/${consultationId}/accept`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${useToken().get()}`,
                    },
                    baseURL: config.public.apiBase,
                });

                this.activeConsultation = data.consultation;
                this.messages = data.consultation.messages // ✅ Load previous messages
                console.log(this.activeConsultation, this.messages);
                this.listenForMessages();
            } catch (error) {
                console.error('Error accepting consultation:', error);
            }
        },

        async sendMessage(message) {
            if (!message.trim()) return;

            const tempMessage = {
                sender: useAuthStore().user.name, // ✅ Show sender name
                message: message,
                timestamp: new Date().toISOString(), // ✅ Temporary timestamp
                temp: true // ✅ Mark as temporary
            };

            this.messages.push(tempMessage); // ✅ Show message instantly

            const config = useRuntimeConfig();
            try {
                const data = await $fetch(`/consultations/${this.activeConsultation.id}/message`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                    body: { message },
                });

                // ✅ Replace temp message with actual message from backend
                const index = this.messages.findIndex(m => m.temp && m.message === tempMessage.message);
                if (index !== -1) {
                    this.messages[index] = data.data;
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        },

        listenForMessages() {
            if (!this.activeConsultation) return;
            console.log(`Listening to consultations.${this.activeConsultation.id}`);
            window.Echo.channel(`consultations.${this.activeConsultation.id}`)
                .listen('.message.sent', (event) => {
                    console.log("a new message was sent");
                    this.messages.push(event.message);
                });
        },
        listenForNewConsultations() {
            window.Echo.private('consultations')
                .listen('.consultation.requested', (event) => {
                    this.unreadConsultations.push(event.consultation); // ✅ Store unread consultation
                    this.notifyDoctor(event.consultation);
                });
        },

        notifyDoctor(consultation) {
            // ✅ Trigger a browser notification
            if (Notification.permission === "granted") {
                new Notification("New Consultation Request", {
                    body: `Patient: ${consultation.user_id}`,
                    icon: "/icons/notification-icon.png"
                });
            }
        }
    }
});
