import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class ReviewService {
  static async createReview(patientId: string, data: any) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: {
        review: true
      }
    });

    if (!appointment) {
      throw new AppError('Appointment not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, CONSTANTS.ERROR_CODES.APPOINTMENT_NOT_FOUND);
    }

    if (appointment.patientId !== patientId) {
      throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
    }

    if (appointment.status !== 'COMPLETED') {
      throw new AppError('Can only review completed appointments', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INVALID_APPOINTMENT_STATUS');
    }

    if (appointment.review) {
      throw new AppError('Review already exists for this appointment', CONSTANTS.HTTP_STATUS.CONFLICT, 'REVIEW_EXISTS');
    }

    const review = await prisma.review.create({
      data: {
        ...data,
        patientId,
        providerId: appointment.providerId,
        userId: patientId
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

    await this.updateProviderRating(data.providerId);

    return review;
  }

  static async updateProviderRating(providerId: string) {
    const reviews = await prisma.review.findMany({
      where: { providerId }
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    await prisma.provider.update({
      where: { id: providerId },
      data: {
        rating: averageRating,
        totalReviews
      }
    });
  }

  static async getReview(id: string, userId: string, userRole: string) {
    const review = await prisma.review.findUnique({
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

    if (!review) {
      throw new AppError('Review not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
    }

    if (userRole !== CONSTANTS.ROLES.ADMIN && userRole !== CONSTANTS.ROLES.SUPPORT) {
      if (review.patientId !== userId && review.providerId !== userId) {
        throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
      }
    }

    return review;
  }

  static async listReviews(query: {
    page?: string;
    limit?: string;
    providerId?: string;
    patientId?: string;
    rating?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.providerId) {
      where.providerId = query.providerId;
    }

    if (query.patientId) {
      where.patientId = query.patientId;
    }

    if (query.rating) {
      where.rating = parseInt(query.rating);
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

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
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
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where })
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateReview(id: string, patientId: string, data: any) {
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw new AppError('Review not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
    }

    if (review.patientId !== patientId) {
      throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
    }

    const updatedReview = await prisma.review.update({
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

    await this.updateProviderRating(review.providerId);

    return updatedReview;
  }

  static async respondToReview(id: string, providerId: string, providerResponse: string) {
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw new AppError('Review not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
    }

    if (review.providerId !== providerId) {
      throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        providerResponse,
        providerResponseAt: new Date()
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

    return updatedReview;
  }

  static async deleteReview(id: string, userId: string, userRole: string) {
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      throw new AppError('Review not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'REVIEW_NOT_FOUND');
    }

    if (userRole !== CONSTANTS.ROLES.ADMIN && userRole !== CONSTANTS.ROLES.SUPPORT) {
      if (review.patientId !== userId) {
        throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
      }
    }

    await prisma.review.delete({
      where: { id }
    });

    await this.updateProviderRating(review.providerId);

    return { message: 'Review deleted successfully' };
  }
}
