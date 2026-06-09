import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
    });
  }
  
  async validate(payload: any) {
    console.log('=== JWT STRATEGY ===');
    console.log('Payload nhận được:', payload);
    console.log('====================');
    
    return { 
      userId: payload.sub, 
      username: payload.username, 
      role: payload.role 
    };
  }
}