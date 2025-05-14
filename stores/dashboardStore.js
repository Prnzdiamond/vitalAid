// ~/stores/dashboard.js
import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";
import { useRuntimeConfig } from "#app";
import { useNuxtApp } from '#app';

export const useDashboardStore = defineStore("dashboard", {
    state: () => ({
        dashboardData: {},
        isLoading: false,
        error: null,
    }),

    getters: {
        getDashboardData(state) {
            return state.dashboardData;
        },

        getLoading(state) {
            return state.isLoading;
        },

        getError(state) {
            return state.error;
        }
    },

    actions: {
        async fetchDashboardData() {
            this.isLoading = true;
            this.error = null;

            try {
                const authStore = useAuthStore();

                if (!authStore.isAuthenticated) {
                    throw new Error("User not authenticated");
                }

                const config = useRuntimeConfig();
                const response = await $fetch("/dashboard", {
                    method: "GET",
                    baseURL: config.public.apiBase,
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${authStore.getToken}`
                    }
                });

                if (response.success) {
                    this.dashboardData = response.data;
                    return response.data;
                } else {
                    throw new Error(response.message || "Failed to fetch dashboard data");
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                this.error = error.message || "An error occurred while fetching dashboard data";
                const { $toast } = useNuxtApp();
                if ($toast) {
                    $toast.error(this.error);
                }
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        clearDashboardData() {
            this.dashboardData = {};
            this.error = null;
        },

        // Method to update specific dashboard data fields
        updateDashboardData(field, value) {
            if (this.dashboardData) {
                this.dashboardData[field] = value;
            }
        },

        // Method to refresh specific parts of the dashboard based on role
        async refreshDashboardSection(section) {
            try {
                const authStore = useAuthStore();

                if (!authStore.isAuthenticated) {
                    throw new Error("User not authenticated");
                }

                const config = useRuntimeConfig();
                const response = await $fetch(`/dashboard/${section}`, {
                    method: "GET",
                    baseURL: config.public.apiBase,
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${authStore.getToken}`
                    }
                });

                if (response.success) {
                    // Update only the specific section
                    this.dashboardData = {
                        ...this.dashboardData,
                        ...response.data
                    };
                    return response.data;
                } else {
                    throw new Error(response.message || `Failed to refresh ${section} data`);
                }
            } catch (error) {
                console.error(`Error refreshing ${section} data:`, error);
                this.error = error.message || `An error occurred while refreshing ${section} data`;
                throw error;
            }
        }
    },
});