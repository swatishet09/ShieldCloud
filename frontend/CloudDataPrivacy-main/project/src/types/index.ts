
export interface LoginCredentials {
  loginInput: string;     // this can be email or username
  password: string;
  mfaCode?:string
}

export type UserRole = 'admin' | 'doctor' | 'patient' | 'researcher';

export interface User {
  id: string;
  email: string;
  username?: string;
  name: string;
  role: UserRole;
  createdAt: string;
  token?: string;
  dateOfBirth?: string;  // match backend
}

export type RegisterData =
  | {
      fullName: string;
      email: string;
      dateOfBirth: string;
      password: string;
      confirmPassword?: string;
      role: 'admin';
      username: string;   
    }
  | {
      fullName: string;
      email: string;
      dateOfBirth: string;
      password: string;
      confirmPassword?: string;
      role: 'doctor' | 'patient' | 'researcher';
      username?: string;  
    };

