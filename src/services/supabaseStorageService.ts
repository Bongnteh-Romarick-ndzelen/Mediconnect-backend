import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'mediconnect-files';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase Storage credentials are not configured');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export class SupabaseStorageService {
  static async uploadFile(file: Express.Multer.File, folder: string = 'uploads') {
    try {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        logger.error('Supabase upload error:', error);
        throw new Error(`File upload failed: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        fileName: data.path,
        url: urlData.publicUrl,
        size: file.size,
        mimeType: file.mimetype
      };
    } catch (error) {
      logger.error('Supabase upload error:', error);
      throw error;
    }
  }

  static async deleteFile(fileName: string) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        logger.error('Supabase delete error:', error);
        throw new Error(`File deletion failed: ${error.message}`);
      }

      return true;
    } catch (error) {
      logger.error('Supabase delete error:', error);
      throw error;
    }
  }

  static getPublicUrl(fileName: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  static async listFiles(folder: string = 'uploads') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0
        });

      if (error) {
        logger.error('Supabase list error:', error);
        throw new Error(`Failed to list files: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Supabase list error:', error);
      throw error;
    }
  }
}
