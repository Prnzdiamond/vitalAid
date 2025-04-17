// ~/stores/auth.js
import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { useRuntimeConfig } from "#app";
import initEcho from "~/plugins/echo.client"; // Import Echo reinitialization

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
                    this.token = response.token;
                    this.user = response.user;
                    this.loggedIn = true;

                    // Save to localStorage
                    localStorage.setItem("loginState", "true");
                    localStorage.setItem("token", response.token);
                    localStorage.setItem("user", JSON.stringify(response.user));

                    // Reinitialize Echo with the new token
                    initEcho(response.token);

                    return {
                        message: "Login successful",
                        success: true,
                    };
                }

                return {
                    message: "Login failed",
                    success: false,
                };
            } catch (e) {
                console.error("Login failed:", e);
                return {
                    message: `Login failed: ${e.data?.message || e.message}`,
                    success: false,
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

                if (response) {
                    this.user = response.user;
                    localStorage.setItem("user", JSON.stringify(response.user));
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        },

        async logout() {
            try {
                const config = useRuntimeConfig();
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

                // Redirect to login
                const router = useRouter();
                router.push("/login");
            } catch (error) {
                console.error("Logout failed:", error);
            }
        },

        restoreSession() {
            if (process.client) {
                const token = localStorage.getItem("token") || "";
                const user = JSON.parse(localStorage.getItem("user")) || null;
                const loginState = JSON.parse(localStorage.getItem("loginState"));

                this.token = token;
                this.user = user;
                this.loggedIn = !!loginState;
            }
        },

        persist: true
    },
});
