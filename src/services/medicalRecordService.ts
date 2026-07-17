import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class MedicalRecordService {
  static async createMedicalRecord(providerId: string, data: any) {
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId }
    });

    if (!patient) {
      throw new AppError('Patient not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, CONSTANTS.ERROR_CODES.PATIENT_NOT_FOUND);
    }

    if (data.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId }
      });

      if (!appointment) {
        throw new AppError('Appointment not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, CONSTANTS.ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      if (appointment.providerId !== providerId && appointment.patientId !== data.patientId) {
        throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
      }
    }

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        ...data,
        providerId
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
        }
      }
    });

    return medicalRecord;
  }

  static async getMedicalRecord(id: string, userId: string, userRole: string) {
    const record = await prisma.medicalRecord.findUnique({
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
    });

    if (!record) {
      throw new AppError('Medical record not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, CONSTANTS.ERROR_CODES.RECORD_NOT_FOUND);
    }

    if (userRole !== CONSTANTS.ROLES.ADMIN && userRole !== CONSTANTS.ROLES.SUPPORT) {
      if (record.patientId !== userId && record.providerId !== userId) {
        throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.RECORD_ACCESS_DENIED);
      }
    }

    return record;
  }

  static async listMedicalRecords(userId: string, userRole: string, query: {
    page?: string;
    limit?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    patientId?: string;
    providerId?: string;
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

    if (query.type) {
      where.type = query.type;
    }

    if (query.patientId && (userRole === CONSTANTS.ROLES.ADMIN || userRole === CONSTANTS.ROLES.SUPPORT)) {
      where.patientId = query.patientId;
    }

    if (query.providerId && (userRole === CONSTANTS.ROLES.ADMIN || userRole === CONSTANTS.ROLES.SUPPORT)) {
      where.providerId = query.providerId;
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
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
          }
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' }
      }),
      prisma.medicalRecord.count({ where })
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateMedicalRecord(id: string, providerId: string, data: any) {
    const record = await prisma.medicalRecord.findUnique({
      where: { id }
    });

    if (!record) {
      throw new AppError('Medical record not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, CONSTANTS.ERROR_CODES.RECORD_NOT_FOUND);
    }

    if (record.providerId !== providerId) {
      throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
    }

    const updatedRecord = await prisma.medicalRecord.update({
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
        }
      }
    });

    return updatedRecord;
  }

  static async deleteMedicalRecord(id: string, providerId: string) {
    const record = await prisma.medicalRecord.findUnique({
      where: { id }
    });

    if (!record) {
      throw new AppError('Medical record not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, CONSTANTS.ERROR_CODES.RECORD_NOT_FOUND);
    }

    if (record.providerId !== providerId) {
      throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
    }

    await prisma.medicalRecord.delete({
      where: { id }
    });

    return { message: 'Medical record deleted successfully' };
  }
}
