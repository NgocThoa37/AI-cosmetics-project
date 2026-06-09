import { Module, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Account } from './entities/account.entity';
import { Customer } from '../customers/entities/customer.entity';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailService } from '../../common/services/email.service';
import { CacheService } from '../../common/services/cache.service';
import Redis from 'ioredis';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'), 
        signOptions: { 
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN', '1h') 
        },
      }),
    }),
    TypeOrmModule.forFeature([Account, Customer]),
    UsersModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    EmailService,
    CacheService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD', undefined),
          db: configService.get('REDIS_DB', 0),
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [AuthController],
})
export class AuthModule implements OnModuleInit {
  constructor(private authService: AuthService) {}
  async onModuleInit() {
    await this.authService.createDefaultAdmin();
  }
}