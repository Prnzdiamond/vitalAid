import { defineStore } from "pinia";
import { useRuntimeConfig } from "#app";

export const useDonationStore = defineStore("donation", {
    actions: {
        // ✅ Fetch all donation requests
        async fetchDonationRequests() {
            const config = useRuntimeConfig();
            return await $fetch("/donations/request", {
                method: "GET",
                headers: { Authorization: `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
            });
        },

        // ✅ Fetch a specific donation request
        async fetchDonationRequest(id) {
            const config = useRuntimeConfig();
            return await $fetch(`/donations/request/${id}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
            });
        },

        // ✅ Create donation request (for orgs)
        async createDonationRequest(payload) {
            const config = useRuntimeConfig();
            const token = useToken();
            const formData = new FormData();

            // Append text fields from the payload
            for (const key in payload) {
                if (key === 'otherImageFiles' && Array.isArray(payload[key])) {
                    payload[key].forEach((file) => {
                        if (file instanceof File) {
                            formData.append('other_images[]', file);
                        }
                    });
                } else if (key === 'bannerFile' && payload[key] instanceof File) {
                    formData.append('banner_image', payload[key]);
                } else if (key !== 'bannerFile' && key !== 'otherImageFiles' && !Array.isArray(payload[key])) {
                    formData.append(key, payload[key]);
                }
            }

            try {
                const response = await $fetch("/donations/request", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token.get()}`,
                    },
                    body: formData,
                    baseURL: config.public.apiBase,
                });
                return response;
            } catch (error) {
                console.error("Error creating donation request:", error);
                throw error;
            }
        },

        async updateDonationRequest(id, payload) {
            const config = useRuntimeConfig();
            const token = useToken();
            const formData = new FormData();
            formData.append('_method', 'PATCH'); // To simulate PATCH request for FormData

            // Append text fields from the payload
            for (const key in payload) {
                if (key === 'otherImageFiles' && Array.isArray(payload[key])) {
                    payload[key].forEach((file) => {
                        if (file instanceof File) {
                            formData.append('other_images[]', file);
                        }
                    });
                } else if (key === 'bannerFile' && payload[key] instanceof File) {
                    formData.append('banner_image', payload[key]);
                } else if (key === 'banner_url' && payload[key]) { // Add this condition
                    formData.append('banner_url', payload[key]);
                }
                else if (key !== 'bannerFile' && key !== 'otherImageFiles' && key !== 'banner_url' && !Array.isArray(payload[key])) {
                    formData.append(key, payload[key]);
                }
            }

            try {
                const response = await $fetch(`/donations/request/${id}`, {
                    method: "POST", // Use POST with _method: PATCH for FormData
                    headers: {
                        Authorization: `Bearer ${token.get()}`,
                    },
                    body: formData,
                    baseURL: config.public.apiBase,
                });
                return response;
            } catch (error) {
                console.error("Error updating donation request:", error);
                throw error;
            }
        },

        // ✅ Delete donation request
        async deleteDonationRequest(id) {
            const config = useRuntimeConfig();
            return await $fetch(`/donations/request/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
            });
        },

        // ✅ Donate to a request - Initialize payment
        async donate(payload) {
            const config = useRuntimeConfig();
            return await $fetch("/donations/donate", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${useToken().get()}`,
                    "Content-Type": "application/json",
                },
                body: payload,
                baseURL: config.public.apiBase,
            });
        },

        // ✅ Verify donation payment status
        // Updated to handle the new flow where verification happens server-side first
        async verifyDonation(donationId) {
            const config = useRuntimeConfig();
            try {
                return await $fetch(`/donations/verify/${donationId}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${useToken().get()}` },
                    baseURL: config.public.apiBase,
                });
            } catch (error) {
                console.error("Error verifying donation:", error);
                throw error;
            }
        },

        // ✅ View my donations
        async fetchUserDonations() {
            const config = useRuntimeConfig();
            return await $fetch("/donations/user", {
                method: "GET",
                headers: { Authorization: `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
            });
        },

        // ✅ View donations made to an organization
        async fetchOrganizationDonations(orgId) {
            const config = useRuntimeConfig();
            return await $fetch(`/donations/organization/${orgId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
            });
        },

        // ✅ View donation requests created by an organization
        async fetchOrganizationRequests() {
            const config = useRuntimeConfig();
            return await $fetch("/donations/organization/requests", {
                method: "GET",
                headers: { Authorization: `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
            });
        },

        // ✅ View donations made to a specific request
        async fetchRequestDonations(requestId) {
            const config = useRuntimeConfig();
            return await $fetch(`/donations/request/${requestId}/donations`, {
                method: "GET",
                headers: { Authorization: `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
            });
        },

        async markAsCompleted(requestId) {
            const config = useRuntimeConfig();
            return await $fetch(`/donations/request/mark-as-complete/${requestId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
            });
        },

        // ✅ Request withdrawal (for organizations)
        async requestWithdrawal(payload) {
            const config = useRuntimeConfig();
            return await $fetch("/withdrawals/request", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${useToken().get()}`,
                    "Content-Type": "application/json",
                },
                body: payload,
                baseURL: config.public.apiBase,
            });
        },

        // ✅ Get organization's withdrawal history
        async fetchWithdrawals() {
            const config = useRuntimeConfig();
            return await $fetch("/withdrawals", {
                method: "GET",
                headers: { Authorization: `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
            });
        },

        // ✅ Get all withdrawals (for admin)
        async fetchAllWithdrawals() {
            const config = useRuntimeConfig();
            return await $fetch("/withdrawals/all", {
                method: "GET",
                headers: { Authorization: `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
            });
        },

        // ✅ Check withdrawal status
        async checkWithdrawalStatus(withdrawalId) {
            const config = useRuntimeConfig();
            return await $fetch(`/withdrawals/check/${withdrawalId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
            });
        },

        // ✅ Get list of banks for withdrawal
        async getBanks() {
            const config = useRuntimeConfig();
            return await $fetch("/withdrawals/banks", {
                method: "GET",
                headers: { Authorization: `Bearer ${useToken().get()}` },
                baseURL: config.public.apiBase,
            });
        },
    },
});