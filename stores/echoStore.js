import { defineStore } from 'pinia';
import { useNotificationStore } from './notificationStore';

export const useEchoStore = defineStore('echo', {
    actions: {
        listenForNewConsultations() {
            console.log("Listening for new consultations");
            const notificationStore = useNotificationStore();

            window.Echo.private('consultations')
                .listen('.consultation.requested', (event) => {
                    notificationStore.unreadNotifications.push(event.consultation);
                    notificationStore.showPopupNotification(event.consultation);
                    notificationStore.notifyDoctor(event.consultation)
                })
                .listen('.consultation.accepted', (event) => {
                    notificationStore.unreadNotifications = notificationStore.unreadNotifications.filter(
                        c => c.id !== event.consultation.id
                    );
                });
        }
    }
});
