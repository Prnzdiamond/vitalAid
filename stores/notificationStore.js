import { defineStore } from "pinia";
import { useRuntimeConfig } from "#app";

export const useNotificationStore = defineStore("notification", {
    state: () => ({
        unreadNotifications: [],
        popupNotifications: [],
    }),

    actions: {
        async fetchNotifications() {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch("/user/notifications", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                this.unreadNotifications = response.unread_notifications.map((n) => ({
                    id: n.id,
                    data: n.data,
                    hasActions: n.data.type === "consultation",
                }));
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        },

        async dismissNotification(notificationId) {
            const config = useRuntimeConfig();
            try {
                await $fetch(`/user/notifications/${notificationId}/mark-as-read`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                this.unreadNotifications = this.unreadNotifications.filter((n) => n.id !== notificationId);
            } catch (error) {
                console.error("Error dismissing notification:", error);
            }
        },

        dismissPopupNotification(notificationId) {
            this.popupNotifications = this.popupNotifications.filter((n) => n.id !== notificationId);
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
            if (!("Notification" in window)) {
                console.warn("Browser does not support notifications.");
                return;
            }

            const notification = new Notification("New Consultation Request", {
                body: `Patient: ${consultation.user_id}`,
                icon: "/icons/notification-icon.png",
            });

            notification.onclick = (event) => {
                if (event.action === "accept") {
                    this.acceptConsultation(consultation.id);
                } else {
                    this.dismissPopupNotification(consultation.id);
                }
            };
        },

        showPopupNotification(consultation) {
            const notification = {
                id: consultation.id,
                type: "consultation",
                message: `New consultation request from Patient ${consultation.user_id}`,
                timestamp: new Date(),
                hasActions: true, // Ensure accept button appears
            };

            this.popupNotifications.push(notification);

            setTimeout(() => {
                this.popupNotifications = this.popupNotifications.filter((n) => n.id !== consultation.id);
            }, 10000);
        },
    },
});
