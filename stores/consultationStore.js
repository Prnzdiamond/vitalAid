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
                this.messages = data.consultation.messages || []; // ✅ Load previous messages
                console.log(this.activeConsultation, this.messages);
                this.listenForMessages();
            } catch (error) {
                console.error('Error accepting consultation:', error);
            }
        },

        async sendMessage(message) {
            if (!message.trim()) return;

            const config = useRuntimeConfig();
            try {
                await $fetch(`/consultations/${this.activeConsultation.id}/message`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                    body: { message },
                });

                // ✅ Do NOT push message manually; Laravel Echo will handle it
            } catch (error) {
                console.error("Error sending message:", error);
            }
        },

        listenForMessages() {
            if (!this.activeConsultation) return;

            // Unbind previous listener to avoid duplication
            window.Echo.leave(`consultations.${this.activeConsultation.id}`);

            console.log(`Listening to consultations.${this.activeConsultation.id}`);
            window.Echo.private(`consultations.${this.activeConsultation.id}`)
                .listen('.message.sent', (event) => {
                    console.log("A new message was received:", event.message);
                    if (!this.messages.some((m, index) =>
                        m.sender === event.message.sender &&
                        m.message === event.message.message &&
                        Math.abs(new Date(m.timestamp) - new Date(event.message.timestamp)) < 1000 && // Allow 1 sec difference
                        index !== this.messages.length - 1 // Ensures it's not blocking sequential messages
                    )) {
                        this.messages.push(event.message);
                    }


                });
        },
        listenForNewConsultations() {
            console.log("listening for new consultations")
            window.Echo.private('consultations')
                .listen('.consultation.requested', (event) => {
                    this.unreadConsultations.push(event.consultation); // ✅ Store unread consultation
                    this.notifyDoctor(event.consultation);
                });
        },

        notifyDoctor(consultation) {
            if (Notification.permission === "default") {
                Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                        this.showNotification(consultation);
                    }
                });
            } else if (Notification.permission === "granted") {
                this.showNotification(consultation);
            }
        },

        showNotification(consultation) {
            new Notification("New Consultation Request", {
                body: `Patient: ${consultation.user_id}`,
                icon: "/icons/notification-icon.png"
            });
        }

    }
});
