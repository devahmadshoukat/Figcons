"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API_BASE_URL } from "@/commons/Api";

interface User {
    id: string;
    username: string;
    email: string;
    profileImage?: string;
    isGoogleUser: boolean;
    isPremium: boolean;
    lastLogin: string;
    createdAt: string;
    subscription?: {
        type: string;
        status: string;
        startDate?: string;
        expiryDate?: string;
        stripeSessionId?: string;
        lastPaymentDate?: string;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored auth data on mount
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userData');

        if (storedToken && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(userData);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('userData', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Auth utility functions
export const authUtils = {
    // Make authenticated API requests
    async apiRequest(url: string, options: RequestInit = {}) {
        const token = localStorage.getItem('authToken');
        
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Token expired or invalid, logout user
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = '/auth/signin';
            return null;
        }

        return response;
    },

    // Check if user is premium
    isPremium(): boolean {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.isPremium === true;
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        return false;
    },

    // Get current user
    getCurrentUser(): User | null {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        return null;
    },

    // Upgrade user to premium (call backend API)
    async upgradeToPremium(): Promise<boolean> {
        try {
            const response = await this.apiRequest(
                `${API_BASE_URL}/api/auth/upgrade-premium`,
                { method: 'POST' }
            );

            if (response && response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Update local storage with new user data
                    localStorage.setItem('userData', JSON.stringify(data.user));
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Premium upgrade error:', error);
            return false;
        }
    }
};
