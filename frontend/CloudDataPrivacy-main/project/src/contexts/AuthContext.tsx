// import { createContext, useState, useEffect,useContext, ReactNode } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import { User, LoginCredentials, RegisterData } from '../types';
// import { storage } from '../utils/storage';


// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string | null;
//   login: (credentials: LoginCredentials) => Promise<boolean>;
//   register: (data: RegisterData) => Promise<boolean>;
//   logout: () => void;
// }

// const defaultContext: AuthContextType = {
//   user: null,
//   isAuthenticated: false,
//   isLoading: true,
//   error: null,
//   login: async () => false,
//   register: async () => false,
//   logout: () => {},
// };

// export const AuthContext = createContext<AuthContextType>(defaultContext);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedUser = storage.getItem<User | null>('user', null);
//     if (storedUser) {
//       setUser(storedUser);
//     }
//     setIsLoading(false);
//   }, []);

//   const login = async (credentials: LoginCredentials): Promise<boolean> => {
//     setError(null);
//     try {
//       const response = await axios.post('/api/auth/login', credentials);
//       const { token, mfaRequired, userId } = response.data;

//       if (mfaRequired) {
//         navigate('/verify-mfa', { state: { userId } });
//         return false;
//       }

//       const decoded: any = jwtDecode(token);
//       const loggedInUser: User = {
//         id: decoded.id,
//         email: decoded.email,
//         role: decoded.role,
//         name: decoded.name || '',            // fallback empty string
//         createdAt: decoded.createdAt || '',  // fallback empty string
//       };

//       setUser(loggedInUser);
//       storage.setItem('user', loggedInUser);

//       return true;
//     } catch (err: any) {
//       console.error(err);
//       setError(err?.response?.data?.message || 'Login failed');
//       return false;
//     }
//   };
   
// const register = async (data: RegisterData): Promise<boolean> => {
//   setError(null);
//   console.log("Register payload:", data);  

//   try {
//     await axios.post('/api/auth/register', {
//       fullName: data.fullName,
//       username:data.username,
//       email: data.email,
//       dateOfBirth: data.dateOfBirth,
//       password: data.password,
//       confirmPassword: data.confirmPassword,
//       role: data.role,
//     });

//     return true;
//   } catch (err: any) {
//     console.error('Registration error:', err.response?.data || err.message);
//     setError(err.response?.data?.message || 'Registration failed.');
//     return false;
//   }
// };



//   const logout = () => {
//     setUser(null);
//     storage.removeItem('user');
//     navigate('/');
//   };

//   const value = {
//     user,
//     isAuthenticated: !!user,
//     isLoading,
//     error,
//     login,
//     register,
//     logout,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export const useAuth = () => {
//   return useContext(AuthContext);
// };

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // ✅ correct
import { User, LoginCredentials, RegisterData } from '../types';
import { storage } from '../utils/storage';

interface LoginResponse {
  token?: string;
  mfaRequired?: boolean;
  userId?: string;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => ({}),
  register: async () => false,
  logout: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = storage.getItem<User | null>('user', null);
    if (storedUser) setUser(storedUser);
    setIsLoading(false);
  }, []);

  // ---------------- LOGIN ----------------
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const data: LoginResponse = response.data;

      // MFA required for doctor/patient
      if (data.mfaRequired) {
        // optionally store userId locally for MFA verification
        storage.setItem('mfaUserId', data.userId || '');
        return data; // step handled in LoginPage.tsx
      }

      // normal login, store token and user
      if (data.token) {
        const decoded: any = jwtDecode(data.token);
        const loggedInUser: User = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name || '',
          createdAt: decoded.createdAt || '',
        };

        setUser(loggedInUser);
        storage.setItem('user', loggedInUser);
      }

      return data;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.response?.data?.message || 'Login failed');
      return { message: err?.response?.data?.message || 'Login failed' };
    }
  };

  // ---------------- REGISTER ----------------
  const register = async (data: RegisterData): Promise<boolean> => {
    setError(null);
    try {
      await axios.post('/api/auth/register', {
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
      });
      return true;
    } catch (err: any) {
      console.error('Registration error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Registration failed.');
      return false;
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    setUser(null);
    storage.removeItem('user');
    storage.removeItem('mfaUserId');
    navigate('/');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------- USE AUTH HOOK ----------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
