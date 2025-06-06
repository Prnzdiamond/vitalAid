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
        // Updated login method for authStore.js
        // Replace the existing login method with this one

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
                    try {
                        initEcho(response.data.token);
                    } catch (error) {
                        console.warn("Echo initialization failed:", error);
                    }

                    // Handle redirect after login
                    let redirectPath = '/dashboard'; // default redirect

                    if (process.client) {
                        const storedRedirect = localStorage.getItem('redirectAfterLogin');
                        if (storedRedirect) {
                            redirectPath = storedRedirect;
                            localStorage.removeItem('redirectAfterLogin');
                        }
                    }

                    return {
                        message: response.message,
                        success: true,
                        redirectTo: redirectPath,
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

        // Updated logout method for authStore.js
        // Replace the existing logout method with this one

        async logout() {
            const config = useRuntimeConfig();
            const { $toast } = useNuxtApp();

            // Store current token before clearing
            const currentToken = this.token;

            // Always clear state and localStorage first
            this.clearAuthState();

            // Try to logout from backend, but don't block on failure
            if (currentToken) {
                try {
                    await $fetch("/logout", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${currentToken}` },
                        baseURL: config.public.apiBase,
                    });
                } catch (error) {
                    console.warn("Backend logout failed, but local logout completed:", error);
                    // Don't show error to user since local logout succeeded
                }
            }

            // Always reinitialize Echo without token
            try {
                initEcho("");
            } catch (error) {
                console.warn("Echo reinitialization failed:", error);
            }

            return {
                success: true,
                message: "Logged out successfully"
            };
        },

        // Add this new method to handle clearing auth state
        clearAuthState() {
            // Clear Pinia state
            this.$patch({
                token: "",
                user: null,
                loggedIn: false,
                verificationStatus: null,
            });

            // Clear localStorage
            if (process.client) {
                localStorage.removeItem("loginState");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("redirectAfterLogin"); // Clear any stored redirect
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

        // Add this improved restoreSession method to your authStore.js
        // Replace the existing restoreSession method with this one

        restoreSession() {
            if (!process.client) return false;

            try {
                const token = localStorage.getItem("token");
                const userString = localStorage.getItem("user");
                const loginStateString = localStorage.getItem("loginState");

                // If no token, clear everything and return false
                if (!token) {
                    this.clearAuthState();
                    return false;
                }

                let user = null;
                if (userString) {
                    try {
                        user = JSON.parse(userString);
                    } catch (e) {
                        console.error("Error parsing user from localStorage:", e);
                        // Clear invalid data
                        this.clearAuthState();
                        return false;
                    }
                }

                const loginState = loginStateString ? JSON.parse(loginStateString) : false;

                // Only restore if we have all required data
                if (token && user && loginState) {
                    this.token = token;
                    this.user = user;
                    this.loggedIn = true;

                    // Reinitialize Echo with restored token
                    try {
                        initEcho(token);
                    } catch (error) {
                        console.warn("Echo initialization failed during session restore:", error);
                    }

                    // Fetch verification status if user needs verification
                    if (this.needsVerification) {
                        this.fetchVerificationStatus().catch(error => {
                            console.warn("Failed to fetch verification status during restore:", error);
                        });
                    }

                    return true;
                } else {
                    // Clear incomplete data
                    this.clearAuthState();
                    return false;
                }
            } catch (error) {
                console.error("Error restoring session:", error);
                this.clearAuthState();
                return false;
            }
        },

        // Also add this helper method to check if session restoration is needed
        needsSessionRestore() {
            if (!process.client) return false;

            const hasStoredToken = !!localStorage.getItem("token");
            const hasStoredUser = !!localStorage.getItem("user");
            const hasStoredLoginState = !!localStorage.getItem("loginState");

            return hasStoredToken && hasStoredUser && hasStoredLoginState && !this.loggedIn;
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