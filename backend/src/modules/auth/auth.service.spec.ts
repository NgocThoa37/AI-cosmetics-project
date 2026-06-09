jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  getRepository: jest.fn().mockReturnValue({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Account } from './entities/account.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from '../../common/services/email.service';
import { CacheService } from '../../common/services/cache.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockAccountRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_token'),
  verify: jest.fn(),
};

const mockEmailService = { sendOtpEmail: jest.fn() };
const mockCacheService = { set: jest.fn(), get: jest.fn(), del: jest.fn() };

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockAccountRepository),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Account), useValue: mockAccountRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if username exists', async () => {
      mockAccountRepository.findOne.mockResolvedValueOnce({ id: 1 });
      await expect(service.register({ username: 'test', email: 'a@b.com', password: 'Pass123', fullName: 'Test' }))
        .rejects.toThrow(ConflictException);
    });
    
    it('should register successfully', async () => {
      mockAccountRepository.findOne.mockResolvedValueOnce(null);
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      mockUsersService.create.mockResolvedValueOnce({ id: 1 });
      mockAccountRepository.create.mockReturnValue({});
      mockAccountRepository.save.mockResolvedValueOnce({});
      const result = await service.register({ username: 'test', email: 'a@b.com', password: 'Pass123', fullName: 'Test' });
      expect(result.message).toBe('Registration successful');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.login({ username: 'test', password: 'xxx' })).rejects.toThrow(UnauthorizedException);
    });
    
    it('should return tokens on success', async () => {
      const fakeAccount = { 
        id: 1, 
        username: 'test', 
        password: await bcrypt.hash('Pass123', 10), 
        role: 'customer', 
        status: 'active',
        user: { id: 1, fullName: 'Test', email: 'a@b.com' } 
      };
      mockAccountRepository.findOne.mockResolvedValueOnce(fakeAccount);
      const result = await service.login({ username: 'test', password: 'Pass123' });
      expect(result.accessToken).toBe('mock_token');
    });
  });
});