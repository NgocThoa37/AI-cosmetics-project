import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockCategory = { id: 1, name: 'Skincare', slug: 'skincare', parentId: null, description: '', displayOrder: 0 };
const mockRepository = {
  create: jest.fn().mockReturnValue(mockCategory),
  save: jest.fn().mockResolvedValue(mockCategory),
  find: jest.fn().mockResolvedValue([mockCategory]),
  findOne: jest.fn().mockResolvedValue(mockCategory),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  count: jest.fn().mockResolvedValue(0),
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: mockRepository },
      ],
    }).compile();
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should save category', async () => {
    const dto = { name: 'Makeup', slug: 'makeup' };
    const result = await service.create(dto as any);
    expect(result).toEqual(mockCategory);
  });

  it('remove should throw if has children', async () => {
    jest.spyOn(mockRepository, 'count').mockResolvedValueOnce(1);
    await expect(service.remove(1)).rejects.toThrow(ConflictException);
  });
});