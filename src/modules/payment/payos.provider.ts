import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';

export const PAYOS_CLIENT = 'PAYOS_CLIENT';

export const PayOSProvider = {
  provide: PAYOS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const clientId = configService.get<string>('PAYOS_CLIENT_ID');
    const apiKey = configService.get<string>('PAYOS_API_KEY');
    const checksumKey = configService.get<string>('PAYOS_CHECKSUM_KEY');

    if (!clientId || !apiKey || !checksumKey) {
      throw new Error(
        '❌ Thiếu biến môi trường PayOS. Kiểm tra PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY trong file .env',
      );
    }

    return new PayOS({ clientId, apiKey, checksumKey });
  },
};