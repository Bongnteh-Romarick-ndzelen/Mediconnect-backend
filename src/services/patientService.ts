import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class PatientService {
  static async getPatient(userId: string) {
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
            isActive: true,
            createdAt: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                dateOfBirth: true,
                gender: true,
                avatar: true,
              }
            }
          }
        },
        medicalRecords: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    profile: {
                      select: {
                        firstName: true,
                        lastName: true,
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        appointments: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    profile: {
                      select: {
                        firstName: true,
                        lastName: true,
                      }
                    }
                  }
                }
              }
            },
            slot: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        prescriptions: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    profile: {
                      select: {
                        firstName: true,
                        lastName: true,
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviews: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    profile: {
                      select: {
                        firstName: true,
                        lastName: true,
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      }
    });

    if (!patient) {
      throw new AppError(
        'Patient profile not found',
        CONSTANTS.HTTP_STATUS.NOT_FOUND,
        CONSTANTS.ERROR_CODES.PATIENT_NOT_FOUND
      );
    }

    return patient;
  }

  static async getPatientById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                avatar: true,
              }
            }
          }
        }
      }
    });

    if (!patient) {
      throw new AppError(
        'Patient not found',
        CONSTANTS.HTTP_STATUS.NOT_FOUND,
        CONSTANTS.ERROR_CODES.PATIENT_NOT_FOUND
      );
    }

    return patient;
  }

  static async listPatients(query: {
    page?: string;
    limit?: string;
    search?: string;
    bloodGroup?: string;
    isActive?: string;
  }) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.user = {
        OR: [
          { email: { contains: query.search, mode: 'insensitive' } },
          {
            profile: {
              OR: [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
              ]
            }
          }
        ]
      };
    }

    if (query.bloodGroup) {
      where.bloodGroup = query.bloodGroup;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isVerified: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  avatar: true,
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.patient.count({ where })
    ]);

    return {
      patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updatePatient(userId: string, data: any) {
    const patient = await prisma.patient.update({
      where: { userId },
      data: {
        ...(data.allergies !== undefined && { allergies: data.allergies }),
        ...(data.chronicConditions !== undefined && { chronicConditions: data.chronicConditions }),
        ...(data.bloodGroup !== undefined && { bloodGroup: data.bloodGroup }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.smokingStatus !== undefined && { smokingStatus: data.smokingStatus }),
        ...(data.alcoholConsumption !== undefined && { alcoholConsumption: data.alcoholConsumption }),
        ...(data.preferredLanguage !== undefined && { preferredLanguage: data.preferredLanguage }),
        ...(data.communicationPreferences !== undefined && { communicationPreferences: data.communicationPreferences }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        user: {
          update: {
            ...(data.email !== undefined && { email: data.email }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.avatar !== undefined && { avatar: data.avatar }),
            profile: {
              upsert: {
                create: {
                  firstName: data.name?.split(' ')[0] || '',
                  lastName: data.name?.split(' ').slice(1).join(' ') || '',
                  phoneNumber: data.phone,
                  dateOfBirth: data.dob ? new Date(data.dob) : undefined,
                  gender: data.gender as any,
                  avatar: data.avatar,
                  bio: data.bio,
                  emergencyContact: data.emergencyContact,
                },
                update: {
                  ...(data.name && { firstName: data.name.split(' ')[0] || undefined }),
                  ...(data.name && { lastName: data.name.split(' ').slice(1).join(' ') || undefined }),
                  ...(data.phone && { phoneNumber: data.phone }),
                  ...(data.dob && { dateOfBirth: new Date(data.dob) }),
                  ...(data.gender && { gender: data.gender as any }),
                  ...(data.avatar && { avatar: data.avatar }),
                  ...(data.bio && { bio: data.bio }),
                  ...(data.emergencyContact && { emergencyContact: data.emergencyContact }),
                }
              }
            }
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
              }
            }
          }
        }
      }
    });

    return patient;
  }

  static async deletePatient(userId: string) {
    await prisma.patient.update({
      where: { userId },
      data: { isActive: false }
    });

    return { message: 'Patient deactivated successfully' };
  }
}
