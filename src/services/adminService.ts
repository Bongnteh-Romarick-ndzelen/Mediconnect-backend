import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class AdminService {
  static async listUsers(query: {
    page?: string;
    limit?: string;
    search?: string;
    role?: string;
    isActive?: string;
    isVerified?: string;
  }) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        {
          profile: {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
            ]
          }
        }
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    if (query.isVerified !== undefined) {
      where.isVerified = query.isVerified === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          patient: true,
          provider: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        patient: true,
        provider: true,
        notifications: true,
        auditLogs: true,
        sessions: true
      }
    });

    if (!user) {
      throw new AppError('User not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, CONSTANTS.ERROR_CODES.USER_NOT_FOUND);
    }

    return user;
  }

  static async updateUser(id: string, data: any) {
    const user = await prisma.user.update({
      where: { id },
      data,
      include: {
        profile: true,
        patient: true,
        provider: true
      }
    });

    return user;
  }

  static async deleteUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, patient: true, provider: true }
    });

    if (!user) {
      throw new AppError('User not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, CONSTANTS.ERROR_CODES.USER_NOT_FOUND);
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'User deactivated successfully' };
  }

  static async listAppointments(query: {
    page?: string;
    limit?: string;
    status?: string;
    type?: string;
    providerId?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.providerId) {
      where.providerId = query.providerId;
    }

    if (query.patientId) {
      where.patientId = query.patientId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            include: {
              user: {
                select: {
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
          },
          provider: {
            include: {
              user: {
                select: {
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
          },
          slot: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.appointment.count({ where })
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateAppointment(id: string, data: any) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { slot: true }
    });

    if (!appointment) {
      throw new AppError(
        'Appointment not found',
        CONSTANTS.HTTP_STATUS.NOT_FOUND,
        CONSTANTS.ERROR_CODES.APPOINTMENT_NOT_FOUND
      );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data,
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
      }
    });

    return updatedAppointment;
  }

  static async getStats(startDate?: Date, endDate?: Date) {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    const appointmentWhere: any = {};
    if (defaultStartDate || defaultEndDate) {
      appointmentWhere.createdAt = {};
      if (defaultStartDate) appointmentWhere.createdAt.gte = defaultStartDate;
      if (defaultEndDate) appointmentWhere.createdAt.lte = defaultEndDate;
    }

    const appointmentCountArgs = appointmentWhere.createdAt
      ? { where: appointmentWhere }
      : undefined;

    const [
      totalUsers,
      totalPatients,
      totalProviders,
      totalAppointments,
      totalRevenue,
      recentUsers,
      recentAppointments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.patient.count(),
      prisma.provider.count(),
      prisma.appointment.count(appointmentCountArgs),
      prisma.payment.aggregate({
        where: {
          ...(appointmentWhere.createdAt ? { createdAt: appointmentWhere.createdAt } : {}),
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),
      prisma.user.count({
        where: appointmentWhere.createdAt ? { createdAt: appointmentWhere.createdAt } : undefined
      }),
      prisma.appointment.findMany({
        where: appointmentWhere,
        take: 10,
        orderBy: { createdAt: 'desc' },
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
        }
      })
    ]);

    return {
      overview: {
        totalUsers,
        totalPatients,
        totalProviders,
        totalAppointments,
        totalRevenue: totalRevenue._sum.amount || 0,
        recentUsers,
        periodStart: defaultStartDate,
        periodEnd: defaultEndDate
      },
      recentAppointments
    };
  }
}
