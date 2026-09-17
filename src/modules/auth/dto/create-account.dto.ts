import { Role } from '../enums/role.enum';

export class CreateAccountDto {
  username!: string;
  password!: string;
  email!: string;
  fullName!: string;
  phone?: string;
  avatar?: string;
  role?: Role;
  status?: string;
  
}