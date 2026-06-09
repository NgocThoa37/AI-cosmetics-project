import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { UsersService } from '../users/users.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockEmployee = { id: 1, employeeCode: 'EMP001', hireDate: new Date(), userId: 1 };
const mockRepository = {
  create: jest.fn().mockReturnValue(mockEmployee),
  save: jest.fn().mockResolvedValue(mockEmployee),
  find: jest.fn().mockResolvedValue([mockEmployee]),
  findOne: jest.fn().mockResolvedValue(mockEmployee),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockEmployee]),
  })),
};
const mockUsersService = { findOne: jest.fn().mockResolvedValue({ id: 1 }) };

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(Employee), useValue: mockRepository },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();
    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should save employee', async () => {
    const dto = { employeeCode: 'EMP002', hireDate: new Date(), userId: 1 };
    const result = await service.create(dto);
    expect(result).toEqual(mockEmployee);
  });

  it('findOne should throw if not found', async () => {
    jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });
});