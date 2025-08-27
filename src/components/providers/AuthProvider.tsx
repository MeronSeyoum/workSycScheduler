'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api as apiCall } from '@/lib/api';
import { User } from '@/lib/types/auth';

// Constants for session management
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const SESSION_EXPIRY_KEY = 'session_expiry';
const SESSION_DURATION_DAYS = 30; // 30 days session

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSessionValidity: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Helper function to get initial state from localStorage with session validation
const getInitialAuthState = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isValid: false };
  }
  
  try {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    const expiryString = localStorage.getItem(SESSION_EXPIRY_KEY);
    
    // Check session validity
    const isValidSession = expiryString ? new Date(expiryString) > new Date() : false;
    
    if (storedToken && storedUser && isValidSession) {
      return {
        token: storedToken,
        user: JSON.parse(storedUser),
        isValid: true
      };
    }
    
    return { user: null, token: null, isValid: false };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return { user: null, token: null, isValid: false };
  }
};

// Secure storage operations with error handling
const secureStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  },
  
  getItem: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
  
  clear: async (): Promise<void> => {
    try {
      await Promise.all([
        secureStorage.removeItem(TOKEN_KEY),
        secureStorage.removeItem(REFRESH_TOKEN_KEY),
        secureStorage.removeItem(USER_KEY),
        secureStorage.removeItem(SESSION_EXPIRY_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state with values from localStorage
  const initialState = getInitialAuthState();
  const [user, setUser] = useState<User | null>(initialState.user);
  const [token, setToken] = useState<string | null>(initialState.token);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Session validation function
  const checkSessionValidity = useCallback(async (): Promise<boolean> => {
    try {
      const expiryString = await secureStorage.getItem(SESSION_EXPIRY_KEY);
      if (!expiryString) return false;
      
      const expiryDate = new Date(expiryString);
      const isValid = expiryDate > new Date();
      
      if (!isValid) {
        console.log('Session expired, logging out...');
        await logout();
        return false;
      }
      
      return isValid;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }, []);

  // Initialize auth state with comprehensive session management
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [storedToken, storedUser, expiryString] = await Promise.all([
          secureStorage.getItem(TOKEN_KEY),
          secureStorage.getItem(USER_KEY),
          secureStorage.getItem(SESSION_EXPIRY_KEY),
        ]);

        if (!storedToken) {
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        // Check session expiry
        const isValidSession = expiryString ? new Date(expiryString) > new Date() : false;
        
        if (isValidSession && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(parsedUser);
            
            // Optionally validate token with server
            // const isValidToken = await apiCall.auth.validateToken(storedToken);
            // if (!isValidToken) {
            //   throw new Error('Token validation failed');
            // }
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
            await secureStorage.clear();
            setUser(null);
            setToken(null);
          }
        } else {
          // Auto-logout if session expired
          console.log('Session expired during initialization');
          await secureStorage.clear();
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error instanceof Error ? error : new Error('Auth initialization failed'));
        // Clear potentially corrupted data
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

  // Periodic session validation
  useEffect(() => {
    if (!token || !isInitialized) return;

    const validateSession = async () => {
      const isValid = await checkSessionValidity();
      if (!isValid && token) {
        console.log('Session invalid, redirecting to login');
        router.push('/login');
      }
    };

    // Check session validity every 5 minutes
    const interval = setInterval(validateSession, 5 * 60 * 1000);
    
    // Also check on window focus
    const handleFocus = () => validateSession();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [token, isInitialized, checkSessionValidity, router]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiCall.auth.login(email, password);

      if (!response.data) {
        throw new Error('Login failed');
      }

      const { user, access, refresh } = response.data;

      // Set session expiry
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + SESSION_DURATION_DAYS);

      // Store all auth data atomically
      await Promise.all([
        secureStorage.setItem(TOKEN_KEY, access.token),
        secureStorage.setItem(REFRESH_TOKEN_KEY, refresh.token),
        secureStorage.setItem(USER_KEY, JSON.stringify(user)),
        secureStorage.setItem(SESSION_EXPIRY_KEY, expiryDate.toISOString()),
      ]);

      setUser(user);
      setToken(access.token);
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error : new Error('Login failed'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Try to logout from server first
      if (token) {
        try {
          await apiCall.auth.logout(token);
        } catch (logoutError) {
          console.error('Server logout error:', logoutError);
          // Continue with local cleanup even if server logout fails
        }
      }
      
      // Clear all stored data
      await secureStorage.clear();
      
      // Reset state
      setUser(null);
      setToken(null);
      setError(null);
      
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force cleanup even if there are errors
      try {
        await secureStorage.clear();
        setUser(null);
        setToken(null);
        router.push('/login');
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, router]);

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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