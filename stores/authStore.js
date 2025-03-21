import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useRuntimeConfig } from "#app";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: process.client ? JSON.parse(localStorage.getItem("user")) || null : null,
        token: process.client ? localStorage.getItem("token") || '""'.replace(/^"|"$/g, "") : "",
    }),

    getters: {
        isAuthenticated: () => {
            return process.client ? !!JSON.parse(localStorage.getItem("loginState")) : false;
        },

        getToken: () => {
            return process.client ? localStorage.getItem("token") || "" : "";
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

                console.log("Login response:", response);

                if (response.success) {
                    this.token = response.token;
                    this.user = response.user;

                    localStorage.setItem("loginState", true);
                    localStorage.setItem("token", response.token);
                    localStorage.setItem("user", JSON.stringify(response.user));
                }

                return {
                    message: "Login successful",
                    success: true,
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

            const url_token = this.token

            try {
                const config = useRuntimeConfig();
                const response = await $fetch("/user", {
                    headers: { Authorization: `Bearer ${url_token}` },
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

                this.$patch({
                    token: "",
                    user: null,
                });

                if (process.client) {
                    localStorage.removeItem("loginState");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }

                const router = useRouter();
                router.push("/login");
            } catch (error) {
                console.error("Logout failed:", error);
            }
        },
        restoreSession() {
            if (process.client) {
                this.token = localStorage.getItem("token") || "";
                this.user = JSON.parse(localStorage.getItem("user")) || null;
            }
        },
    },

    persist: true,
});
