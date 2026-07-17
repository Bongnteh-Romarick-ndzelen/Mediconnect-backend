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

// ============================================
// PATIENT SCHEMAS
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

// ============================================
// ADMIN SCHEMAS
// ============================================

export const adminListUsersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    role: z.string().optional(),
    isActive: z.string().optional(),
    isVerified: z.string().optional()
  })
});

export const adminUpdateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required')
  }),
  body: z.object({
    role: z.enum(['PATIENT', 'PROVIDER', 'ADMIN', 'SUPPORT']).optional(),
    isActive: z.boolean().optional(),
    isVerified: z.boolean().optional(),
    isLocked: z.boolean().optional(),
    twoFactorEnabled: z.boolean().optional()
  })
});

export const adminListAppointmentsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    providerId: z.string().optional(),
    patientId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    search: z.string().optional()
  })
});

export const adminUpdateAppointmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Appointment ID is required')
  }),
  body: z.object({
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW', 'WAITING']).optional(),
    type: z.enum(['GENERAL', 'SPECIALIST', 'FOLLOW_UP', 'EMERGENCY', 'CONSULTATION', 'TELEHEALTH', 'IN_PERSON']).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    notes: z.string().optional(),
    notesPrivate: z.record(z.string, z.any).optional(),
    cancelledBy: z.string().optional(),
    cancellationReason: z.string().optional()
  })
});

export const adminStatsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  })
});

// ============================================
// MEDICAL RECORD SCHEMAS
// ============================================

export const createMedicalRecordSchema = z.object({
  body: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    appointmentId: z.string().optional(),
    type: z.enum(['CONSULTATION', 'LAB_RESULT', 'IMAGING', 'SURGERY', 'VACCINATION', 'MEDICATION', 'ALLERGY', 'OTHER']),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    diagnosis: z.record(z.string, z.any).optional(),
    treatment: z.record(z.string, z.any).optional(),
    symptoms: z.string().optional(),
    vitals: z.record(z.string, z.any).optional(),
    notes: z.string().optional(),
    attachments: z.array(z.string()).optional(),
    isConfidential: z.boolean().optional(),
    isShared: z.boolean().optional(),
    sharedWith: z.record(z.string, z.any).optional()
  })
});

export const updateMedicalRecordSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Medical record ID is required')
  }),
  body: z.object({
    type: z.enum(['CONSULTATION', 'LAB_RESULT', 'IMAGING', 'SURGERY', 'VACCINATION', 'MEDICATION', 'ALLERGY', 'OTHER']).optional(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    diagnosis: z.record(z.string, z.any).optional(),
    treatment: z.record(z.string, z.any).optional(),
    symptoms: z.string().optional(),
    vitals: z.record(z.string, z.any).optional(),
    notes: z.string().optional(),
    attachments: z.array(z.string()).optional(),
    isConfidential: z.boolean().optional(),
    isShared: z.boolean().optional(),
    sharedWith: z.record(z.string, z.any).optional()
  })
});

export const getMedicalRecordSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Medical record ID is required')
  })
});

export const listMedicalRecordsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    patientId: z.string().optional(),
    providerId: z.string().optional()
  })
});

// ============================================
// PRESCRIPTION SCHEMAS
// ============================================

export const createPrescriptionSchema = z.object({
  body: z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    appointmentId: z.string().optional(),
    medication: z.string().min(1, 'Medication is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    duration: z.string().min(1, 'Duration is required'),
    instructions: z.string().optional(),
    refills: z.number().min(0).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    pharmacy: z.record(z.string, z.any).optional(),
    eRxId: z.string().optional(),
    DEA: z.string().optional(),
    NDC: z.string().optional()
  })
});

export const updatePrescriptionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Prescription ID is required')
  }),
  body: z.object({
    medication: z.string().min(1).optional(),
    dosage: z.string().min(1).optional(),
    frequency: z.string().min(1).optional(),
    duration: z.string().min(1).optional(),
    instructions: z.string().optional(),
    refills: z.number().min(0).optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REFILL_REQUESTED']).optional(),
    endDate: z.string().datetime().optional(),
    pharmacy: z.record(z.string, z.any).optional(),
    pharmacyFilled: z.boolean().optional(),
    filledAt: z.string().datetime().optional(),
    filledBy: z.string().optional()
  })
});

export const getPrescriptionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Prescription ID is required')
  })
});

export const listPrescriptionsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.string().optional(),
    patientId: z.string().optional(),
    providerId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  })
});

export const requestRefillSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Prescription ID is required')
  })
});

// ============================================
// REVIEW SCHEMAS
// ============================================

export const createReviewSchema = z.object({
  body: z.object({
    appointmentId: z.string().min(1, 'Appointment ID is required'),
    providerId: z.string().min(1, 'Provider ID is required'),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().optional(),
    isAnonymous: z.boolean().optional()
  })
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Review ID is required')
  }),
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().optional(),
    isAnonymous: z.boolean().optional()
  })
});

export const respondToReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Review ID is required')
  }),
  body: z.object({
    providerResponse: z.string().min(1, 'Response is required')
  })
});

export const getReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Review ID is required')
  })
});

export const listReviewsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    providerId: z.string().optional(),
    patientId: z.string().optional(),
    rating: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  })
});