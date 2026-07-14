import { randomBytes, createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import { CONSTANTS } from '../config/constants.js';

// ============================================
// PASSWORD HELPERS
// ============================================

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================
// TOKEN HELPERS
// ============================================

export const generateRandomToken = (length: number = 32): string => {
  return randomBytes(length).toString('hex');
};

export const generateVerificationToken = (): string => {
  return generateRandomToken(32);
};

export const generateResetToken = (): string => {
  return generateRandomToken(32);
};

export const generateApiKey = (): string => {
  return `pk_${generateRandomToken(24)}`;
};

export const hashToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

// ============================================
// DATE HELPERS
// ============================================

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace('T', ' ').substring(0, 19);
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toTimeString().split(' ')[0].substring(0, 5);
};

export const isValidDate = (date: any): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

export const getAge = (dateOfBirth: Date | string): number => {
  const today = new Date();
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const isDateInPast = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
};

export const isDateInFuture = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
};

// ============================================
// PAGINATION HELPERS
// ============================================

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getPagination = (options: PaginationOptions) => {
  const page = Math.max(1, options.page || CONSTANTS.PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    CONSTANTS.PAGINATION.MAX_LIMIT,
    Math.max(1, options.limit || CONSTANTS.PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;
  
  return {
    page,
    limit,
    skip,
    take: limit,
    sortBy: options.sortBy || 'createdAt',
    sortOrder: options.sortOrder || 'desc',
    search: options.search,
    filters: options.filters || {},
  };
};

export const createPaginationResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

// ============================================
// VALIDATION HELPERS
// ============================================

export const isValidEmail = (email: string): boolean => {
  return CONSTANTS.PATTERNS.EMAIL.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return CONSTANTS.PATTERNS.PHONE.test(phone);
};

export const isValidLicense = (license: string): boolean => {
  return CONSTANTS.PATTERNS.LICENSE.test(license);
};

export const isValidURL = (url: string): boolean => {
  return CONSTANTS.PATTERNS.URL.test(url);
};

export const isValidZipCode = (zip: string): boolean => {
  return CONSTANTS.PATTERNS.ZIPCODE.test(zip);
};

export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/<script.*?>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// ============================================
// OBJECT HELPERS
// ============================================

export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result: any = {};
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

export const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// ============================================
// STRING HELPERS
// ============================================

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const truncate = (str: string, length: number = 100, suffix: string = '...'): string => {
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const titleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// ============================================
// NUMBER HELPERS
// ============================================

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const roundToTwo = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ============================================
// ARRAY HELPERS
// ============================================

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const uniqueArray = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

// ============================================
// RESPONSE HELPERS
// ============================================

export const successResponse = <T>(
  data: T,
  message: string = 'Success',
  meta?: any
) => {
  return {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
};

export const errorResponse = (
  message: string,
  code?: string,
  details?: any
) => {
  return {
    success: false,
    error: {
      code: code || 'ERROR',
      message,
      ...(details && { details }),
    },
  };
};

// ============================================
// FILE HELPERS
// ============================================

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getFileNameWithoutExtension = (filename: string): string => {
  return filename.split('.').slice(0, -1).join('.');
};

export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = generateRandomToken(8);
  const extension = getFileExtension(originalName);
  const name = getFileNameWithoutExtension(originalName);
  return `${name}_${timestamp}_${random}.${extension}`;
};

export const getFileSizeInMB = (bytes: number): string => {
  return (bytes / (1024 * 1024)).toFixed(2);
};

export const isAllowedFileType = (mimeType: string): boolean => {
  return CONSTANTS.FILE.ALLOWED_TYPES.includes(mimeType);
};

// ============================================
// SLEEP/DELAY
// ============================================

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ============================================
// ENVIRONMENT HELPERS
// ============================================

export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isTest = (): boolean => {
  return process.env.NODE_ENV === 'test';
};

export const getEnvironment = (): string => {
  return process.env.NODE_ENV || 'development';
};

// ============================================
// MISC HELPERS
// ============================================

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const toBoolean = (value: string | boolean | undefined): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  return false;
};

export default {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateRandomToken,
  generateVerificationToken,
  generateResetToken,
  generateApiKey,
  hashToken,
  formatDate,
  formatDateTime,
  formatTime,
  isValidDate,
  getDateRange,
  getAge,
  isDateInPast,
  isDateInFuture,
  getPagination,
  createPaginationResponse,
  isValidEmail,
  isValidPhone,
  isValidLicense,
  isValidURL,
  isValidZipCode,
  sanitizeString,
  sanitizeEmail,
  omit,
  pick,
  deepClone,
  isEmpty,
  isUUID,
  generateSlug,
  truncate,
  capitalize,
  titleCase,
  formatCurrency,
  roundToTwo,
  generateRandomNumber,
  chunkArray,
  uniqueArray,
  groupBy,
  successResponse,
  errorResponse,
  getFileExtension,
  getFileNameWithoutExtension,
  generateUniqueFileName,
  getFileSizeInMB,
  isAllowedFileType,
  sleep,
  isDevelopment,
  isProduction,
  isTest,
  getEnvironment,
  getCurrentTimestamp,
  calculatePercentage,
  clamp,
  toBoolean,
};