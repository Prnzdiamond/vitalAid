import { defineStore } from 'pinia';
import { useNotificationStore } from './notificationStore';
import { useAuthStore } from './authStore';

export const useEchoStore = defineStore('echo', {
    actions: {
        listenForNotifications() {
            console.log("Setting up notification listeners");
            const notificationStore = useNotificationStore();
            const authStore = useAuthStore();
            const user = authStore.user;

            if (!user) {
                console.log("No user found, skipping notification setup");
                return;
            }

            // Only set up consultation listeners for health experts
            if (user.role === 'health_expert') {
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

                        // Only process if user is involved in this consultation
                        if (this.isUserInvolvedInConsultation(event.consultation, user)) {
                            // Remove from notifications if present
                            notificationStore.unreadNotifications = notificationStore.unreadNotifications.filter(
                                n => !(n.data.type === 'consultation' && n.data.consultation_id === event.consultation.id)
                            );
                            notificationStore.dismissPopupNotification(event.consultation.id);
                        }
                    })
                    .listen('.consultation.rated', (event) => {
                        console.log("Consultation rated:", event);

                        // Only show to the health expert who handled the consultation
                        if (event.consultation.handled_by === user._tag || event.consultation.expert_id === user.id) {
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
                        }
                    })
                    .listen('.follow_up.requested', (event) => {
                        console.log("Follow-up requested:", event);

                        // Only show to the health expert who handled the original consultation
                        if (event.consultation.handled_by === user._tag || event.consultation.expert_id === user.id) {
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
                        }
                    })
                    .listen('.follow_up.accepted', (event) => {
                        console.log("Follow-up accepted:", event);

                        // Only process if user is involved in this consultation
                        if (this.isUserInvolvedInConsultation(event.consultation, user)) {
                            // Remove from notifications if present
                            notificationStore.unreadNotifications = notificationStore.unreadNotifications.filter(
                                n => !(n.data.type === 'follow_up' && n.data.consultation_id === event.consultation.id)
                            );
                            notificationStore.dismissPopupNotification(event.consultation.id);
                        }
                    });
            } else {
                console.log("User is not a health expert, skipping consultation notifications");
            }

            // Listen for user-specific notifications (for all users)
            window.Echo.private(`App.Models.User.${user.id}`)
                .notification((notification) => {
                    console.log('General notification received:', notification);
                    notificationStore.handleGeneralNotification(notification);
                });
        },

        // Helper method to check if user is involved in a consultation
        isUserInvolvedInConsultation(consultation, user) {
            return consultation.user_id === user.id || // User who requested the consultation
                consultation.handled_by === user._tag || // Expert handling the consultation
                consultation.expert_id === user.id; // Expert assigned to consultation
        },

        // For backward compatibility - but now with role checking
        listenForNewConsultations() {
            const authStore = useAuthStore();

            // Only health experts should listen for new consultations
            if (!authStore.user || authStore.user.role !== 'health_expert') {
                console.log('User is not a health expert, skipping consultation notifications');
                return;
            }

            console.log('Health expert listening for new consultations...');
            this.listenForNotifications();
        }
    }
});