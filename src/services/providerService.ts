import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class ProviderService {
  static async getProvider(userId: string) {
    const provider = await prisma.provider.findUnique({
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
        availableSlots: {
          where: { isBooked: false },
          orderBy: { startTime: 'asc' },
        },
        medicalRecords: {
          include: {
            patient: {
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
            patient: {
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
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      }
    });

    if (!provider) {
      throw new AppError(
        'Provider profile not found',
        CONSTANTS.HTTP_STATUS.NOT_FOUND,
        CONSTANTS.ERROR_CODES.PROVIDER_NOT_FOUND
      );
    }

    return provider;
  }

  static async getProviderById(id: string) {
    const provider = await prisma.provider.findUnique({
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
        },
        availableSlots: {
          where: { isBooked: false },
          orderBy: { startTime: 'asc' },
        }
      }
    });

    if (!provider) {
      throw new AppError(
        'Provider not found',
        CONSTANTS.HTTP_STATUS.NOT_FOUND,
        CONSTANTS.ERROR_CODES.PROVIDER_NOT_FOUND
      );
    }

    return provider;
  }

  static async listProviders(query: {
    page?: string;
    limit?: string;
    search?: string;
    specialty?: string;
    isAvailable?: string;
    hospital?: string;
  }) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { licenseNumber: { contains: query.search } },
        { hospital: { contains: query.search } },
        { specialty: { contains: query.search } },
        { user: { profile: { OR: [{ firstName: { contains: query.search } }, { lastName: { contains: query.search } }] } } }
      ];
    }

    if (query.specialty) {
      where.specialty = query.specialty;
    }

    if (query.isAvailable !== undefined) {
      where.isAvailable = query.isAvailable === 'true';
    }

    if (query.hospital) {
      where.hospital = { contains: query.hospital };
    }

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
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
          },
          availableSlots: {
            where: { isBooked: false },
            take: 5,
            orderBy: { startTime: 'asc' },
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.provider.count({ where })
    ]);

    return {
      providers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateProvider(userId: string, data: any) {
    const provider = await prisma.provider.update({
      where: { userId },
      data: {
        ...(data.specialty !== undefined && { specialty: data.specialty }),
        ...(data.subSpecialties !== undefined && { subSpecialties: data.subSpecialties }),
        ...(data.hospital !== undefined && { hospital: data.hospital }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.yearsOfExperience !== undefined && { yearsOfExperience: data.yearsOfExperience }),
        ...(data.consultationFee !== undefined && { consultationFee: data.consultationFee }),
        ...(data.languages !== undefined && { languages: data.languages }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
        ...(data.licenseNumber !== undefined && { licenseNumber: data.licenseNumber }),
        ...(data.certifications !== undefined && { certifications: data.certifications }),
        ...(data.education !== undefined && { education: data.education }),
        ...(data.experience !== undefined && { experience: data.experience }),
        ...(data.workingHours !== undefined && { workingHours: data.workingHours }),
        ...(data.isVerified !== undefined && { isVerified: data.isVerified }),
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
                },
                update: {
                  ...(data.name && { firstName: data.name.split(' ')[0] || undefined }),
                  ...(data.name && { lastName: data.name.split(' ').slice(1).join(' ') || undefined }),
                  ...(data.phone && { phoneNumber: data.phone }),
                  ...(data.dob && { dateOfBirth: new Date(data.dob) }),
                  ...(data.gender && { gender: data.gender as any }),
                  ...(data.avatar && { avatar: data.avatar }),
                  ...(data.bio && { bio: data.bio }),
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

    return provider;
  }

  static async createAvailabilitySlot(providerId: string, data: any) {
    const slot = await prisma.availableSlot.create({
      data: {
        ...data,
        providerId,
      }
    });

    return slot;
  }

  static async updateAvailabilitySlot(slotId: string, providerId: string, data: any) {
    const slot = await prisma.availableSlot.findFirst({
      where: { id: slotId, providerId }
    });

    if (!slot) {
      throw new AppError(
        'Availability slot not found',
        CONSTANTS.HTTP_STATUS.NOT_FOUND,
        CONSTANTS.ERROR_CODES.SLOT_NOT_AVAILABLE
      );
    }

    const updatedSlot = await prisma.availableSlot.update({
      where: { id: slotId },
      data
    });

    return updatedSlot;
  }

  static async deleteAvailabilitySlot(slotId: string, providerId: string) {
    const slot = await prisma.availableSlot.findFirst({
      where: { id: slotId, providerId }
    });

    if (!slot) {
      throw new AppError(
        'Availability slot not found',
        CONSTANTS.HTTP_STATUS.NOT_FOUND,
        CONSTANTS.ERROR_CODES.SLOT_NOT_AVAILABLE
      );
    }

    await prisma.availableSlot.delete({
      where: { id: slotId }
    });

    return { message: 'Availability slot deleted successfully' };
  }

  static async getProviderAvailability(providerId: string, startDate?: Date, endDate?: Date) {
    const where: any = { providerId, isBooked: false };

    if (startDate && endDate) {
      where.startTime = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.startTime = { gte: startDate };
    } else if (endDate) {
      where.startTime = { lte: endDate };
    }

    const slots = await prisma.availableSlot.findMany({
      where,
      orderBy: { startTime: 'asc' }
    });

    return slots;
  }
}
