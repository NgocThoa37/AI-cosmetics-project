import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UsersModule } from '../users/users.module';
import { AdminModule } from '../admin/admin.module';
import { UploadService } from './upload.service';

@Module({
  imports: [
    UsersModule,
    AdminModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}