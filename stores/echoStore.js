import { defineStore } from 'pinia';
import { useNotificationStore } from './notificationStore';
import { useAuthStore } from './authStore';

export const useEchoStore = defineStore('echo', {
    actions: {
        listenForNotifications() {
            console.log("Setting up notification listeners");
            const notificationStore = useNotificationStore();
            const user = useAuthStore().user;

            // Listen for all consultation-related events
            window.Echo.private('consultations')
                .listen('.consultation.requested', (event) => {
                    console.log("Consultation requested:", event);
                    notificationStore.showPopupNotification({
                        id: event.consultation.id,
                        type: 'consultation',
                        user_tag: event.consultation.user_tag || event.consultation.user?._tag,
                        data: event.consultation
                    });
                })
                .listen('.consultation.accepted', (event) => {
                    console.log("Consultation accepted:", event);
                    // Remove from notifications if present
                    notificationStore.unreadNotifications = notificationStore.unreadNotifications.filter(
                        n => !(n.data.type === 'consultation' && n.data.consultation_id === event.consultation.id)
                    );
                    notificationStore.dismissPopupNotification(event.consultation.id);
                })
                .listen('.consultation.rated', (event) => {
                    console.log("Consultation rated:", event);
                    notificationStore.showPopupNotification({
                        id: event.consultation.id,
                        type: 'rating',
                        rating: event.consultation.rating,
                        rater_tag: event.rater?._tag,
                        data: {
                            consultation_id: event.consultation.id,
                            type: 'rating',
                            rating: event.consultation.rating,
                            rater_tag: event.rater?._tag
                        }
                    });
                })
                .listen('.follow_up.requested', (event) => {
                    console.log("Follow-up requested:", event);
                    notificationStore.showPopupNotification({
                        id: event.consultation.id,
                        type: 'follow_up',
                        requester_tag: event.requester?._tag,
                        reason: event.consultation.follow_up_reason,
                        data: {
                            consultation_id: event.consultation.id,
                            type: 'follow_up',
                            requester_tag: event.requester?._tag,
                            reason: event.consultation.follow_up_reason
                        }
                    });
                })
                .listen('.follow_up.accepted', (event) => {
                    console.log("Follow-up accepted:", event);
                    // Remove from notifications if present
                    notificationStore.unreadNotifications = notificationStore.unreadNotifications.filter(
                        n => !(n.data.type === 'follow_up' && n.data.consultation_id === event.consultation.id)
                    );
                    notificationStore.dismissPopupNotification(event.consultation.id);
                });

            // Listen for general notifications
            window.Echo.private(`App.Models.User.${user.id}`)
                .notification((notification) => {
                    console.log('General notification received:', notification);
                    notificationStore.handleGeneralNotification(notification);
                });
        },

        // For backward compatibility
        listenForNewConsultations() {
            this.listenForNotifications();
        }
    }
});