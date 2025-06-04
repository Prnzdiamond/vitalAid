import { defineStore } from "pinia";
import { useRuntimeConfig } from "#app";
import { useToken } from "~/composables/useToken";

export const useNotificationStore = defineStore("notification", {
    state: () => ({
        unreadNotifications: [],
        popupNotifications: [],
        shownDesktopNotifications: new Set(), // Track shown desktop notifications to prevent duplicates
    }),

    getters: {
        consultationNotifications: state => state.unreadNotifications.filter(n => n.data.type === 'consultation'),
        followUpNotifications: state => state.unreadNotifications.filter(n => n.data.type === 'follow_up'),
        ratingNotifications: state => state.unreadNotifications.filter(n => n.data.type === 'rating'),
        generalNotifications: state => state.unreadNotifications.filter(n => n.data.type === 'general'),
        otherNotifications: state => state.unreadNotifications.filter(n =>
            !['consultation', 'follow_up', 'rating', 'general'].includes(n.data.type)
        ),
    },

    actions: {
        async fetchNotifications() {
            const config = useRuntimeConfig();
            try {
                const response = await $fetch("/user/notifications", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                this.unreadNotifications = response.data.unread_notifications.map((n) => ({
                    id: n.id,
                    data: n.data,
                    hasActions: ['consultation', 'follow_up'].includes(n.data.type),
                    type: n.type,
                    hasLink: Boolean(n.data.extra?.route),
                    route: n.data.extra?.route || null,
                    createdAt: n.created_at,
                }));
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        },
        async markAllasRead() {
            const config = useRuntimeConfig();
            try {
                await $fetch(`/user/notifications/mark-all-read`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });

                // Clear all unread notifications
                this.unreadNotifications = [];

                // Also clear any matching popup notifications
                this.popupNotifications = [];

                // Clear desktop notification tracking
                this.shownDesktopNotifications.clear();
            } catch (error) {
                console.error("Error marking all notifications as read:", error);
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
                // Also remove from popup notifications if present
                this.dismissPopupNotification(notificationId);
                // Remove from desktop notification tracking
                this.shownDesktopNotifications.delete(notificationId);
            } catch (error) {
                console.error("Error dismissing notification:", error);
            }
        },

        dismissPopupNotification(notificationId) {
            this.popupNotifications = this.popupNotifications.filter((n) => n.id !== notificationId);
            // Remove from desktop notification tracking
            this.shownDesktopNotifications.delete(notificationId);
        },

        notifyDoctor(notificationData) {
            // Add to unreadNotifications if it has an ID
            if (notificationData.id) {
                // Check if notification already exists to avoid duplicates
                const exists = this.unreadNotifications.some(n => n.id === notificationData.id);
                if (!exists) {
                    const newNotification = {
                        id: notificationData.id,
                        data: notificationData.data || notificationData,
                        hasActions: ['consultation', 'follow_up'].includes(notificationData.data?.type || notificationData.type),
                        hasLink: Boolean(notificationData.data?.extra?.route || notificationData.extra?.route),
                        route: notificationData.data?.extra?.route || notificationData.extra?.route || null,
                        createdAt: new Date().toISOString(),
                    };
                    this.unreadNotifications.push(newNotification);
                }
            }

            // Show browser notification only if we haven't shown it before
            const notificationId = notificationData.id || notificationData.data?.id;
            if (!this.shownDesktopNotifications.has(notificationId)) {
                this.shownDesktopNotifications.add(notificationId);

                if (Notification.permission === "default") {
                    Notification.requestPermission().then((permission) => {
                        if (permission === "granted") {
                            this.showNotification(notificationData);
                        }
                    });
                } else if (Notification.permission === "granted") {
                    this.showNotification(notificationData);
                }
            }
        },

        showNotification(notificationData) {
            if (!("Notification" in window)) {
                console.warn("Browser does not support notifications.");
                return;
            }

            let title, body, icon;
            const notificationType = notificationData.data?.type || notificationData.type;

            // Handle different notification types
            switch (notificationType) {
                case 'consultation':
                    title = "New Consultation Request";
                    body = `Patient: ${notificationData.data?.user_tag || notificationData.user_tag}`;
                    icon = "/icons/consultation-icon.png";
                    break;
                case 'follow_up':
                    title = "Follow-up Request";
                    body = `${notificationData.data?.requester_tag || notificationData.requester_tag} has requested a follow-up`;
                    icon = "/icons/follow-up-icon.png";
                    break;
                case 'rating':
                    title = "New Consultation Rating";
                    body = `You received a ${notificationData.data?.rating || notificationData.rating}-star rating`;
                    icon = "/icons/rating-icon.png";
                    break;
                case 'general':
                    title = notificationData.data?.title || notificationData.title || "New Notification";
                    body = notificationData.data?.body || notificationData.body || "";
                    icon = "/icons/notification-icon.png";
                    break;
                default:
                    // Handle any notification type
                    title = notificationData.data?.title || notificationData.title || "New Notification";
                    body = notificationData.data?.body || notificationData.body || notificationData.data?.message || notificationData.message || "";
                    icon = "/icons/notification-icon.png";
            }

            const notification = new Notification(title, {
                body,
                icon,
            });

            notification.onclick = (event) => {
                window.focus();

                const id = notificationData.id || notificationData.data?.id;
                const type = notificationData.data?.type || notificationData.type;
                const route = notificationData.data?.extra?.route || notificationData.extra?.route;

                if (type === 'consultation' && event.action === "accept") {
                    this.acceptConsultation(id);
                } else if (type === 'follow_up' && event.action === "accept") {
                    this.acceptFollowUp(id);
                } else if (route) {
                    // Navigate to the specified route
                    window.location.href = route;
                } else {
                    this.dismissPopupNotification(id);
                }
            };
        },

        showPopupNotification(notificationData) {
            const type = notificationData.data?.type || notificationData.type;
            const id = notificationData.id || notificationData.data?.id;
            let message, hasLink = false, route = null, title = "";

            // Check if it's a Laravel notification type that needs to be normalized
            const isLaravelNotification = type && type.startsWith('App\\Notifications\\');

            if (isLaravelNotification) {
                // For Laravel notifications, use the data directly
                title = notificationData.data?.title || notificationData.title || "";
                message = notificationData.data?.body || notificationData.body || "";
                hasLink = Boolean(notificationData.data?.extra?.route || notificationData.extra?.route);
                route = notificationData.data?.extra?.route || notificationData.extra?.route || null;
            } else {
                // Set message based on notification type
                switch (type) {
                    case 'consultation':
                        message = `New consultation request from Patient ${notificationData.data?.user_tag || notificationData.user_tag}`;
                        break;
                    case 'follow_up':
                        message = `${notificationData.data?.requester_tag || notificationData.requester_tag} has requested a follow-up consultation`;
                        break;
                    case 'rating':
                        message = `You received a ${notificationData.data?.rating || notificationData.rating}-star rating for a consultation`;
                        break;
                    case 'general':
                        title = notificationData.data?.title || notificationData.title || "";
                        message = notificationData.data?.body || notificationData.body || "";
                        hasLink = Boolean(notificationData.data?.extra?.route || notificationData.extra?.route);
                        route = notificationData.data?.extra?.route || notificationData.extra?.route || null;
                        break;
                    default:
                        title = notificationData.data?.title || notificationData.title || "";
                        message = notificationData.data?.body || notificationData.body || notificationData.data?.message || notificationData.message || "New notification";
                        hasLink = Boolean(notificationData.data?.extra?.route || notificationData.extra?.route);
                        route = notificationData.data?.extra?.route || notificationData.extra?.route || null;
                }
            }

            // Check if notification already exists in popup to avoid duplicates
            const exists = this.popupNotifications.some(n => n.id === id);
            if (!exists) {
                const notification = {
                    id,
                    type: isLaravelNotification ? 'general' : type, // Normalize Laravel notification types
                    message,
                    timestamp: new Date(),
                    hasActions: ['consultation', 'follow_up'].includes(type),
                    hasLink,
                    route,
                    title,
                    data: notificationData.data || notificationData
                };

                this.popupNotifications.push(notification);

                // Auto-dismiss after 10 seconds
                setTimeout(() => {
                    this.popupNotifications = this.popupNotifications.filter((n) => n.id !== id);
                }, 10000);
            }

            // Add to the unreadNotifications state and show desktop notification
            // But only call notifyDoctor for consultation/follow_up/rating types to avoid duplicate desktop notifications
            if (['consultation', 'follow_up', 'rating'].includes(type)) {
                this.notifyDoctor(notificationData);
            } else {
                // For general notifications, just add to unread without desktop notification
                // since desktop notification is handled elsewhere for general notifications
                if (notificationData.id) {
                    const exists = this.unreadNotifications.some(n => n.id === notificationData.id);
                    if (!exists) {
                        const newNotification = {
                            id: notificationData.id,
                            data: notificationData.data || notificationData,
                            hasActions: false,
                            hasLink: Boolean(notificationData.data?.extra?.route || notificationData.extra?.route),
                            route: notificationData.data?.extra?.route || notificationData.extra?.route || null,
                            createdAt: new Date().toISOString(),
                        };
                        this.unreadNotifications.push(newNotification);
                    }
                }
            }
        },

        handleGeneralNotification(notification) {
            console.log(notification)
            // Extract real notification type if it's a Laravel notification
            const notificationType = notification.type || notification.data?.type;
            console.log("notttiit", notificationType)
            const isLaravelNotification = notificationType && notificationType.startsWith('App\\Notifications\\');

            // Process and normalize the notification data
            const processedNotification = {
                id: notification.id,
                type: isLaravelNotification ? 'general' : (notification.data?.type || 'general'),
                title: notification.title || '',
                body: notification.body || '',
                extra: notification.extra || {},
                data: notification.data || {}
            };

            console.log("heeel" + processedNotification)

            // Show the notification popup
            this.showPopupNotification(processedNotification);

            // Show desktop notification for general notifications
            // Check if we haven't shown this desktop notification before
            const notificationId = notification.id;
            if (!this.shownDesktopNotifications.has(notificationId)) {
                this.shownDesktopNotifications.add(notificationId);

                if (Notification.permission === "granted") {
                    this.showNotification(processedNotification);
                } else if (Notification.permission === "default") {
                    Notification.requestPermission().then((permission) => {
                        if (permission === "granted") {
                            this.showNotification(processedNotification);
                        }
                    });
                }
            }
        }
    },
});