'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api as apiCall } from '@/lib/api';
import { User as AuthUser } from '@/lib/types/auth';

/**
 * Constants for session management
 * Using a namespace to group related constants
 */
const AUTH_KEYS = {
  TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  SESSION_EXPIRY: 'session_expiry',
} as const;

/**
 * Session configuration
 */
const SESSION_CONFIG = {
  DURATION_DAYS: 30, // 30 days session
  VALIDATION_INTERVAL: 5 * 60 * 1000, // Check session every 5 minutes
} as const;

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSessionValidity: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/**
 * Secure storage operations with comprehensive error handling
 * This abstraction layer allows for easy replacement of storage mechanism
 * while maintaining the same API interface
 */
const secureStorage = {
  /**
   * Stores a value with the given key
   * @param key - The storage key
   * @param value - The value to store
   * @throws Error if storage operation fails
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') return;
      
      // For enhanced security, consider encrypting sensitive data before storage
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`SecureStorage: Error storing ${key}:`, error);
      throw new Error(`Failed to store data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Retrieves a value by key
   * @param key - The storage key
   * @returns The stored value or null if not found or error
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`SecureStorage: Error retrieving ${key}:`, error);
      return null;
    }
  },

  /**
   * Removes a value by key
   * @param key - The storage key to remove
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`SecureStorage: Error removing ${key}:`, error);
    }
  },

  /**
   * Clears all authentication-related data
   */
  clear: async (): Promise<void> => {
    try {
      if (typeof window === 'undefined') return;
      
      await Promise.allSettled([
        secureStorage.removeItem(AUTH_KEYS.TOKEN),
        secureStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN),
        secureStorage.removeItem(AUTH_KEYS.USER),
        secureStorage.removeItem(AUTH_KEYS.SESSION_EXPIRY),
      ]);
    } catch (error) {
      console.error('SecureStorage: Error clearing storage:', error);
    }
  }
};

/**
 * Helper function to get initial state from secure storage with session validation
 * @returns Initial authentication state
 */
const getInitialAuthState = async () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isValid: false };
  }
  
  try {
    // Retrieve all authentication data in parallel
    const [storedToken, storedUser, expiryString] = await Promise.all([
      secureStorage.getItem(AUTH_KEYS.TOKEN),
      secureStorage.getItem(AUTH_KEYS.USER),
      secureStorage.getItem(AUTH_KEYS.SESSION_EXPIRY),
    ]);
    
    // Check if all required authentication data exists
    if (!storedToken || !storedUser || !expiryString) {
      return { user: null, token: null, isValid: false };
    }
    
    // Validate session expiration
    const isValidSession = new Date(expiryString) > new Date();
    
    if (isValidSession) {
      // Parse and map the stored user data to the AuthUser type
      const parsedUser = JSON.parse(storedUser);
      const authUser: AuthUser = {
        id: parsedUser.id,
        uuid: parsedUser.uuid,
        first_name: parsedUser.first_name,
        last_name: parsedUser.last_name,
        email: parsedUser.email,
        is_login: parsedUser.is_login,
        created_at: parsedUser.createdAt ? new Date(parsedUser.createdAt) : undefined,
        updated_at: parsedUser.updatedAt ? new Date(parsedUser.updatedAt) : undefined,
      };
      
      return {
        token: storedToken,
        user: authUser,
        isValid: true
      };
    }
    
    // Session expired, clear stored data
    await secureStorage.clear();
    return { user: null, token: null, isValid: false };
  } catch (error) {
    console.error('Error reading from secure storage:', error);
    // Clear potentially corrupted data
    await secureStorage.clear();
    return { user: null, token: null, isValid: false };
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  /**
   * Validates the current session by checking expiration
   * @returns Promise resolving to true if session is valid, false otherwise
   */
  const checkSessionValidity = useCallback(async (): Promise<boolean> => {
    try {
      const expiryString = await secureStorage.getItem(AUTH_KEYS.SESSION_EXPIRY);
      if (!expiryString) return false;
      
      const isValid = new Date(expiryString) > new Date();
      
      if (!isValid) {
        console.log('Session expired, logging out...');
        await logout();
      }
      
      return isValid;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }, []);

  /**
   * Handles user logout by clearing storage and resetting state
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Attempt server logout if token exists
      if (token) {
        try {
          await apiCall.auth.logout(token);
        } catch (logoutError) {
          console.error('Server logout error:', logoutError);
          // Continue with client-side cleanup even if server logout fails
        }
      }
      
      // Clear all authentication data from secure storage
      await secureStorage.clear();
      
      // Reset state
      setUser(null);
      setToken(null);
      setError(null);
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force cleanup on error
      await secureStorage.clear();
      setUser(null);
      setToken(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [token, router]);

  /**
   * Handles user authentication
   * @param email - User's email address
   * @param password - User's password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiCall.auth.login(email, password);

      if (!response.data) {
        throw new Error('Login failed: No data received');
      }

      const { user: userData, access, refresh } = response.data;

      // Calculate session expiry
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + SESSION_CONFIG.DURATION_DAYS);

      // Map the server response to the AuthUser type
      const authUser: AuthUser = {
        id: userData.id,
        uuid: userData.uuid,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        is_login: userData.is_login,
        created_at: userData.created_at ? new Date(userData.created_at) : undefined,
        updated_at: userData.updated_at ? new Date(userData.updated_at) : undefined,
      };

      // Store all authentication data atomically
      await Promise.all([
        secureStorage.setItem(AUTH_KEYS.TOKEN, access.token),
        secureStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refresh.token),
        secureStorage.setItem(AUTH_KEYS.USER, JSON.stringify(authUser)),
        secureStorage.setItem(AUTH_KEYS.SESSION_EXPIRY, expiryDate.toISOString()),
      ]);

      // Update state
      setUser(authUser);
      setToken(access.token);
      
      // Redirect to dashboard
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(new Error(errorMessage));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize authentication state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { user: initialUser, token: initialToken, isValid } = await getInitialAuthState();
        
        if (isValid && initialUser && initialToken) {
          setUser(initialUser);
          setToken(initialToken);
          
          // Optional: Validate token with server
          // const isValidToken = await apiCall.auth.validateToken(initialToken);
          // if (!isValidToken) throw new Error('Token validation failed');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error instanceof Error ? error : new Error('Authentication initialization failed'));
        await secureStorage.clear();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Set up session validation on interval and window focus
  useEffect(() => {
    if (!token || !isInitialized) return;

    const validateSession = async () => {
      const isValid = await checkSessionValidity();
      if (!isValid) {
        console.log('Session invalid, redirecting to login');
        router.push('/login');
      }
    };

    // Validate session at regular intervals
    const interval = setInterval(validateSession, SESSION_CONFIG.VALIDATION_INTERVAL);
    
    // Validate session when window gains focus
    const handleFocus = () => validateSession();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [token, isInitialized, checkSessionValidity, router]);

  // Show loading state until authentication is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Provide authentication context to children
  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      error,
      signIn,
      logout,
      checkSessionValidity,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context
 * @returns Authentication context values
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



// 'use client';

// import { createContext, useContext, useEffect, useState, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { api as apiCall } from '@/service/api';
// import { User } from '@/types/auth';

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//    error: Error | null;
//   signIn: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//    const [error, setError] = useState<Error | null>(null);
//   const router = useRouter();

//   // Initialize auth state
//   useEffect(() => {
//     const initializeAuth = async () => {
//       const storedToken = localStorage.getItem('accessToken');
//       const storedUser = localStorage.getItem('user');

//       if (storedToken && storedUser) {
//         setToken(storedToken);
//         setUser(JSON.parse(storedUser));
//       }
//       setIsLoading(false);
//     };

//     initializeAuth();
//   }, []);

//   const signIn = async (email: string, password: string) => {
//     try {
//       setIsLoading(true);
//        setError(null);
//       const response = await apiCall.auth.login(email, password);

//       if (!response.data) {
//         throw new Error('Login failed');
//       }

//       const { user, access, refresh } = response.data;

//       // Store tokens and user data
//       localStorage.setItem('accessToken', access.token);
//       localStorage.setItem('refreshToken', refresh.token);
//       localStorage.setItem('user', JSON.stringify(user));

//       setUser(user);
//       setToken(access.token);
//       router.push('/admin/dashboard');
//     } catch (error) {
//       console.error('Login error:', error);
//     setError(error instanceof Error ? error : new Error('Login failed')); // Set the error
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = async () => {
//     try {
//       setIsLoading(true);
//       await apiCall.auth.logout(token || '');
      
//       // Clear storage
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       localStorage.removeItem('user');
      
//       setUser(null);
//       setToken(null);
//       router.push('/login');
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{
//       user,
//       token,
//       isAuthenticated: !!user && !!token,
//       isLoading,
//        error, 
//       signIn,
//       logout,
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };