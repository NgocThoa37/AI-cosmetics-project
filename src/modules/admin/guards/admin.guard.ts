import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';  // ✅ THÊM IMPORT

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,  // ✅ THÊM
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    console.log('🔑 [AdminGuard] ===== START =====');
    console.log('🔑 [AdminGuard] Token exists:', !!token);
    
    if (!token) {
      console.log('❌ [AdminGuard] No token');
      throw new UnauthorizedException('No token provided');
    }
    
    try {
      // ✅ Lấy secret từ ConfigService
      const secret = this.configService.get<string>('JWT_ACCESS_SECRET')!;
      console.log('🔑 [AdminGuard] Secret (first 10 chars):', secret.substring(0, 10) + '...');
      
      const payload = this.jwtService.verify(token, { secret });
      console.log('🔑 [AdminGuard] Payload:', payload);
      console.log('🔑 [AdminGuard] Role:', payload.role);
      
      if (payload.role !== 'admin' && payload.role !== 'employee') {
        console.log('❌ [AdminGuard] Role not allowed:', payload.role);
        throw new UnauthorizedException('Tài khoản không có quyền truy cập');
      }
      
      request.user = payload;
      console.log('✅ [AdminGuard] Access granted');
      console.log('🔑 [AdminGuard] ===== END =====');
      return true;
    } catch (error: any) {
      console.error('❌ [AdminGuard] Error:', error.message);
      throw new UnauthorizedException('Invalid token: ' + error.message);
    }
  }
}