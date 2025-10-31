// Base API URL
// export const API_BASE_URL = "http://localhost:5000";
export const API_BASE_URL = "https://figcons-backend.vercel.app";


// API Endpoints
const endpoints = {
    // Auth endpoints
    auth: {
        register: `${API_BASE_URL}/api/auth/register`,
        login: `${API_BASE_URL}/api/auth/login`,
        googleAuth: `${API_BASE_URL}/api/auth/google`,
        googleCallback: `${API_BASE_URL}/api/auth/google/callback`,
        profile: `${API_BASE_URL}/api/auth/profile`,
        updateProfile: `${API_BASE_URL}/api/auth/profile`, // PUT /api/auth/profile
        changePassword: `${API_BASE_URL}/api/auth/change-password`,
        verifyEmail: (token: string) => `${API_BASE_URL}/api/auth/verify-email/${token}`,
        resendVerification: `${API_BASE_URL}/api/auth/resend-verification`,
        deleteAccount: `${API_BASE_URL}/api/auth/account`, // DELETE /api/auth/account
    },
    // Icons endpoints
    icons: {
        getAll: `${API_BASE_URL}/api/icons`,
        getOrganized: `${API_BASE_URL}/api/icons/organized`,
        search: `${API_BASE_URL}/api/icons/search`,
        getById: (id: string) => `${API_BASE_URL}/api/icons/${id}`,
    },
    // Categories endpoints
    categories: {
        getAll: `${API_BASE_URL}/api/categories`,
        getById: (id: string) => `${API_BASE_URL}/api/categories/${id}`,
    },
    // Payment endpoints
    payment: {
        createYearlySubscription: `${API_BASE_URL}/api/payment/create-yearly-subscription`,
        createOnetimePayment: `${API_BASE_URL}/api/payment/create-onetime-payment`,
        confirmPayment: `${API_BASE_URL}/api/payment/confirm-payment`,
        cancelSubscription: `${API_BASE_URL}/api/payment/cancel-subscription`,
        pricingOptions: `${API_BASE_URL}/api/payment/pricing-options`,
        publishableKey: `${API_BASE_URL}/api/payment/publishable-key`,
        subscriptionStatus: `${API_BASE_URL}/api/payment/subscription-status`,
    },
    // Seat endpoints
    seats: {
        status: `${API_BASE_URL}/api/seats/status`,
        invite: `${API_BASE_URL}/api/seats/invite`,
        accept: (id: string) => `${API_BASE_URL}/api/seats/accept/${id}`,
        reject: (id: string) => `${API_BASE_URL}/api/seats/reject/${id}`,
        cancel: (id: string) => `${API_BASE_URL}/api/seats/cancel/${id}`,
        remove: (userId: string) => `${API_BASE_URL}/api/seats/remove/${userId}`,
        teamMembers: `${API_BASE_URL}/api/seats/team-members`,
        cancelSharedSeat: `${API_BASE_URL}/api/seats/cancel-shared-seat`,
        cancelSubscription: `${API_BASE_URL}/api/seats/cancel-subscription`,
    },
    // User profile endpoints
    user: {
        profile: `${API_BASE_URL}/api/user/profile`,
        updateSocial: `${API_BASE_URL}/api/user/profile/social`,
        changePassword: `${API_BASE_URL}/api/user/profile/password`,
    }
};

// Helper function to get auth token from localStorage
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

// Helper function to set auth token
export const setAuthToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
    }
};

// Helper function to remove auth token
export const removeAuthToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
};

// Helper function to make API requests with auth
const apiRequest = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge with any additional headers from options
    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// Auth API
export const authAPI = {
    // Register new user
    register: async (userData: {
        name: string;
        email: string;
        password: string;
    }) => {
        return apiRequest(endpoints.auth.register, {
            method: 'POST',
            body: JSON.stringify({
                username: userData.name, // Backend expects 'username', not 'name'
                email: userData.email,
                password: userData.password
            }),
        });
    },

    // Login user
    login: async (credentials: {
        email: string;
        password: string;
    }) => {
        return apiRequest(endpoints.auth.login, {
            method: 'POST',
            body: JSON.stringify({
                identifier: credentials.email, // Backend expects 'identifier' (email or username)
                password: credentials.password
            }),
        });
    },

    // Google OAuth - Redirect to Google
    googleAuth: () => {
        if (typeof window !== 'undefined') {
            window.location.href = endpoints.auth.googleAuth;
        }
    },

    // Get user profile
    getProfile: async () => {
        return apiRequest(endpoints.auth.profile, {
            method: 'GET',
        });
    },

    // Update user profile
    updateProfile: async (profileData: {
        username?: string;
        profileImage?: string;
    }) => {
        return apiRequest(endpoints.auth.updateProfile, {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },

    // Change password
    changePassword: async (passwordData: {
        currentPassword: string;
        newPassword: string;
    }) => {
        return apiRequest(endpoints.auth.changePassword, {
            method: 'PUT',
            body: JSON.stringify(passwordData),
        });
    },

    // Verify email
    verifyEmail: async (token: string) => {
        return apiRequest(endpoints.auth.verifyEmail(token), {
            method: 'GET',
        });
    },

    // Resend verification email
    resendVerification: async () => {
        return apiRequest(endpoints.auth.resendVerification, {
            method: 'POST',
        });
    },

    // Delete account
    deleteAccount: async () => {
        return apiRequest(endpoints.auth.deleteAccount, {
            method: 'DELETE',
        });
    },

    // Logout
    logout: () => {
        removeAuthToken();
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/signin';
        }
    },
};

// Icons API
export const iconsAPI = {
    // Get all icons with pagination
    getAll: async (params?: {
        category?: string;
        isPublic?: boolean;
        isPremium?: boolean;
        page?: number;
        limit?: number;
    }) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, String(value));
                }
            });
        }
        const url = `${endpoints.icons.getAll}?${queryParams.toString()}`;
        return apiRequest(url, { method: 'GET' });
    },

    // Get organized icons by category
    getOrganized: async (params?: {
        isPublic?: boolean;
        isPremium?: boolean;
    }) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, String(value));
                }
            });
        }
        const url = `${endpoints.icons.getOrganized}?${queryParams.toString()}`;
        return apiRequest(url, { method: 'GET' });
    },

    // Search icons
    search: async (query: string, filters?: {
        category?: string;
        isPublic?: boolean;
        isPremium?: boolean;
        limit?: number;
    }) => {
        const queryParams = new URLSearchParams({ q: query });
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, String(value));
                }
            });
        }
        const url = `${endpoints.icons.search}?${queryParams.toString()}`;
        return apiRequest(url, { method: 'GET' });
    },

    // Get icon by ID
    getById: async (id: string) => {
        return apiRequest(endpoints.icons.getById(id), { method: 'GET' });
    },
};

// Categories API
export const categoriesAPI = {
    // Get all categories
    getAll: async () => {
        return apiRequest(endpoints.categories.getAll, { method: 'GET' });
    },

    // Get category by ID
    getById: async (id: string) => {
        return apiRequest(endpoints.categories.getById(id), { method: 'GET' });
    },
};

// Payment API
export const paymentAPI = {
    // Create yearly subscription
    createYearlySubscription: async (data: {
        amount: number;
        planName: string;
        seats?: number;
        pricePerSeat?: number;
    }) => {
        return apiRequest(endpoints.payment.createYearlySubscription, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Create one-time payment
    createOnetimePayment: async (data: {
        amount: number;
        planName: string;
        isUpgrade?: boolean;
        seats?: number;
        pricePerSeat?: number;
    }) => {
        return apiRequest(endpoints.payment.createOnetimePayment, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Confirm payment
    confirmPayment: async (sessionId: string) => {
        return apiRequest(endpoints.payment.confirmPayment, {
            method: 'POST',
            body: JSON.stringify({ sessionId }),
        });
    },

    // Cancel subscription
    cancelSubscription: async () => {
        return apiRequest(endpoints.payment.cancelSubscription, {
            method: 'POST',
        });
    },

    // Get pricing options
    getPricingOptions: async () => {
        return apiRequest(endpoints.payment.pricingOptions, {
            method: 'GET',
        });
    },

    // Get Stripe publishable key
    getPublishableKey: async () => {
        return apiRequest(endpoints.payment.publishableKey, {
            method: 'GET',
        });
    },

    // Get subscription status
    getSubscriptionStatus: async () => {
        return apiRequest(endpoints.payment.subscriptionStatus, {
            method: 'GET',
        });
    },
};

// Seat API
export const seatAPI = {
    // Get seat status and invitations
    getStatus: async () => {
        return apiRequest(endpoints.seats.status, {
            method: 'GET',
        });
    },

    // Send seat invitation
    invite: async (receiverEmail: string) => {
        return apiRequest(endpoints.seats.invite, {
            method: 'POST',
            body: JSON.stringify({ receiverEmail }),
        });
    },

    // Accept seat invitation
    accept: async (invitationId: string) => {
        return apiRequest(endpoints.seats.accept(invitationId), {
            method: 'POST',
        });
    },

    // Reject seat invitation
    reject: async (invitationId: string) => {
        return apiRequest(endpoints.seats.reject(invitationId), {
            method: 'POST',
        });
    },

    // Cancel sent invitation
    cancel: async (invitationId: string) => {
        return apiRequest(endpoints.seats.cancel(invitationId), {
            method: 'POST',
        });
    },

    // Remove user from seat
    removeUser: async (userId: string) => {
        return apiRequest(endpoints.seats.remove(userId), {
            method: 'POST',
        });
    },

    // Get team members
    getTeamMembers: async () => {
        return apiRequest(endpoints.seats.teamMembers, {
            method: 'GET',
        });
    },

    // Cancel shared seat (for users using someone else's seat)
    cancelSharedSeat: async () => {
        return apiRequest(endpoints.seats.cancelSharedSeat, {
            method: 'POST',
        });
    },

    // Cancel subscription (for subscription owners - removes all shared seats)
    cancelSubscription: async () => {
        return apiRequest(endpoints.seats.cancelSubscription, {
            method: 'POST',
        });
    },
};

// User Profile API
export const userAPI = {
    // Get user profile
    getProfile: async () => {
        return apiRequest(endpoints.user.profile, {
            method: 'GET',
        });
    },

    // Update social profiles
    updateSocial: async (socialData: {
        website?: string;
        dribbble?: string;
        behance?: string;
        linkedin?: string;
        instagram?: string;
        facebook?: string;
    }) => {
        return apiRequest(endpoints.user.updateSocial, {
            method: 'PUT',
            body: JSON.stringify(socialData),
        });
    },

    // Change password
    changePassword: async (passwordData: {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    }) => {
        return apiRequest(endpoints.user.changePassword, {
            method: 'PUT',
            body: JSON.stringify(passwordData),
        });
    },
};

// Export everything
export { endpoints, API_BASE_URL as api };