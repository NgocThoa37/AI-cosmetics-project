import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { AdminService } from '../admin/admin.service';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(
    private usersService: UsersService,
    private adminService: AdminService,
    private uploadService: UploadService,
  ) {}

  // GET - Lấy danh sách ảnh
  @Get('products')
  async getProductImages() {
    console.log('📤 [UPLOAD] GET /upload/products');
    try {
      const images = await this.adminService.getProductImages();
      console.log('✅ [UPLOAD] Found:', images.length, 'images');
      return images;
    } catch (error) {
      console.error('❌ [UPLOAD] GET Error:', error);
      throw error;
    }
  }

  // POST - Upload ảnh sản phẩm lên Cloudinary
  @Post('product')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // ✅ Lưu trong RAM, không ghi đĩa
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('productId') productId?: string,
  ) {
    console.log('📥 [UPLOAD] File:', file?.originalname, 'Size:', file?.size);
    console.log('📥 [UPLOAD] ProductId:', productId);

    if (!file) {
      throw new BadRequestException('Không tìm thấy file upload');
    }

    // ✅ Upload lên Cloudinary, nhận URL trả về
    const imageUrl = await this.uploadService.uploadToCloudinary(file, 'products', 'product');

    console.log('✅ [UPLOAD] Image URL:', imageUrl);

    // Chỉ trả URL, frontend sẽ gọi API tạo record riêng
    return {
      message: 'Upload ảnh thành công',
      imageUrl: imageUrl,
      filename: imageUrl.split('/').pop(),
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  // POST - Upload ảnh review lên Cloudinary
  @Post('review')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Chỉ chấp nhận file ảnh'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadReviewImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file upload');
    }

    const imageUrl = await this.uploadService.uploadToCloudinary(file, 'reviews', 'review');

    return {
      message: 'Upload ảnh review thành công',
      imageUrl,
      filename: imageUrl.split('/').pop(),
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  // POST - Upload avatar lên Cloudinary
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new BadRequestException('Chỉ chấp nhận file ảnh'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file upload');
    }

    const imageUrl = await this.uploadService.uploadToCloudinary(file, 'avatars', 'avatar');

    return {
      message: 'Upload avatar thành công',
      imageUrl,
      filename: imageUrl.split('/').pop(),
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  // DELETE - Xóa ảnh sản phẩm
  @Delete('product/:id')
  @UseGuards(JwtAuthGuard)
  async deleteProductImage(@Param('id') id: string) {
    console.log('📤 [UPLOAD] DELETE /upload/product/:id', id);

    try {
      const images = await this.adminService.getProductImages();
      const image = images.find((img) => img.id === Number(id));

      if (!image) {
        throw new NotFoundException('Không tìm thấy ảnh');
      }

      // ✅ Xóa ảnh trên Cloudinary
      await this.uploadService.deleteFromCloudinary(image.imageUrl);

      // Xóa record DB
      await this.adminService.deleteProductImage(Number(id));
      console.log('✅ [UPLOAD] Record deleted from DB');

      return {
        success: true,
        message: 'Xóa ảnh thành công',
      };
    } catch (error) {
      console.error('❌ [UPLOAD] DELETE Error:', error);
      throw error;
    }
  }

  // DELETE - Xóa file bất kỳ trên Cloudinary theo URL
  @Delete('file')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Body('fileUrl') fileUrl: string) {
    console.log('🗑️ [UPLOAD] Delete file:', fileUrl);

    if (!fileUrl) {
      throw new BadRequestException('fileUrl is required');
    }

    await this.uploadService.deleteFromCloudinary(fileUrl);

    return {
      success: true,
      message: 'Xóa file thành công',
    };
  }
}