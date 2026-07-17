import nodemailer from 'nodemailer';
import type { EmailOptions } from '../types/auth.types.js';
import { logger } from '../utils/logger.js';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log('[EMAIL] SMTP_HOST:', process.env.SMTP_HOST);
    console.log('[EMAIL] SMTP_USER:', process.env.SMTP_USER);
    console.log('[EMAIL] SMTP_PASS:', process.env.SMTP_PASS ? '***' : 'NOT SET');
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@mediconnect.com',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      logger.info(`[EMAIL] Sending to ${options.to}: ${options.subject}`);
      await this.transporter.sendMail(mailOptions);
      logger.info(`[EMAIL] Sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      logger.error('[EMAIL] Sending failed:', error);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, token: string, firstName?: string): Promise<void> {
    const verifyUrl = `${process.env.FRONTEND_VERIFY_EMAIL_URL}?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #4F46E5;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to MediConnect Hub!</h1>
            </div>
            <div class="content">
              <p>Hello ${firstName || 'there'},</p>
              <p>Thank you for registering with MediConnect Hub. Please verify your email address to get started.</p>
              <div style="text-align: center;">
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p><a href="${verifyUrl}">${verifyUrl}</a></p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MediConnect Hub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify your email - MediConnect Hub',
      html
    });
  }

  async sendPasswordResetEmail(email: string, token: string, firstName?: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_RESET_PASSWORD_URL}?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #4F46E5;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${firstName || 'there'},</p>
              <p>We received a request to reset your password for your MediConnect Hub account.</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MediConnect Hub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset your password - MediConnect Hub',
      html
    });
  }

  async sendAppointmentReminder(
    email: string,
    patientName: string,
    doctorName: string,
    date: string,
    time: string,
    meetingLink?: string
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .appointment-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #4F46E5;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Reminder</h1>
            </div>
            <div class="content">
              <p>Hello ${patientName},</p>
              <p>This is a reminder for your upcoming appointment.</p>
              <div class="appointment-details">
                <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
                ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
              </div>
              ${meetingLink ? `<div style="text-align: center;"><a href="${meetingLink}" class="button">Join Video Call</a></div>` : ''}
              <p style="font-size: 14px; color: #666;">Please arrive 5 minutes early for your consultation.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MediConnect Hub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Appointment Reminder - MediConnect Hub',
      html
    });
  }
}

export const emailService = new EmailService();