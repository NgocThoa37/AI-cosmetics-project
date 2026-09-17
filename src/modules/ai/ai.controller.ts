// src/modules/ai/ai.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Req, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { AnalyzeReviewsDto } from './dto/analyze-reviews.dto';
import { SimilarProductsDto } from './dto/similar-products.dto';
import { SuggestRoutineDto } from './dto/suggest-routine.dto';
import { EmbeddingDto } from './dto/embedding.dto';

@ApiTags('AI Assistant')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Chatbot tư vấn skincare
   * POST /ai/chat
   */
  @Post('chat')
  @ApiOperation({ summary: 'Chat với trợ lý AI tư vấn skincare' })
  @ApiResponse({ status: 200, description: 'Phản hồi thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatDto, @Req() req: Request) {
    console.log('📨 Raw body:', req.body);
    console.log('📨 DTO:', dto);
    console.log('📨 Message from DTO:', dto?.message);
    console.log('📨 Content-Type:', req.headers['content-type']);
    
    let message = dto?.message;
    if (!message && req.body) {
      message = req.body.message || req.body.Message || '';
    }
    
    console.log('📨 Final message:', message);
    
    return this.aiService.handleSkincareQuery(
      message || '',
      dto?.userId,
      dto?.history || [],
    );
  }

  /**
   * Tạo embedding cho text
   * POST /ai/embedding
   */
  @Post('embedding')
  @ApiOperation({ summary: 'Tạo vector embedding cho văn bản' })
  @ApiResponse({ status: 200, description: 'Tạo embedding thành công' })
  @HttpCode(HttpStatus.OK)
  async getEmbedding(@Body() dto: EmbeddingDto) {
    return this.aiService.createEmbedding(dto.text);
  }

  /**
   * Phân tích đánh giá sản phẩm
   * POST /ai/analyze-reviews
   */
  @Post('analyze-reviews')
  @ApiOperation({ summary: 'Phân tích đánh giá sản phẩm skincare' })
  @ApiResponse({ status: 200, description: 'Phân tích thành công' })
  @HttpCode(HttpStatus.OK)
  async analyzeReviews(@Body() dto: AnalyzeReviewsDto) {
    return this.aiService.analyzeSkincareReviews(dto.productId);
  }

  /**
   * Tìm sản phẩm tương tự theo thành phần
   * POST /ai/similar-products
   */
  @Post('similar-products')
  @ApiOperation({ summary: 'Tìm sản phẩm tương tự theo thành phần' })
  @ApiResponse({ status: 200, description: 'Tìm thành công' })
  @HttpCode(HttpStatus.OK)
  async getSimilarProducts(@Body() dto: SimilarProductsDto) {
    return this.aiService.findSimilarByIngredients(
      dto.productId,
      dto.limit || 5,
    );
  }

  /**
   * Gợi ý quy trình skincare
   * POST /ai/suggest-routine
   */
  @Post('suggest-routine')
  @ApiOperation({ summary: 'Gợi ý quy trình chăm sóc da' })
  @ApiResponse({ status: 200, description: 'Gợi ý thành công' })
  @HttpCode(HttpStatus.OK)
  async suggestRoutine(@Body() dto: SuggestRoutineDto) {
    return this.aiService.suggestSkincareRoutine(
      dto.skinType,
      dto.concerns || [],
      dto.budget || 'medium',
    );
  }

  /**
   * Kiểm tra trạng thái AI
   * POST /ai/status
   */
  @Post('status')
  @ApiOperation({ summary: 'Kiểm tra trạng thái kết nối AI' })
  @ApiResponse({ status: 200, description: 'Trạng thái AI' })
  @HttpCode(HttpStatus.OK)
  async getStatus() {
    return this.aiService.getState();
  }

  /**
   * Xóa lịch sử chat
   * POST /ai/clear-history
   */
  @Post('clear-history')
  @ApiOperation({ summary: 'Xóa lịch sử chat của người dùng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @HttpCode(HttpStatus.OK)
  async clearHistory(@Body('userId') userId: string) {
    if (!userId) {
      return { message: 'Vui lòng cung cấp userId' };
    }
    await this.aiService.clearChatHistory(userId);
    return { message: 'Đã xóa lịch sử chat thành công' };
  }
}