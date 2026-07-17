import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class NotificationService {
  static async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    actionUrl?: string;
    actionLabel?: string;
    priority?: string;
    expiresAt?: Date;
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        priority: data.priority || 'NORMAL',
        expiresAt: data.expiresAt
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      }
    });

    return notification;
  }

  static async getNotification(id: string, userId: string, userRole: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        }
      }
    });

    if (!notification) {
      throw new AppError('Notification not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
    }

    if (userRole !== CONSTANTS.ROLES.ADMIN && userRole !== CONSTANTS.ROLES.SUPPORT) {
      if (notification.userId !== userId) {
        throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
      }
    }

    return notification;
  }

  static async listNotifications(userId: string, userRole: string, query: {
    page?: string;
    limit?: string;
    isRead?: string;
    type?: string;
    priority?: string;
  }) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userRole !== CONSTANTS.ROLES.ADMIN && userRole !== CONSTANTS.ROLES.SUPPORT) {
      where.userId = userId;
    }

    if (query.isRead !== undefined) {
      where.isRead = query.isRead === 'true';
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          ...where,
          isRead: false
        }
      })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount
    };
  }

  static async markAsRead(id: string, userId: string, userRole: string) {
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new AppError('Notification not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
    }

    if (userRole !== CONSTANTS.ROLES.ADMIN && userRole !== CONSTANTS.ROLES.SUPPORT) {
      if (notification.userId !== userId) {
        throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
      }
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return updatedNotification;
  }

  static async markAllAsRead(userId: string, userRole: string) {
    if (userRole === CONSTANTS.ROLES.ADMIN || userRole === CONSTANTS.ROLES.SUPPORT) {
      await prisma.notification.updateMany({
        where: { isRead: false },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    } else {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    }

    return { message: 'All notifications marked as read' };
  }

  static async deleteNotification(id: string, userId: string, userRole: string) {
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new AppError('Notification not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
    }

    if (userRole !== CONSTANTS.ROLES.ADMIN && userRole !== CONSTANTS.ROLES.SUPPORT) {
      if (notification.userId !== userId) {
        throw new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, CONSTANTS.ERROR_CODES.FORBIDDEN);
      }
    }

    await prisma.notification.delete({
      where: { id }
    });

    return { message: 'Notification deleted successfully' };
  }

  static async deleteAllNotifications(userId: string, userRole: string) {
    if (userRole === CONSTANTS.ROLES.ADMIN || userRole === CONSTANTS.ROLES.SUPPORT) {
      await prisma.notification.deleteMany({});
    } else {
      await prisma.notification.deleteMany({
        where: { userId }
      });
    }

    return { message: 'All notifications deleted successfully' };
  }
}
