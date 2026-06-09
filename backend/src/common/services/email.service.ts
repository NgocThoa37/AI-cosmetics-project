import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getEmailTransporter } from '../../config/email.config';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter;
  private readonly logger = new Logger(EmailService.name);
  
  constructor(private configService: ConfigService) {
    this.transporter = getEmailTransporter(configService);
  }

  async onModuleInit() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Email connection verified successfully');
    } catch (error) {
      const err = error as Error;
      this.logger.error('❌ Email connection failed:', err.message);
    }
  }

  async sendOtpEmail(to: string, otp: string) {
    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to,
      subject: 'Mã OTP xác thực tài khoản Cosmetics Store',
      html: `<p>Mã OTP của bạn là: <b>${otp}</b>. Có hiệu lực trong 5 phút.</p>`,
    };
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ OTP sent to ${to}`);
      this.logger.log(`Message ID: ${info.messageId}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error('❌ Email sending failed:');
      this.logger.error(`Error message: ${err.message}`);
      
      const errAny = error as any;
      if (errAny.code) this.logger.error(`Error code: ${errAny.code}`);
      if (errAny.response) this.logger.error(`Server response: ${errAny.response}`);
      
      throw new Error(`Email sending failed: ${err.message}`);
    }
  }
}