// ~/stores/auth.js
import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { useRuntimeConfig } from "#app";
import initEcho from "~/plugins/echo.client"; // Import Echo reinitialization
import { useNuxtApp } from '#app';

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        token: "",
        loggedIn: false,
    }),

    getters: {
        isAuthenticated(state) {
            return state.loggedIn && !!state.token;
        },

        getToken(state) {
            return state.token;
        },

        getUser(state) {
            return state.user;
        },
    },

    actions: {
        async login(data) {
            if (!data.email_tag || !data.password) {
                return {
                    message: "Email or password is required",
                    success: false,
                };
            }

            try {
                const config = useRuntimeConfig();
                const response = await $fetch("/login", {
                    method: "POST",
                    baseURL: config.public.apiBase,
                    headers: {
                        Accept: "application/json",
                    },
                    body: data,
                });

                if (response.success) {
                    this.token = response.data.token;
                    this.user = response.data.user;
                    this.loggedIn = true;

                    // Save to localStorage
                    localStorage.setItem("loginState", "true");
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("user", JSON.stringify(response.data.user));

                    // Reinitialize Echo with the new token
                    initEcho(response.data.token);

                    return {
                        message: response.message,
                        success: true,
                    };
                } else {
                    return {
                        message: response.message || "Login failed",
                        success: false,
                        errors: response.errors, // Capture backend validation errors
                    };
                }
            } catch (e) {
                console.error("Login failed:", e);
                return {
                    message: e.data?.message || e.message || "Login failed",
                    success: false,
                    errors: e.data?.errors || {}, // Capture validation errors if they exist
                };
            }

        },

        async fetchUser() {
            if (!this.token) {
                console.error("No token available");
                return;
            }

            try {
                const config = useRuntimeConfig();
                const response = await $fetch("/user", {
                    headers: { Authorization: `Bearer ${this.token}` },
                    baseURL: config.public.apiBase,
                });

                if (response.success) {
                    this.user = response.data.user;
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        },

        async logout() {
            try {
                const config = useRuntimeConfig();
                const { $toast } = useNuxtApp();
                await $fetch("/logout", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${this.token}` },
                    baseURL: config.public.apiBase,
                });

                // Clear state
                this.$patch({
                    token: "",
                    user: null,
                    loggedIn: false,
                });

                // Clear localStorage
                localStorage.removeItem("loginState");
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                // Reinitialize Echo with an empty token (or nullify it)
                initEcho(""); // Reinitialize Echo without a token to disconnect
            } catch (error) {
                console.error("Logout failed:", error);
                const { $toast } = useNuxtApp();
                $toast.error(error.data?.message || "Logout failed");
            }
        },

        restoreSession() {
            if (process.client) {
                const token = localStorage.getItem("token") || "";
                const userString = localStorage.getItem("user");
                let user = null;
                if (userString) {
                    try {
                        user = JSON.parse(userString);
                    } catch (e) {
                        console.error("Error parsing user from localStorage:", e);
                        // Optionally, you could clear the invalid data from localStorage here
                        localStorage.removeItem("user");
                    }
                }
                const loginStateString = localStorage.getItem("loginState");
                const loginState = loginStateString ? JSON.parse(loginStateString) : false;

                this.token = token;
                this.user = user;
                this.loggedIn = !!loginState;
            }
        },

        persist: true
    },
});