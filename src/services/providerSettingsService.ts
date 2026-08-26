import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class ProviderSettingsService {
  static async getProviderSettings(providerId: string) {
    const settings = await prisma.providerSettings.findUnique({
      where: { providerId },
    });

    if (!settings) {
      return {
        emailNotifications: true,
        smsNotifications: true,
        appointmentReminders: true,
        videoQuality: '720p',
        enableRecording: true,
        enableChat: true,
        maxAppointmentsPerDay: 20,
        breakDuration: 30,
        bufferTime: 15,
        autoInvoice: true,
        invoicePrefix: 'INV-',
        slotDuration: 30,
        allowSameDayBooking: true,
        advanceBookingDays: 30,
        cancellationPolicy: null,
      };
    }

    return settings;
  }

  static async updateProviderSettings(providerId: string, data: any) {
    const settings = await prisma.providerSettings.upsert({
      where: { providerId },
      update: data,
      create: {
        providerId,
        ...data,
      },
    });

    return settings;
  }
}
