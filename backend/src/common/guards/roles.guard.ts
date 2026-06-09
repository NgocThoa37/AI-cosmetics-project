import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../modules/auth/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    console.log('=== ROLES GUARD ===');
    console.log('Required roles:', requiredRoles);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    console.log('User from request:', user);
    console.log('User role:', user?.role);
    
    const hasRole = requiredRoles.includes(user?.role);
    console.log('Result:', hasRole);
    console.log('===================');
    
    return hasRole;
  }
}