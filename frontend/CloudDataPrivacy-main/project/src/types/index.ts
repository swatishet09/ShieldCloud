export type UserRole = 'admin' | 'doctor' | 'patient' | 'researcher';

export interface User {
  id: string;
  email: string;
  username?: string; // Added username
  name: string;
  role: string;
  createdAt: string;
  token?: string;
}

export interface LoginCredentials {
  loginInput: string;     // this can be email or username
  password: string;
  mfaCode?:string
}

export interface RegisterData {
  fullName: string;
  email: string; 
  username?: string; // New
  dateOfBirth: string;
  password: string;
  confirmPassword?: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  email: string;
  phone:string;
  address: string;
  emergencyContact: string;
  bloodGroup: string;

  // Extra demographic info
  ethnicity?: string;
  religion?: string;
  drug?: string;
  firstCareUnit?: string;
  lastCareUnit?: string;

  // Medical info
  healthIssue: string;
  diagnosis: string;
  allergies: string;
  medications: string;
  notes: string;

  // Doctor info
  doctorName: string;
  doctorEmail: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastUpdatedBy: string;
}

// export interface Patient {
//   id: string;
//   firstName: string;
//   lastName: string;
//   dateOfBirth: string;
//   gender: 'male' | 'female' | 'other';
//   contactNumber: string;
//   email?: string;
//   address: string;
//   emergencyContact: string;
//   bloodType?: string;
//   healthIssue: string;
//   diagnosis: string;
//   allergies: string;
//   medications: string;
//   notes?: string;
//   doctorName:string;
//   doctorEmail:string;
//   createdAt: string;
//   updatedAt: string;
//   createdBy: string;
//   lastUpdatedBy: string;
// }

// export interface StaffMember {
//   id: string;
//   fullName: string;
//   email: string;
//   role: 'doctor' | 'patient';
//   department?: string;
//   specialization?: string;
//   contactNumber?: string;
//   isActive: boolean;
//   createdAt: string;
// }
