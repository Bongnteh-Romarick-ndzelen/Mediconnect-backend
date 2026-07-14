import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
    role: z.enum(['PATIENT', 'PROVIDER']).optional(),
    dateOfBirth: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    // Provider fields
    licenseNumber: z.string().optional(),
    specialty: z.string().optional(),
    hospital: z.string().optional(),
    yearsOfExperience: z.number().min(0).optional(),
    certifications: z.array(z.string()).optional(),
    consultationFee: z.number().min(0).optional(),
  }).refine((data) => {
    if (data.role === 'PROVIDER') {
      return data.licenseNumber && data.specialty && data.hospital;
    }
    return true;
  }, {
    message: 'Provider registration requires licenseNumber, specialty, and hospital',
    path: ['role']
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional()
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format')
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  })
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1, 'Verification token is required')
  })
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format')
  })
});

// ============================================
// USER SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phoneNumber: z.string().min(10).optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      zipCode: z.string().optional()
    }).optional(),
    emergencyContact: z.object({
      name: z.string(),
      phone: z.string(),
      relation: z.string()
    }).optional(),
    bio: z.string().optional()
  })
});

export const updatePatientSchema = z.object({
  body: z.object({
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    bloodGroup: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional(),
    weight: z.number().positive().optional(),
    height: z.number().positive().optional(),
    smokingStatus: z.boolean().optional(),
    alcoholConsumption: z.boolean().optional()
  })
});

export const updateProviderSchema = z.object({
  body: z.object({
    specialty: z.string().optional(),
    subSpecialties: z.array(z.string()).optional(),
    hospital: z.string().optional(),
    department: z.string().optional(),
    yearsOfExperience: z.number().min(0).optional(),
    consultationFee: z.number().min(0).optional(),
    languages: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional()
  })
});

// ============================================
// PATIENT SCHEMAS
// ============================================

export const getPatientSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Patient ID is required')
  })
});

export const listPatientsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    bloodGroup: z.string().optional(),
    isActive: z.string().optional()
  })
});

export const updatePatientSchema = z.object({
  body: z.object({
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    bloodGroup: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional(),
    weight: z.number().positive().optional(),
    height: z.number().positive().optional(),
    smokingStatus: z.boolean().optional(),
    alcoholConsumption: z.boolean().optional(),
    preferredLanguage: z.string().optional(),
    communicationPreferences: z.record(z.string, z.any).optional(),
    isActive: z.boolean().optional()
  })
});

// ============================================
// PROVIDER SCHEMAS
// ============================================

export const getProviderSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Provider ID is required')
  })
});

export const listProvidersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    specialty: z.string().optional(),
    isAvailable: z.string().optional(),
    hospital: z.string().optional()
  })
});

export const createAvailabilitySchema = z.object({
  body: z.object({
    date: z.string().datetime(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    isRecurring: z.boolean().optional(),
    recurrenceRule: z.string().optional(),
    recurrenceId: z.string().optional(),
    type: z.enum(['GENERAL', 'SPECIALIST', 'FOLLOW_UP', 'EMERGENCY', 'CONSULTATION', 'TELEHEALTH', 'IN_PERSON']).optional(),
    notes: z.string().optional()
  })
});

export const updateAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Availability slot ID is required')
  }),
  body: z.object({
    date: z.string().datetime().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    isBooked: z.boolean().optional(),
    bookedBy: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurrenceRule: z.string().optional(),
    recurrenceId: z.string().optional(),
    type: z.enum(['GENERAL', 'SPECIALIST', 'FOLLOW_UP', 'EMERGENCY', 'CONSULTATION', 'TELEHEALTH', 'IN_PERSON']).optional(),
    notes: z.string().optional()
  })
});

// ============================================
// APPOINTMENT SCHEMAS
// ============================================

export const createAppointmentSchema = z.object({
  body: z.object({
    slotId: z.string().min(1, 'Slot ID is required'),
    providerId: z.string().min(1, 'Provider ID is required'),
    symptoms: z.string().optional(),
    notes: z.string().optional(),
    diagnosis: z.string().optional(),
    type: z.enum(['GENERAL', 'SPECIALIST', 'FOLLOW_UP', 'EMERGENCY', 'CONSULTATION', 'TELEHEALTH', 'IN_PERSON']).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional()
  })
});

export const getAppointmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Appointment ID is required')
  })
});

export const listAppointmentsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    providerId: z.string().optional(),
    patientId: z.string().optional()
  })
});

export const updateAppointmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Appointment ID is required')
  }),
  body: z.object({
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW', 'WAITING']).optional(),
    type: z.enum(['GENERAL', 'SPECIALIST', 'FOLLOW_UP', 'EMERGENCY', 'CONSULTATION', 'TELEHEALTH', 'IN_PERSON']).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    symptoms: z.string().optional(),
    notes: z.string().optional(),
    diagnosis: z.string().optional(),
    meetingLink: z.string().url().optional(),
    meetingId: z.string().optional(),
    notesPrivate: z.record(z.string, z.any).optional(),
    notesPatient: z.record(z.string, z.any).optional(),
    cancelledBy: z.string().optional(),
    cancellationReason: z.string().optional(),
    rescheduleCount: z.number().min(0).optional(),
    waitTime: z.number().min(0).optional(),
    reminderSent: z.boolean().optional(),
    startedAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
    actualDuration: z.number().min(0).optional(),
    followUpRequired: z.boolean().optional(),
    followUpDate: z.string().datetime().optional(),
    followUpNotes: z.string().optional()
  })
});

export const cancelAppointmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Appointment ID is required')
  }),
  body: z.object({
    cancellationReason: z.string().min(1, 'Cancellation reason is required'),
    cancelledBy: z.string().min(1, 'Cancelled by is required')
  })
});