import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class PatientSettingsService {
  static async getPatientSettings(patientId: string) {
    const settings = await prisma.patientSettings.findUnique({
      where: { patientId },
    });

    if (!settings) {
      return {
        emailNotifications: true,
        smsNotifications: true,
        appointmentReminders: true,
        prescriptionAlerts: true,
        labResultAlerts: true,
      };
    }

    return settings;
  }

  static async updatePatientSettings(patientId: string, data: any) {
    const settings = await prisma.patientSettings.upsert({
      where: { patientId },
      update: data,
      create: {
        patientId,
        ...data,
      },
    });

    return settings;
  }
}
