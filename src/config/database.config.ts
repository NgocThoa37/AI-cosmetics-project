import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('DB_HOST'),
  port: +configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  charset: 'utf8mb4',
  timezone: '+07:00',
  connectorPackage: 'mysql2',
  // ✅ SSL cho TiDB Cloud
  ssl:
    configService.get('DB_SSL') === 'true'
      ? {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true,
        }
      : false,
});