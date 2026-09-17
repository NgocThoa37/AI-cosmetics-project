import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Brand, BrandStatus } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandRepo: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const existing = await this.brandRepo.findOne({ where: { brandCode: createBrandDto.brandCode } });
    if (existing) throw new ConflictException('Mã thương hiệu đã tồn tại');
    const brand = this.brandRepo.create(createBrandDto);
    return this.brandRepo.save(brand);
  }

  async findAll(): Promise<Brand[]> {
    return this.brandRepo.find();
  }

  async findOne(id: number): Promise<Brand> {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException(`Không tìm thấy thương hiệu với ID ${id}`);
    return brand;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    await this.findOne(id);
    await this.brandRepo.update(id, updateBrandDto);
    return this.findOne(id);
  }

  async updateStatus(id: number, status: BrandStatus): Promise<Brand> {
    await this.findOne(id);
    await this.brandRepo.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const brand = await this.findOne(id);
    const productCount = await this.brandRepo
      .createQueryBuilder('brand')
      .leftJoin('brand.products', 'product')
      .where('brand.id = :id', { id })
      .andWhere('product.id IS NOT NULL')
      .getCount();
    
    if (productCount > 0) {
      throw new ConflictException('Không thể xóa thương hiệu vì đang có sản phẩm sử dụng');
    }
    await this.brandRepo.delete(id);
  }

  async search(keyword: string): Promise<Brand[]> {
    return this.brandRepo.find({
      where: [
        { name: Like(`%${keyword}%`) },
        { brandCode: Like(`%${keyword}%`) },
        { origin: Like(`%${keyword}%`) },
      ],
    });
  }
}