export type Role = 'PATIENT' | 'PROVIDER' | 'ADMIN' | 'SUPPORT';

export interface User {
  id: string;
  email: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  profile?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  patient?: {
    id: string;
  };
  provider?: {
    id: string;
    specialty: string;
  };
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role?: Role;
  // Patient fields
  dateOfBirth?: string;
  allergies?: string[];
  chronicConditions?: string[];
  // Provider fields
  licenseNumber?: string;
  specialty?: string;
  hospital?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  consultationFee?: number;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: Role;
    isVerified: boolean;
    profile?: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
    };
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}