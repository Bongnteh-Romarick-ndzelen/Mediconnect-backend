import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class AppointmentService {
  static async createAppointment(patientId: string, data: any) {
    const slot = await prisma.availableSlot.findUnique({
      where: { id: data.slotId },
      include: { provider: true }
    });

    if (!slot) {
      throw new AppError(
        'Slot not found',
        CONSTANTS.HTTP_STATUS.NOT_FOUND,
        CONSTANTS.ERROR_CODES.SLOT_NOT_AVAILABLE
      );
    }

    if (slot.isBooked) {
      throw new AppError(
        'Slot is already booked',
        CONSTANTS.HTTP_STATUS.CONFLICT,
        CONSTANTS.ERROR_CODES.SLOT_ALREADY_BOOKED
      );
    }

    if (slot.providerId !== data.providerId) {
      throw new AppError(
        'Slot does not belong to the specified provider',
        CONSTANTS.HTTP_STATUS.BAD_REQUEST,
        CONSTANTS.ERROR_CODES.INVALID_INPUT
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        providerId: data.providerId,
        slotId: data.slotId,
        symptoms: data.symptoms,
        notes: data.notes,
        diagnosis: data.diagnosis,
        type: data.type,
        priority: data.priority,
      },
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

    await prisma.availableSlot.update({
      where: { id: data.slotId },
      data: { isBooked: true, bookedBy: patientId, bookedAt: new Date() }
    });

    return appointment;
  }

  static async getAppointment(id: string, userId: string, userRole: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
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
        history: true,
        medicalRecords: true,
        prescription: true,
        invoice: true,
        review: true,
      }
    });

    if (!appointment) {
      throw new AppError(
        'Appointment not found',
        CONSTANTS.HTTP_STATUS.NOT_FOUND,
        CONSTANTS.ERROR_CODES.APPOINTMENT_NOT_FOUND
      );
    }

    if (userRole !== CONSTANTS.ROLES.ADMIN && userRole !== CONSTANTS.ROLES.SUPPORT) {
      if (appointment.patientId !== userId && appointment.providerId !== userId) {
        throw new AppError(
          'Access denied',
          CONSTANTS.HTTP_STATUS.FORBIDDEN,
          CONSTANTS.ERROR_CODES.FORBIDDEN
        );
      }
    }

    return appointment;
  }

  static async listAppointments(userId: string, userRole: string, query: {
    page?: string;
    limit?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userRole === CONSTANTS.ROLES.PATIENT) {
      where.patientId = userId;
    } else if (userRole === CONSTANTS.ROLES.PROVIDER) {
      where.providerId = userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
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

  static async updateAppointment(id: string, userId: string, userRole: string, data: any) {
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

    if (userRole !== CONSTANTS.ROLES.ADMIN && userRole !== CONSTANTS.ROLES.SUPPORT) {
      if (appointment.patientId !== userId && appointment.providerId !== userId) {
        throw new AppError(
          'Access denied',
          CONSTANTS.HTTP_STATUS.FORBIDDEN,
          CONSTANTS.ERROR_CODES.FORBIDDEN
        );
      }
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

  static async cancelAppointment(id: string, userId: string, userRole: string, data: any) {
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

    if (userRole !== CONSTANTS.ROLES.ADMIN && userRole !== CONSTANTS.ROLES.SUPPORT) {
      if (appointment.patientId !== userId && appointment.providerId !== userId) {
        throw new AppError(
          'Access denied',
          CONSTANTS.HTTP_STATUS.FORBIDDEN,
          CONSTANTS.ERROR_CODES.FORBIDDEN
        );
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: CONSTANTS.APPOINTMENT_STATUS.CANCELLED,
        cancelledBy: data.cancelledBy,
        cancellationReason: data.cancellationReason,
      },
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

    if (appointment.slot) {
      await prisma.availableSlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: false, bookedBy: null, bookedAt: null }
      });
    }

    return updatedAppointment;
  }

  static async getAppointmentHistory(appointmentId: string) {
    const history = await prisma.appointmentHistory.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'desc' }
    });

    return history;
  }
}
