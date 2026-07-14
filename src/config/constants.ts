export const CONSTANTS = {
  // ============================================
  // USER ROLES
  // ============================================
  ROLES: {
    PATIENT: 'PATIENT',
    PROVIDER: 'PROVIDER',
    ADMIN: 'ADMIN',
    SUPPORT: 'SUPPORT',
  } as const,

  // ============================================
  // APPOINTMENT STATUS
  // ============================================
  APPOINTMENT_STATUS: {
    SCHEDULED: 'SCHEDULED',
    CONFIRMED: 'CONFIRMED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    RESCHEDULED: 'RESCHEDULED',
    NO_SHOW: 'NO_SHOW',
    WAITING: 'WAITING',
  } as const,

  // ============================================
  // APPOINTMENT TYPES
  // ============================================
  APPOINTMENT_TYPE: {
    GENERAL: 'GENERAL',
    SPECIALIST: 'SPECIALIST',
    FOLLOW_UP: 'FOLLOW_UP',
    EMERGENCY: 'EMERGENCY',
    CONSULTATION: 'CONSULTATION',
    TELEHEALTH: 'TELEHEALTH',
    IN_PERSON: 'IN_PERSON',
  } as const,

  // ============================================
  // NOTIFICATION TYPES
  // ============================================
  NOTIFICATION_TYPE: {
    APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
    APPOINTMENT_CONFIRMATION: 'APPOINTMENT_CONFIRMATION',
    APPOINTMENT_CANCELLATION: 'APPOINTMENT_CANCELLATION',
    APPOINTMENT_RESCHEDULED: 'APPOINTMENT_RESCHEDULED',
    PRESCRIPTION_READY: 'PRESCRIPTION_READY',
    PRESCRIPTION_REFILL: 'PRESCRIPTION_REFILL',
    PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
    PAYMENT_REMINDER: 'PAYMENT_REMINDER',
    MEDICAL_RECORD_UPDATE: 'MEDICAL_RECORD_UPDATE',
    SYSTEM_UPDATE: 'SYSTEM_UPDATE',
    PROMOTIONAL: 'PROMOTIONAL',
    EMERGENCY_ALERT: 'EMERGENCY_ALERT',
    VIDEO_CALL_READY: 'VIDEO_CALL_READY',
  } as const,

  // ============================================
  // PRIORITY LEVELS
  // ============================================
  PRIORITY: {
    LOW: 'LOW',
    NORMAL: 'NORMAL',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  } as const,

  // ============================================
  // FILE UPLOAD
  // ============================================
  FILE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    MAX_FILES: 5,
    UPLOAD_DIR: 'uploads/',
  } as const,

  // ============================================
  // PAGINATION
  // ============================================
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  } as const,

  // ============================================
  // JWT
  // ============================================
  JWT: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    RESET_TOKEN_EXPIRY: '1h',
    VERIFICATION_TOKEN_EXPIRY: '24h',
  } as const,

  // ============================================
  // CACHE
  // ============================================
  CACHE: {
    TTL: {
      SHORT: 60, // 1 minute
      MEDIUM: 300, // 5 minutes
      LONG: 3600, // 1 hour
      VERY_LONG: 86400, // 24 hours
    },
    KEYS: {
      USER_SESSION: 'session:',
      USER_PROFILE: 'profile:',
      APPOINTMENTS: 'appointments:',
      PROVIDERS: 'providers:',
      SLOTS: 'slots:',
    },
  } as const,

  // ============================================
  // REGEX PATTERNS
  // ============================================
  PATTERNS: {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    LICENSE: /^[A-Z]{2,3}-\d{4,8}$/,
    ZIPCODE: /^\d{5}(-\d{4})?$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  } as const,

  // ============================================
  // API RATE LIMITS
  // ============================================
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    AUTH_MAX_REQUESTS: 10,
    ADMIN_MAX_REQUESTS: 200,
  } as const,

  // ============================================
  // SPECIALTIES
  // ============================================
  SPECIALTIES: [
    'CARDIOLOGY',
    'DERMATOLOGY',
    'ENDOCRINOLOGY',
    'GASTROENTEROLOGY',
    'GENERAL_PRACTICE',
    'GYNECOLOGY',
    'NEUROLOGY',
    'ONCOLOGY',
    'OPHTHALMOLOGY',
    'ORTHOPEDICS',
    'PEDIATRICS',
    'PSYCHIATRY',
    'PULMONOLOGY',
    'RADIOLOGY',
    'UROLOGY',
    'OTHER',
  ] as const,

  // ============================================
  // BLOOD GROUPS
  // ============================================
  BLOOD_GROUPS: [
    'A_POSITIVE',
    'A_NEGATIVE',
    'B_POSITIVE',
    'B_NEGATIVE',
    'AB_POSITIVE',
    'AB_NEGATIVE',
    'O_POSITIVE',
    'O_NEGATIVE',
  ] as const,

  // ============================================
  // GENDERS
  // ============================================
  GENDERS: [
    'MALE',
    'FEMALE',
    'OTHER',
    'PREFER_NOT_TO_SAY',
  ] as const,

  // ============================================
  // ERROR CODES
  // ============================================
  ERROR_CODES: {
    // Auth Errors
    USER_EXISTS: 'USER_EXISTS',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
    INVALID_VERIFICATION_TOKEN: 'INVALID_VERIFICATION_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    FORBIDDEN: 'FORBIDDEN',
    REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
    INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
    PASSWORD_MISMATCH: 'PASSWORD_MISMATCH',
    INVALID_PASSWORD: 'INVALID_PASSWORD',
    
    // User Errors
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
    
    // Appointment Errors
    APPOINTMENT_NOT_FOUND: 'APPOINTMENT_NOT_FOUND',
    SLOT_NOT_AVAILABLE: 'SLOT_NOT_AVAILABLE',
    SLOT_ALREADY_BOOKED: 'SLOT_ALREADY_BOOKED',
    INVALID_APPOINTMENT_STATUS: 'INVALID_APPOINTMENT_STATUS',
    
    // Provider Errors
    PROVIDER_NOT_FOUND: 'PROVIDER_NOT_FOUND',
    PROVIDER_NOT_AVAILABLE: 'PROVIDER_NOT_AVAILABLE',
    INVALID_LICENSE: 'INVALID_LICENSE',
    
    // Patient Errors
    PATIENT_NOT_FOUND: 'PATIENT_NOT_FOUND',
    
    // Medical Record Errors
    RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
    RECORD_ACCESS_DENIED: 'RECORD_ACCESS_DENIED',
    
    // Prescription Errors
    PRESCRIPTION_NOT_FOUND: 'PRESCRIPTION_NOT_FOUND',
    PRESCRIPTION_EXPIRED: 'PRESCRIPTION_EXPIRED',
    PRESCRIPTION_REFILL_LIMIT: 'PRESCRIPTION_REFILL_LIMIT',
    
    // Payment Errors
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    INVOICE_NOT_FOUND: 'INVOICE_NOT_FOUND',
    INVOICE_ALREADY_PAID: 'INVOICE_ALREADY_PAID',
    
    // Validation Errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    
    // System Errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    DATABASE_ERROR: 'DATABASE_ERROR',
    
    // File Errors
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  } as const,

  // ============================================
  // HTTP STATUS CODES
  // ============================================
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  } as const,

  // ============================================
  // MESSAGES
  // ============================================
  MESSAGES: {
    // Success
    REGISTRATION_SUCCESS: 'Registration successful. Please verify your email.',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    PASSWORD_RESET: 'Password reset successful',
    EMAIL_VERIFIED: 'Email verified successfully',
    VERIFICATION_EMAIL_SENT: 'Verification email sent',
    RESET_EMAIL_SENT: 'Password reset email sent',
    
    // Error
    SOMETHING_WRONG: 'Something went wrong. Please try again.',
    UNAUTHORIZED_ACCESS: 'Unauthorized access',
    FORBIDDEN_ACCESS: 'Forbidden access',
    RESOURCE_NOT_FOUND: 'Resource not found',
    INVALID_REQUEST: 'Invalid request',
  } as const,
};

// Export types for use in other files
export type Role = typeof CONSTANTS.ROLES[keyof typeof CONSTANTS.ROLES];
export type AppointmentStatus = typeof CONSTANTS.APPOINTMENT_STATUS[keyof typeof CONSTANTS.APPOINTMENT_STATUS];
export type AppointmentType = typeof CONSTANTS.APPOINTMENT_TYPE[keyof typeof CONSTANTS.APPOINTMENT_TYPE];
export type Priority = typeof CONSTANTS.PRIORITY[keyof typeof CONSTANTS.PRIORITY];
export type ErrorCode = typeof CONSTANTS.ERROR_CODES[keyof typeof CONSTANTS.ERROR_CODES];
export type Specialty = typeof CONSTANTS.SPECIALTIES[number];
export type BloodGroup = typeof CONSTANTS.BLOOD_GROUPS[number];
export type Gender = typeof CONSTANTS.GENDERS[number];