import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtAccessConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get('JWT_ACCESS_SECRET'),
  signOptions: { expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN') },
});

export const getJwtRefreshConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get('JWT_REFRESH_SECRET'),
  signOptions: { expiresIn: configService.get('JWT_REFRESH_EXPIRES_IN') },
});