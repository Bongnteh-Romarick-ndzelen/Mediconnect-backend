import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class PrescriptionService {
  static async createPrescription(providerId: string, data: any) {
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

      if (appointment.providerId !== providerId) {
        throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
      }
    }

    const prescription = await prisma.prescription.create({
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

    return prescription;
  }

  static async getPrescription(id: string, userId: string, userRole: string) {
    const prescription = await prisma.prescription.findUnique({
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

    if (!prescription) {
      throw new AppError('Prescription not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, CONSTANTS.ERROR_CODES.PRESCRIPTION_NOT_FOUND);
    }

    if (userRole !== CONSTANTS.ROLES.ADMIN && userRole !== CONSTANTS.ROLES.SUPPORT) {
      if (prescription.patientId !== userId && prescription.providerId !== userId) {
        throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
      }
    }

    return prescription;
  }

  static async listPrescriptions(userId: string, userRole: string, query: {
    page?: string;
    limit?: string;
    status?: string;
    patientId?: string;
    providerId?: string;
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

    if (query.patientId && (userRole === CONSTANTS.ROLES.ADMIN || userRole === CONSTANTS.ROLES.SUPPORT)) {
      where.patientId = query.patientId;
    }

    if (query.providerId && (userRole === CONSTANTS.ROLES.ADMIN || userRole === CONSTANTS.ROLES.SUPPORT)) {
      where.providerId = query.providerId;
    }

    if (query.startDate || query.endDate) {
      where.startDate = {};
      if (query.startDate) {
        where.startDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.startDate.lte = new Date(query.endDate);
      }
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
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
        orderBy: { startDate: 'desc' }
      }),
      prisma.prescription.count({ where })
    ]);

    return {
      prescriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updatePrescription(id: string, providerId: string, data: any) {
    const prescription = await prisma.prescription.findUnique({
      where: { id }
    });

    if (!prescription) {
      throw new AppError('Prescription not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, CONSTANTS.ERROR_CODES.PRESCRIPTION_NOT_FOUND);
    }

    if (prescription.providerId !== providerId) {
      throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
    }

    const updatedPrescription = await prisma.prescription.update({
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

    return updatedPrescription;
  }

  static async requestRefill(id: string, patientId: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id }
    });

    if (!prescription) {
      throw new AppError('Prescription not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, CONSTANTS.ERROR_CODES.PRESCRIPTION_NOT_FOUND);
    }

    if (prescription.patientId !== patientId) {
      throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
    }

    if (prescription.refillsUsed >= prescription.refills) {
      throw new AppError('No refills remaining', CONSTANTS.HTTP_STATUS.BAD_REQUEST, CONSTANTS.ERROR_CODES.PRESCRIPTION_REFILL_LIMIT);
    }

    const updatedPrescription = await prisma.prescription.update({
      where: { id },
      data: {
        status: 'REFILL_REQUESTED'
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

    return updatedPrescription;
  }
}
