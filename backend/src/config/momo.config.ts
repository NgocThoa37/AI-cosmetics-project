import { ConfigService } from '@nestjs/config';

export const getMomoConfig = (configService: ConfigService) => ({
  accessKey: configService.get<string>('MOMO_ACCESS_KEY'),
  secretKey: configService.get<string>('MOMO_SECRET_KEY'),
  partnerCode: configService.get<string>('MOMO_PARTNER_CODE'),
  redirectUrl: configService.get<string>('MOMO_REDIRECT_URL'),
  ipnUrl: configService.get<string>('MOMO_IPN_URL'),
  endpoint: configService.get<string>('MOMO_ENDPOINT'),
  requestType: configService.get<string>('MOMO_REQUEST_TYPE') || 'captureWallet',
});

export type MomoConfig = ReturnType<typeof getMomoConfig>;