import { createContext, useState, useEffect,useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { User, LoginCredentials, RegisterData } from '../types';
import { storage } from '../utils/storage';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => false,
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
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token, mfaRequired, userId } = response.data;

      if (mfaRequired) {
        navigate('/verify-mfa', { state: { userId } });
        return false;
      }

      const decoded: any = jwtDecode(token);
      const loggedInUser: User = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name || '',            // fallback empty string
        createdAt: decoded.createdAt || '',  // fallback empty string
      };

      setUser(loggedInUser);
      storage.setItem('user', loggedInUser);

      return true;
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Login failed');
      return false;
    }
  };
   
const register = async (data: RegisterData): Promise<boolean> => {
  setError(null);
  console.log("Register payload:", data);  

  try {
    await axios.post('/api/auth/register', {
      fullName: data.fullName,
      username:data.username,
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



  const logout = () => {
    setUser(null);
    storage.removeItem('user');
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

export const useAuth = () => {
  return useContext(AuthContext);
};