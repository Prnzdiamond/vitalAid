import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';
import { useMessageStore } from './messageStore';
import { useNotificationStore } from './notificationStore';

export const useConsultationStore = defineStore('consultation', {
    state: () => ({
        consultations: [],
        activeConsultation: null,
        expertConsultations: [],
        activeExpertConsultation: null
    }),

    actions: {
        async requestConsultation() {
            const config = useRuntimeConfig();
            try {
                const data = await $fetch('/consultations/request', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${useToken().get()}`,
                        'Content-Type': 'application/json',
                    },
                    baseURL: config.public.apiBase,
                });

                this.activeConsultation = data.consultation;
                this.listenForConsultationUpdates();
            } catch (error) {
                console.error('Error requesting consultation:', error);
            }
        },
        async acceptConsultation(consultationId) {
            const config = useRuntimeConfig();
            try {
                const data = await $fetch(`/consultations/${consultationId}/accept`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                const consultation = data.consultation;

                if (consultation) {
                    // Avoid duplicates
                    const exists = this.expertConsultations.some(c => c.id === consultation.id);
                    if (!exists) this.expertConsultations.push(consultation);

                    // Automatically open it
                    this.activeExpertConsultation = consultation;

                    // Load messages into expert context
                    const messageStore = useMessageStore();
                    messageStore.setMessagesByConsultation(consultation.id, consultation.messages || []);
                    messageStore.listenForMessages(consultation.id);
                    this.listenForConsultationUpdates();
                    navigateTo('/consultations')
                }
            } catch (error) {
                console.error('Error accepting consultation:', error);
            }
        },
        // async acceptConsultation(consultationId) {
        //     const config = useRuntimeConfig();
        //     try {
        //         const data = await $fetch(`/consultations/${consultationId}/accept`, {
        //             method: 'POST',
        //             headers: { 'Authorization': `Bearer ${useToken().get()}` },
        //             baseURL: config.public.apiBase,
        //         });

        //         if (data.consultation) {
        //             if (this.activeConsultation) {

        //                 this.expertConsultations.push(data.consultation);
        //             } else {

        //                 this.activeConsultation = data.consultation;
        //             }
        //             const messageStore = useMessageStore();
        //             messageStore.setMessages(data.consultation.messages || []);
        //             messageStore.listenForMessages(consultationId);
        //             messageStore.showChat = true;

        //         }
        //     } catch (error) {
        //         console.error('Error accepting consultation:', error);
        //     }
        // },
        async endConsultation(consultationId) {
            const config = useRuntimeConfig();
            try {
                const data = await $fetch(`/consultations/${consultationId}/end`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${useToken().get()}`,
                        'Content-Type': 'application/json',
                    },
                    baseURL: config.public.apiBase,
                });

                // If ending as a user
                if (this.activeConsultation?.id === consultationId) {
                    this.activeConsultation.status = 'completed';
                }

                // If ending as a doctor
                const idx = this.expertConsultations.findIndex(c => c.id === consultationId);
                if (idx !== -1) {
                    this.expertConsultations[idx].status = 'completed';
                }

                console.log('Consultation ended:', data);
            } catch (error) {
                console.error('Error ending consultation:', error);
            }
        },
        async takeOverChat(consultationId) {
            const config = useRuntimeConfig()
            try {
                const data = await $fetch(`/consultations/${consultationId}/takeover`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${useToken().get()}`,
                        'Content-Type': 'application/json',
                    },
                    baseURL: config.public.apiBase,
                }
                );

                console.log(data)

            } catch (error) {
                console.error('Error ending consultation:', error);
            }
        },
        setActiveConsultationForExpert(consultationId) {
            const consultation = this.expertConsultations.find(c => c.id === consultationId);
            if (consultation) {
                this.activeExpertConsultation = consultation;
            }
        },
        listenForConsultationUpdates() {
            console.log("listening for updates");

            // Listen for consultation updates on the private channel
            window.Echo.private('consultations.' + this.activeConsultation.id)
                .listen('.consultation.updated', (event) => {
                    console.log("Consultation updated:", event.consultation);

                    // Check if the consultation is in expertConsultations array and update it
                    const expertConsultationIndex = this.expertConsultations.findIndex(c => c.id === event.consultation.id);
                    if (expertConsultationIndex !== -1) {
                        this.expertConsultations[expertConsultationIndex] = event.consultation;
                    }

                    // Also check if the consultation is in the general consultations array and update it
                    const consultationIndex = this.consultations.findIndex(c => c.id === event.consultation.id);
                    if (consultationIndex !== -1) {
                        this.consultations[consultationIndex] = event.consultation;
                    }

                    // Finally, update the active consultation if it's the one being updated
                    if (this.activeConsultation?.id === event.consultation.id) {
                        this.activeConsultation = event.consultation;
                    }

                    if (this.activeExpertConsultation?.id === event.consultation?.id) {
                        this.activeExpertConsultation = event.consultation
                    }
                });
        }
    },

    persist: true
});



// import { defineStore } from 'pinia';
// import { useRuntimeConfig } from '#app';

// export const useConsultationStore = defineStore('consultation', {
//     state: () => ({
//         consultations: [],
//         activeConsultation: null,
//         messages: [],
//         unreadConsultations: [],
//         popupNotifications: [],
//         showChat: false
//     }),

//     actions: {
//         async requestConsultation() {
//             const config = useRuntimeConfig();
//             try {
//                 console.log(useToken().get());
//                 const data = await $fetch('/consultations/request', {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${useToken().get()}`,
//                         'Content-Type': 'application/json',
//                         'Accept': 'application/json',
//                     },
//                     baseURL: config.public.apiBase,
//                 });
//                 this.activeConsultation = data.consultation;
//             } catch (error) {
//                 console.error('Error requesting consultation:', error);
//             }
//         },
//         async acceptConsultation(consultationId) {
//             const config = useRuntimeConfig();
//             try {
//                 const data = await $fetch(`/consultations/${consultationId}/accept`, {
//                     method: 'POST',
//                     headers: { 'Authorization': `Bearer ${useToken().get()}` },
//                     baseURL: config.public.apiBase,
//                 });

//                 this.activeConsultation = data.consultation;
//                 this.messages = data.consultation.messages || [];
//                 this.unreadConsultations = this.unreadConsultations.filter(
//                     c => c.id !== consultationId
//                 );

//                 this.listenForMessages();
//                 this.showChat = true;
//             } catch (error) {
//                 console.error('Error accepting consultation:', error);
//             }
//         },
//         async sendMessage(message) {
//             if (!message.trim()) return;

//             const config = useRuntimeConfig();
//             try {
//                 await $fetch(`/consultations/${this.activeConsultation.id}/message`, {
//                     method: 'POST',
//                     headers: { 'Authorization': `Bearer ${useToken().get()}` },
//                     baseURL: config.public.apiBase,
//                     body: { message },
//                 });

//                 // ✅ Do NOT push message manually; Laravel Echo will handle it
//             } catch (error) {
//                 console.error("Error sending message:", error);
//             }
//         },

//         listenForMessages() {
//             if (!this.activeConsultation) return;

//             // Unbind previous listener to avoid duplication
//             window.Echo.leave(`consultations.${this.activeConsultation.id}`);

//             console.log(`Listening to consultations.${this.activeConsultation.id}`);
//             window.Echo.private(`consultations.${this.activeConsultation.id}`)
//                 .listen('.message.sent', (event) => {
//                     console.log("A new message was received:", event.message);
//                     if (!this.messages.some((m, index) =>
//                         m.sender === event.message.sender &&
//                         m.message === event.message.message &&
//                         Math.abs(new Date(m.timestamp) - new Date(event.message.timestamp)) < 1000 && // Allow 1 sec difference
//                         index !== this.messages.length - 1 // Ensures it's not blocking sequential messages
//                     )) {
//                         this.messages.push(event.message);
//                     }


//                 });
//         },
//         listenForNewConsultations() {
//             console.log("Listening for new consultations");

//             window.Echo.private('consultations')
//                 .listen('.consultation.requested', (event) => {
//                     this.unreadConsultations.push(event.consultation);
//                     this.showPopupNotification(event.consultation);
//                 })
//                 .listen('.consultation.accepted', (event) => {
//                     this.unreadConsultations = this.unreadConsultations.filter(
//                         c => c.id !== event.consultation.id
//                     );
//                 });
//         },
//         async fetchNotifications() {
//             const config = useRuntimeConfig();
//             try {
//                 const response = await $fetch('/user/notifications', {
//                     method: 'GET',
//                     headers: { 'Authorization': `Bearer ${useToken().get()}` },
//                     baseURL: config.public.apiBase,
//                 });

//                 // 🏷️ Add a flag for dynamic buttons
//                 this.unreadConsultations = response.unread_notifications.map(n => ({
//                     id: n.id,
//                     data: n.data, // ✅ Keep full `data` object
//                     hasActions: n.data.type === 'consultation' // ✅ Ensure only consultations get buttons
//                 }));

//             } catch (error) {
//                 console.error("Error fetching notifications:", error);
//             }
//         },

//         showPopupNotification(notification) {
//             const popup = { ...notification, hasActions: notification.type === 'consultation' };
//             this.popupNotifications.push(popup);

//             // ⏳ Automatically remove after 5 seconds
//             setTimeout(() => {
//                 this.popupNotifications = this.popupNotifications.filter(n => n.id !== notification.id);
//             }, 5000);
//         },

//         dismissPopupNotification(notificationId) {
//             this.popupNotifications = this.popupNotifications.filter(n => n.id !== notificationId);
//         },

//         async dismissNotification(notificationId) {
//             const config = useRuntimeConfig();
//             try {
//                 await $fetch(`/user/notifications/${notificationId}/mark-as-read`, {
//                     method: 'POST',
//                     headers: { 'Authorization': `Bearer ${useToken().get()}` },
//                     baseURL: config.public.apiBase,
//                 });

//                 // ✅ Remove the notification from the list after marking it as read
//                 this.unreadConsultations = this.unreadConsultations.filter(n => n.id !== notificationId);
//             } catch (error) {
//                 console.error("Error dismissing notification:", error);
//             }
//         },



//         notifyDoctor(consultation) {
//             if (Notification.permission === "default") {
//                 Notification.requestPermission().then((permission) => {
//                     if (permission === "granted") {
//                         this.showNotification(consultation);
//                     }
//                 });
//             } else if (Notification.permission === "granted") {
//                 this.showNotification(consultation);
//             }
//         },
//         showNotification(consultation) {
//             new Notification("New Consultation Request", {
//                 body: `Patient: ${consultation.user_id}`,
//                 icon: "/icons/notification-icon.png"
//             });
//         },
//         showPopupNotification(consultation) {
//             const notification = {
//                 id: consultation.id,
//                 type: 'consultation',
//                 message: `New consultation request from Patient ${consultation.user_id}`,
//                 timestamp: new Date(),
//             };

//             this.popupNotifications.push(notification);

//             setTimeout(() => {
//                 this.popupNotifications = this.popupNotifications.filter(n => n.id !== consultation.id);
//             }, 10000); // ⏳ Automatically remove after 10 seconds
//         },
//     }
// });
