import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload file từ buffer (memoryStorage) lên Cloudinary
   * @param file - File từ multer (memoryStorage)
   * @param folder - Thư mục trên Cloudinary: 'products' | 'reviews' | 'avatars'
   * @param prefix - Tiền tố tên file: 'product' | 'review' | 'avatar'
   * @returns URL công khai của ảnh
   */
  async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
    prefix: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file');
    }

    return new Promise((resolve, reject) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const publicId = `aicosmetics/${folder}/${prefix}-${uniqueSuffix}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'image',
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            return reject(new BadRequestException('Upload ảnh thất bại'));
          }
          if (!result) {
            return reject(new BadRequestException('Cloudinary không trả về kết quả'));
          }
          console.log('✅ Cloudinary upload success:', result.secure_url);
          resolve(result.secure_url);
        },
      );

      // Convert buffer thành stream và pipe vào Cloudinary
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Xóa ảnh trên Cloudinary bằng URL
   * @param imageUrl - URL đầy đủ của ảnh trên Cloudinary
   */
  async deleteFromCloudinary(imageUrl: string): Promise<void> {
    if (!imageUrl) return;

    try {
      // Chỉ xử lý URL Cloudinary
      if (!imageUrl.includes('cloudinary.com')) {
        console.warn('⚠️ Không phải URL Cloudinary, bỏ qua:', imageUrl);
        return;
      }

      const parts = imageUrl.split('/upload/');
      if (parts.length < 2) {
        console.warn('⚠️ URL không hợp lệ:', imageUrl);
        return;
      }

      let pathPart = parts[1];
      if (pathPart.startsWith('v')) {
        const slashIndex = pathPart.indexOf('/');
        pathPart = pathPart.substring(slashIndex + 1);
      }

      // Bỏ phần extension (.jpg, .png, ...)
      const publicId = pathPart.replace(/\.[^/.]+$/, '');

      console.log('🗑️ Xóa Cloudinary public_id:', publicId);

      await cloudinary.uploader.destroy(publicId);
      console.log('✅ Đã xóa ảnh trên Cloudinary');
    } catch (error) {
      console.error('❌ Lỗi xóa ảnh Cloudinary:', error);
      // Không throw để không làm hỏng flow xóa record DB
    }
  }
}