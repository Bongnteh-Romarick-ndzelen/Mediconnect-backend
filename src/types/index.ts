// ============================================
// AUTH TYPES
// ============================================

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
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

// ============================================
// USER TYPES
// ============================================

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  displayName?: string;
  dateOfBirth?: Date;
  gender?: string;
  phoneNumber: string;
  alternativePhone?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  avatar?: string;
  bio?: string;
  timezone: string;
  language: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

// ============================================
// APPOINTMENT TYPES
// ============================================

export interface AppointmentCreateInput {
  patientId: string;
  providerId: string;
  slotId: string;
  type: string;
  symptoms?: string;
  notes?: string;
}

export interface AppointmentUpdateInput {
  status?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
}

// ============================================
// PROVIDER TYPES
// ============================================

export interface ProviderCreateInput {
  userId: string;
  licenseNumber: string;
  specialty: string;
  subSpecialties?: string[];
  hospital: string;
  department?: string;
  yearsOfExperience?: number;
  consultationFee: number;
  certifications?: string[];
  languages?: string[];
}

export interface ProviderUpdateInput {
  specialty?: string;
  subSpecialties?: string[];
  hospital?: string;
  department?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  isAvailable?: boolean;
  languages?: string[];
}

// ============================================
// PATIENT TYPES
// ============================================

export interface PatientCreateInput {
  userId: string;
  allergies?: string[];
  chronicConditions?: string[];
  bloodGroup?: string;
  weight?: number;
  height?: number;
}

export interface PatientUpdateInput {
  allergies?: string[];
  chronicConditions?: string[];
  bloodGroup?: string;
  weight?: number;
  height?: number;
  smokingStatus?: boolean;
  alcoholConsumption?: boolean;
}

// ============================================
// MEDICAL RECORD TYPES
// ============================================

export interface MedicalRecordCreateInput {
  patientId: string;
  providerId?: string;
  appointmentId?: string;
  type: string;
  title: string;
  description?: string;
  diagnosis?: any;
  treatment?: any;
  symptoms?: string;
  vitals?: any;
  notes?: string;
  attachments?: string[];
}

// ============================================
// PRESCRIPTION TYPES
// ============================================

export interface PrescriptionCreateInput {
  patientId: string;
  providerId: string;
  appointmentId?: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  refills?: number;
  startDate: Date;
  endDate?: Date;
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface PaymentCreateInput {
  invoiceId: string;
  patientId: string;
  amount: number;
  method: string;
  cardLast4?: string;
  cardBrand?: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface NotificationCreateInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority?: string;
  actionUrl?: string;
  actionLabel?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ============================================
// REQUEST TYPES
// ============================================

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// ============================================
// FILTER TYPES
// ============================================

export interface FilterOptions {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  [key: string]: any;
}

// ============================================
// SORT TYPES
// ============================================

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}