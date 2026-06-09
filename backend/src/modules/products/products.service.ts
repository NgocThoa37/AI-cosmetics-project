import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { ProductDetail } from './entities/product-detail.entity';
import { ProductImage } from './entities/product-image.entity';
import { Size } from './entities/size.entity';
import { Color } from './entities/color.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDetailDto } from './dto/create-product-detail.dto';
import { UpdateProductDetailDto } from './dto/update-product-detail.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';



@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductDetail) private detailRepo: Repository<ProductDetail>,
    @InjectRepository(ProductImage) private imageRepo: Repository<ProductImage>,
    @InjectRepository(Size) private sizeRepo: Repository<Size>,
    @InjectRepository(Color) private colorRepo: Repository<Color>,
  ) {}

  // Product CRUD
  async createProduct(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug exists');
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async findAllProducts(): Promise<Product[]> {
    return this.productRepo.find({ relations: ['category', 'details', 'details.images'] });
  }

  async findOneProduct(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'details', 'details.color', 'details.size', 'details.images'], 
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.findOneProduct(id);
    await this.productRepo.update(id, dto);
    return this.findOneProduct(id);
  }

  async removeProduct(id: string): Promise<void> {
    await this.findOneProduct(id);
    await this.productRepo.delete(id);
  }

  async searchProducts(keyword: string): Promise<Product[]> {
    return this.productRepo.find({ where: [{ name: Like(`%${keyword}%`) }, { slug: Like(`%${keyword}%`) }] });
  }

  async updateProductStatus(id: string, status: ProductStatus): Promise<Product> {
    const product = await this.findOneProduct(id);
    product.status = status;
    return this.productRepo.save(product);
 }

  getStatusOptions() {
    return [
      { value: 'draft', label: 'Nháp' },
      { value: 'active', label: 'Hoạt động' },
      { value: 'inactive', label: 'Ngừng bán' },
      { value: 'out_of_stock', label: 'Hết hàng' },
    ];
  }

  // ProductDetail CRUD
  async createDetail(dto: CreateProductDetailDto): Promise<ProductDetail> {
    const existing = await this.detailRepo.findOne({ where: { sku: dto.sku } });
    if (existing) throw new ConflictException('SKU exists');
    const detail = this.detailRepo.create(dto);
    return this.detailRepo.save(detail);
  }

  async findAllDetails(): Promise<ProductDetail[]> {
    return this.detailRepo.find({ relations: ['product', 'color', 'size', 'images'] });
  }

  async findOneDetail(id: string): Promise<ProductDetail> {
    const detail = await this.detailRepo.findOne({ where: { id }, relations: ['product', 'color', 'size', 'images'] });
    if (!detail) throw new NotFoundException('Product detail not found');
    return detail;
  }

  async updateDetail(id: string, dto: UpdateProductDetailDto): Promise<ProductDetail> {
    await this.findOneDetail(id);
    await this.detailRepo.update(id, dto);
    return this.findOneDetail(id);
  }

  async removeDetail(id: string): Promise<void> {
    await this.findOneDetail(id);
    await this.detailRepo.delete(id);
  }

  // ProductImage CRUD
  async createImage(dto: CreateProductImageDto): Promise<ProductImage> {
    const image = this.imageRepo.create(dto);
    if (dto.isMain) {
      await this.imageRepo.update({ productId: dto.productId }, { isMain: false });
    }
    return this.imageRepo.save(image);
  }

  async findAllImages(): Promise<ProductImage[]> {
    return this.imageRepo.find({ relations: ['product', 'productDetail'] });
  }

  async updateImage(id: number, dto: UpdateProductImageDto): Promise<ProductImage> {
  await this.imageRepo.update(id, dto);
  const updated = await this.imageRepo.findOne({ where: { id } });
    if (!updated) {
        throw new Error('ProductImage not found');
    }
    return updated;
  }

  async removeImage(id: number): Promise<void> {
    await this.imageRepo.delete(id);
  }

  // Size 
  async findAllSizes() { return this.sizeRepo.find(); }
  async createSize(name: string) { return this.sizeRepo.save({ name }); }
  async updateSize(id: number, name: string): Promise<Size> {
    const size = await this.sizeRepo.findOne({ where: { id } });
    if (!size) throw new NotFoundException('Size not found');
    size.name = name;
    return this.sizeRepo.save(size);
  }

    async findOneSize(id: number) {
    const size = await this.sizeRepo.findOne({ where: { id } });
    if (!size) {
      throw new NotFoundException(`Size with ID ${id} not found`);
    }
    return size;
  }

  async deleteSize(id: number): Promise<void> {
    const size = await this.sizeRepo.findOne({ where: { id } });
    if (!size) throw new NotFoundException('Size not found');
    const used = await this.detailRepo.count({ where: { sizeId: id } });
    if (used > 0) throw new ConflictException('Cannot delete size because it is used by products');
    await this.sizeRepo.delete(id);
  }

  async searchSizes(keyword: string): Promise<Size[]> {
    return this.sizeRepo
      .createQueryBuilder('s')
      .where('s.name LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }

  //Color
  async findAllColors() { return this.colorRepo.find(); }
  async createColor(name: string, code?: string, hexCode?: string) { return this.colorRepo.save({ name, code, hexCode }); }
  async updateColor(id: number, data: Partial<Color>): Promise<Color> {
    const color = await this.colorRepo.findOne({ where: { id } });
      if (!color) throw new NotFoundException('Color not found');
      if (data.name) color.name = data.name;
      if (data.code) color.code = data.code;
      if (data.hexCode) color.hexCode = data.hexCode;
      return this.colorRepo.save(color);
  }

  async findOneColor(id: number) {
    const color = await this.colorRepo.findOne({ where: { id } });
    if (!color) {
      throw new NotFoundException(`Color with ID ${id} not found`);
    }
    return color;
  }

  async deleteColor(id: number): Promise<void> {
    const color = await this.colorRepo.findOne({ where: { id } });
    if (!color) throw new NotFoundException('Color not found');
    const used = await this.detailRepo.count({ where: { colorId: id } });
    if (used > 0) throw new ConflictException('Cannot delete color because it is used by products');
    await this.colorRepo.delete(id);
  }

  async searchColors(keyword: string): Promise<Color[]> {
    return this.colorRepo
      .createQueryBuilder('c')
      .where('c.name LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('c.code LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }

  async updateDetailQuantity(id: string, quantity: number): Promise<ProductDetail> {
    const detail = await this.findOneDetail(id);
    detail.quantity = quantity;
    return this.detailRepo.save(detail);
  }

  async updateAverageRating(productId: string, avgRating: number): Promise<void> {
    await this.productRepo.update(productId, { averageRating: avgRating });
  }
}