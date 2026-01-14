import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';

// Types
interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    groups?: string[];
    privileges?: string[];
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    register: (data: RegisterData) => Promise<void>;
    checkAuth: () => void;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    isAdmin: boolean;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is authenticated on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Check authentication status
    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing user data:', error);
                logout();
            }
        }
        setLoading(false);
    };

    // Login function
    const login = async (username: string, password: string) => {
        try {
            const response = await authAPI.login(username, password);
            const data = response.data.data;

            if (data?.token) {
                // Save token
                localStorage.setItem('token', data.token);

                // Create user object
                const userData: User = {
                    id: data.userId,
                    username: data.username,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    roles: data.roles || [],
                    groups: data.groups || [],
                    privileges: data.privileges || []
                };

                // Save user data
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('userType', userData.roles.includes('ADMIN') ? 'admin' : 'user');

                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        localStorage.removeItem('userUsername');
        setUser(null);
        setIsAuthenticated(false);
    };

    // Register function
    const register = async (data: RegisterData) => {
        try {
            await authAPI.register(data);
            // After successful registration, you might want to auto-login
            // or redirect to login page
        } catch (error: any) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    // Check if user has a specific role
    const hasRole = (role: string): boolean => {
        return user?.roles?.includes(role) || false;
    };

    // Check if user has any of the specified roles
    const hasAnyRole = (roles: string[]): boolean => {
        return roles.some(role => hasRole(role));
    };

    // Check if user is admin
    const isAdmin = hasRole('ADMIN');

    const value: AuthContextType = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
        checkAuth,
        hasRole,
        hasAnyRole,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
