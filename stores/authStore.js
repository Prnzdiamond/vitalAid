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
        verificationStatus: null,
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

        isVerified(state) {
            return state.user?.is_verified || false;
        },

        needsVerification(state) {
            return ['health_expert', 'charity', 'community'].includes(state.user?.role) && !state.user?.is_verified;
        },

        verificationProgress(state) {
            return state.user?.verification_progress || 0;
        },

        getVerificationStatus(state) {
            return state.verificationStatus;
        },

        hasCompleteDocuments(state) {
            return state.user?.verification_progress === 100;
        },

        missingDocuments(state) {
            return state.user?.missing_documents || {};
        },

        requiredDocuments(state) {
            return state.user?.required_documents || {};
        },

        optionalDocuments(state) {
            return state.verificationStatus?.optional_documents || {};
        },

        // Get current verification documents
        verificationDocuments(state) {
            return state.user?.verification_documents || {};
        },

        // Check if verification was rejected
        isVerificationRejected(state) {
            return state.user?.verification_status === 'rejected';
        },

        // Get rejection reason if exists
        verificationRejectionReason(state) {
            return state.user?.verification_rejection_reason || null;
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
                        errors: response.errors,
                    };
                }
            } catch (e) {
                console.error("Login failed:", e);
                return {
                    message: e.data?.message || e.message || "Login failed",
                    success: false,
                    errors: e.data?.errors || {},
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
                    verificationStatus: null,
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

        async updateProfile(profileData) {
            if (!this.token) {
                return {
                    message: "No authentication token available",
                    success: false,
                };
            }

            try {
                const config = useRuntimeConfig();
                const response = await $fetch("/user/update", {
                    method: "PUT",
                    baseURL: config.public.apiBase,
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${this.token}`,
                    },
                    body: profileData,
                });

                if (response.success) {
                    // Update the user data in the store
                    this.user = response.data.user;

                    // Update localStorage
                    localStorage.setItem("user", JSON.stringify(response.data.user));

                    return {
                        message: response.message,
                        success: true,
                        user: response.data.user,
                    };
                } else {
                    return {
                        message: response.message || "Profile update failed",
                        success: false,
                        errors: response.errors,
                    };
                }
            } catch (e) {
                console.error("Profile update failed:", e);
                return {
                    message: e.data?.message || e.message || "Profile update failed",
                    success: false,
                    errors: e.data?.errors || {},
                };
            }
        },

        // Updated methods for authStore.js - Replace the existing methods with these

        async submitVerification(documents) {
            if (!this.token) {
                return {
                    message: "No authentication token available",
                    success: false,
                };
            }

            try {
                const config = useRuntimeConfig();

                // Create FormData for file uploads
                const formData = new FormData();

                // Append each document file to FormData
                for (const [documentType, file] of Object.entries(documents)) {
                    if (file instanceof File) {
                        formData.append(`documents[${documentType}]`, file);
                    }
                }

                const response = await $fetch("/verification/submit", {
                    method: "POST",
                    baseURL: config.public.apiBase,
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        // Don't set Content-Type header, let browser set it with boundary for multipart/form-data
                    },
                    body: formData,
                });

                if (response.success) {
                    // Update the user data in the store
                    this.user = response.data.user;

                    // Update localStorage
                    localStorage.setItem("user", JSON.stringify(response.data.user));

                    // Update verification status if available
                    if (response.data.verification_progress !== undefined) {
                        if (!this.verificationStatus) {
                            this.verificationStatus = {};
                        }
                        this.verificationStatus.verification_progress = response.data.verification_progress;
                        this.verificationStatus.missing_documents = response.data.missing_documents;
                        this.verificationStatus.is_complete = response.data.is_complete;
                    }

                    return {
                        message: response.message,
                        success: true,
                        user: response.data.user,
                        verification_progress: response.data.verification_progress,
                        missing_documents: response.data.missing_documents,
                        is_complete: response.data.is_complete,
                        documents_submitted: response.data.documents_submitted,
                    };
                } else {
                    return {
                        message: response.message || "Verification submission failed",
                        success: false,
                        errors: response.errors,
                        invalid_documents: response.invalid_documents,
                        valid_document_types: response.valid_document_types,
                    };
                }
            } catch (e) {
                console.error("Verification submission failed:", e);
                return {
                    message: e.data?.message || e.message || "Verification submission failed",
                    success: false,
                    errors: e.data?.errors || {},
                    invalid_documents: e.data?.invalid_documents || [],
                    valid_document_types: e.data?.valid_document_types || [],
                };
            }
        },

        async updateVerificationDocument(documentType, document) {
            if (!this.token) {
                return {
                    message: "No authentication token available",
                    success: false,
                };
            }

            try {
                const config = useRuntimeConfig();

                // Create FormData for file upload
                const formData = new FormData();
                formData.append('document_type', documentType);

                if (document instanceof File) {
                    formData.append('document', document);
                } else {
                    throw new Error('Document must be a File object');
                }

                const response = await $fetch("/verification/document/update", {
                    method: "POST",
                    baseURL: config.public.apiBase,
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        // Don't set Content-Type header, let browser set it with boundary for multipart/form-data
                    },
                    body: formData,
                });

                if (response.success) {
                    // Update the user data in the store
                    this.user = response.data.user;

                    // Update localStorage
                    localStorage.setItem("user", JSON.stringify(response.data.user));

                    // Update verification status
                    if (!this.verificationStatus) {
                        this.verificationStatus = {};
                    }
                    this.verificationStatus.verification_progress = response.data.verification_progress;
                    this.verificationStatus.missing_documents = response.data.missing_documents;
                    this.verificationStatus.is_complete = response.data.is_complete;

                    return {
                        message: response.message,
                        success: true,
                        user: response.data.user,
                        verification_progress: response.data.verification_progress,
                        missing_documents: response.data.missing_documents,
                        is_complete: response.data.is_complete,
                        updated_document: response.data.updated_document,
                    };
                } else {
                    return {
                        message: response.message || "Document update failed",
                        success: false,
                        errors: response.errors,
                        valid_document_types: response.valid_document_types,
                    };
                }
            } catch (e) {
                console.error("Document update failed:", e);
                return {
                    message: e.data?.message || e.message || "Document update failed",
                    success: false,
                    errors: e.data?.errors || {},
                    valid_document_types: e.data?.valid_document_types || [],
                };
            }
        },

        async removeVerificationDocument(documentType) {
            if (!this.token) {
                return {
                    message: "No authentication token available",
                    success: false,
                };
            }

            try {
                const config = useRuntimeConfig();
                const response = await $fetch("/verification/document/remove", {
                    method: "DELETE",
                    baseURL: config.public.apiBase,
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${this.token}`,
                    },
                    body: {
                        document_type: documentType,
                    },
                });

                if (response.success) {
                    // Update the user data in the store
                    this.user = response.data.user;

                    // Update localStorage
                    localStorage.setItem("user", JSON.stringify(response.data.user));

                    // Update verification status
                    if (!this.verificationStatus) {
                        this.verificationStatus = {};
                    }
                    this.verificationStatus.verification_progress = response.data.verification_progress;
                    this.verificationStatus.missing_documents = response.data.missing_documents;
                    this.verificationStatus.is_complete = response.data.is_complete;

                    return {
                        message: response.message,
                        success: true,
                        user: response.data.user,
                        verification_progress: response.data.verification_progress,
                        missing_documents: response.data.missing_documents,
                        is_complete: response.data.is_complete,
                        removed_document: response.data.removed_document,
                    };
                } else {
                    return {
                        message: response.message || "Document removal failed",
                        success: false,
                        errors: response.errors,
                    };
                }
            } catch (e) {
                console.error("Document removal failed:", e);
                return {
                    message: e.data?.message || e.message || "Document removal failed",
                    success: false,
                    errors: e.data?.errors || {},
                };
            }
        },

        async fetchVerificationStatus() {
            if (!this.token) {
                console.error("No token available");
                return {
                    success: false,
                    message: "No authentication token available",
                };
            }

            try {
                const config = useRuntimeConfig();
                const response = await $fetch("/verification/status", {
                    headers: { Authorization: `Bearer ${this.token}` },
                    baseURL: config.public.apiBase,
                });

                if (response.success) {
                    this.verificationStatus = response.data;
                    return {
                        success: true,
                        data: response.data,
                    };
                } else {
                    return {
                        success: false,
                        message: response.message || "Failed to fetch verification status",
                    };
                }
            } catch (error) {
                console.error("Error fetching verification status:", error);
                return {
                    success: false,
                    message: error.data?.message || error.message || "Failed to fetch verification status",
                };
            }
        },

        async refreshUserData() {
            // Refresh both user data and verification status
            await this.fetchUser();
            if (this.needsVerification) {
                await this.fetchVerificationStatus();
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

                // Fetch verification status if user needs verification
                if (this.loggedIn && this.needsVerification) {
                    this.fetchVerificationStatus();
                }
            }
        },

        // Helper method to check if user can perform certain actions
        canPerformAction(action) {
            if (!this.isAuthenticated) return false;

            switch (action) {
                case 'create_consultation':
                    return this.user?.role === 'user' || this.user?.role === 'health_expert';
                case 'handle_consultation':
                    return this.user?.role === 'health_expert' && this.isVerified;
                case 'create_donation_request':
                    return this.user?.role === 'charity' && this.isVerified;
                case 'create_event':
                    return ['community', 'charity'].includes(this.user?.role) && this.isVerified;
                case 'join_community':
                    return this.user?.role !== 'community';
                default:
                    return true;
            }
        },

        // Helper method to get verification requirements for current user
        getVerificationRequirements() {
            if (!this.needsVerification) return null;

            return {
                role: this.user?.role,
                progress: this.verificationProgress,
                status: this.user?.verification_status,
                required_documents: this.requiredDocuments,
                missing_documents: this.missingDocuments,
                has_complete_documents: this.hasCompleteDocuments,
                optional_documents: this.optionalDocuments,
                verification_documents: this.verificationDocuments,
                is_rejected: this.isVerificationRejected,
                rejection_reason: this.verificationRejectionReason,
            };
        },

        // Helper method to check if a specific document exists
        hasDocument(documentType) {
            return !!(this.verificationDocuments[documentType]);
        },

        // Helper method to get a specific document
        getDocument(documentType) {
            return this.verificationDocuments[documentType] || null;
        },

        // Helper method to get all submitted document types
        getSubmittedDocumentTypes() {
            return Object.keys(this.verificationDocuments);
        },

        // Helper method to check if verification is in progress
        isVerificationPending() {
            return this.user?.verification_status === 'pending';
        },

        persist: true
    },
});