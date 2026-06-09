import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export const getEmailTransporter = (configService: ConfigService) => {
  const host = configService.get('EMAIL_HOST');
  const port = +configService.get('EMAIL_PORT');
  const user = configService.get('EMAIL_USER');
  const pass = configService.get('EMAIL_PASS');

  console.log('=== EMAIL CONFIG CHECK ===');
  console.log('Host:', host);
  console.log('Port:', port);
  console.log('User:', user);
  console.log('Pass exists:', !!pass);
  console.log('=========================');

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: false,
    auth: {
      user: user,
      pass: pass,
    },
  });
};