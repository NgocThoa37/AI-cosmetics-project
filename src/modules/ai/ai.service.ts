// ai.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductDetail } from '../../modules/products/entities/product-detail.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Brand } from '../../modules/brands/entities/brand.entity';
import { SkinType } from '../../modules/products/enums/skin-type.enum';

// ============================================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU
// ============================================================

type GeminiPart = {
  text?: string;
  inlineData?: { mimeType: string; data: string };
};
type GeminiContent = { role?: 'user' | 'model'; parts: GeminiPart[] };
type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

// Response cho chatbot
export type ChatbotResponse = {
  message: string;
  suggestedProducts: ProductSuggestion[];
  categorySuggestions?: string[];
  skinTypeAdvice?: string;
};

// Sản phẩm gợi ý (trả về client)
export type ProductSuggestion = {
  id: string;
  name: string;
  slug: string;
  price: number;
  brand: string;
  image?: string;
  link: string;
  matchReason: string;
  skinType?: SkinType;
  rating?: number;
};

// Kết quả phân tích nhu cầu
export type SkincareIntent = {
  keywords: string[];
  skinType?: SkinType;
  concerns?: string[];
  ingredients?: string[];
  priceRange?: { min?: number; max?: number };
  categories?: string[];
  isSkincareRelated: boolean;
};

// Lịch sử chat
export type ChatHistory = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
};

// ============================================================
// AI SERVICE
// ============================================================

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: string;
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly retryCount: number;
  private chatModelName: string;
  private embeddingModelName: string;
  private readonly MAX_HISTORY = 10;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductDetail)
    private readonly productDetailRepo: Repository<ProductDetail>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    this.provider = this.configService.get<string>('AI_PROVIDER') || 'gemini';
    this.apiKey =
      this.configService.get<string>('AI_GEMINI_API_KEY') ||
      this.configService.get<string>('ai.geminiApiKey') ||
      undefined;
    this.baseUrl =
      this.configService.get<string>('AI_BASE_URL') ||
      'https://generativelanguage.googleapis.com/v1beta';
    this.timeoutMs = this.configService.get<number>('AI_TIMEOUT_MS') || 15000;
    this.retryCount = this.configService.get<number>('AI_RETRY_COUNT') || 3;
    this.chatModelName =
      this.configService.get<string>('AI_CHAT_MODEL') || 'gemini-3.6-flash';
    this.embeddingModelName =
      this.configService.get<string>('AI_EMBEDDING_MODEL') ||
      'gemini-embedding-2';

    this.logger.log(
      `AiService initialized provider=${this.provider} chat=${this.chatModelName} embed=${this.embeddingModelName}`,
    );
  }

  // ============================================================
  // QUẢN LÝ LỊCH SỬ CHAT - REDIS
  // ============================================================

  private getChatKey(userId: string): string {
    return `chat:${userId}`;
  }

  private async saveChatHistory(userId: string, message: string, response: string): Promise<void> {
    if (!userId || userId === 'anonymous') return;
    
    const key = this.getChatKey(userId);
    const entry = JSON.stringify({ user: message, assistant: response, timestamp: Date.now() });
    
    await this.redis.lpush(key, entry);
    await this.redis.ltrim(key, 0, this.MAX_HISTORY - 1);
    await this.redis.expire(key, 86400);
  }

  private async getChatHistory(userId: string): Promise<ChatHistory[]> {
    if (!userId || userId === 'anonymous') return [];
    
    const key = this.getChatKey(userId);
    const items = await this.redis.lrange(key, 0, this.MAX_HISTORY - 1);
    
    return items
      .map((item) => {
        try {
          const parsed = JSON.parse(item);
          return [
            { role: 'user' as const, content: parsed.user },
            { role: 'assistant' as const, content: parsed.assistant },
          ];
        } catch {
          return [];
        }
      })
      .flat()
      .slice(0, this.MAX_HISTORY);
  }

  async clearChatHistory(userId: string): Promise<void> {
    if (!userId || userId === 'anonymous') return;
    await this.redis.del(this.getChatKey(userId));
  }

  // ============================================================
  // CHATBOT TƯ VẤN CHÍNH
  // ============================================================

  async handleSkincareQuery(
    message: string,
    userId?: string,
    history: Array<{ role: string; content: string }> = [],
  ): Promise<ChatbotResponse> {
    if (!message || message.trim() === '') {
      return {
        message: 'Vui lòng nhập câu hỏi để tôi tư vấn cho bạn nhé! 😊',
        suggestedProducts: [],
      };
    }

    if (!this.apiKey || this.provider !== 'gemini') {
      return this.getFallbackResponse();
    }

    try {
      const chatHistory = userId ? await this.getChatHistory(userId) : [];
      const allHistory = [...history, ...chatHistory.map(h => ({ role: h.role, content: h.content }))];
      const limitedHistory = allHistory.slice(-this.MAX_HISTORY);

      const intent = await this.analyzeSkincareIntent(message, limitedHistory);

      if (!intent || !intent.isSkincareRelated) {
        const politeReply = await this.generatePoliteRefusal(message);
        return {
          message: politeReply,
          suggestedProducts: [],
        };
      }

      const products = await this.findSkincareProducts(intent);
      this.logger.log(`Found ${products.length} products for intent`);

      let rankedProducts = products;
      if (products.length > 10) {
        rankedProducts = await this.rankSkincareProducts(products, intent, message);
      }

      const suggestions = rankedProducts.slice(0, 5).map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        brand: product.brand?.name || 'Unknown',
        image: product.details?.[0]?.images?.[0]?.imageUrl || undefined,
        link: `/products/${product.slug}`,
        matchReason: this.generateMatchReason(product, intent),
        skinType: intent.skinType,
        rating: product.averageRating,
      }));

      const reply = await this.generateSkincareReply(
        message,
        suggestions,
        intent,
        limitedHistory,
      );

      const skinTypeAdvice = intent.skinType
        ? this.getSkinTypeAdvice(intent.skinType)
        : undefined;

      if (userId && userId !== 'anonymous') {
        await this.saveChatHistory(userId, message, reply);
      }

      return {
        message: reply,
        suggestedProducts: suggestions,
        categorySuggestions: intent.categories,
        skinTypeAdvice,
      };
    } catch (error) {
      this.logger.error(`Skincare chatbot error: ${error}`);
      return this.getFallbackResponse();
    }
  }

  // ============================================================
  // AI TỪ CHỐI LỊCH SỰ
  // ============================================================

  private async generatePoliteRefusal(message: string): Promise<string> {
    const prompt = `
Bạn là trợ lý tư vấn skincare chuyên nghiệp.

KHÁCH HÀNG HỎI: "${message}"

Đây là câu hỏi KHÔNG liên quan đến skincare hoặc mỹ phẩm.

Hãy viết câu trả lời:
- TỪ CHỐI LỊCH SỰ, nhẹ nhàng
- GIẢI THÍCH rằng bạn chỉ tư vấn về skincare
- HƯỚNG DẪN khách hàng hỏi về các vấn đề skincare
- Giọng văn THÂN THIỆN, CHUYÊN NGHIỆP
- Tối đa 40-50 chữ
- KHÔNG sử dụng markdown
- Trả lời bằng TIẾNG VIỆT
`;

    const text = await this.generateText(
      [{ role: 'user', parts: [{ text: prompt }] }],
      undefined,
      undefined,
      this.timeoutMs * 1.5,
    );

    return text || 'Xin lỗi bạn, tôi chỉ là trợ lý tư vấn skincare. Tôi chỉ có thể giúp bạn về các vấn đề chăm sóc da, sản phẩm dưỡng da, serum, kem chống nắng... Bạn có câu hỏi gì về skincare không ạ? 😊';
  }

  // ============================================================
  // PHÂN TÍCH NHU CẦU SKINCARE
  // ============================================================

  private async analyzeSkincareIntent(
    userMessage: string,
    history: Array<{ role: string; content: string }> = [],
  ): Promise<SkincareIntent | null> {
    if (!userMessage || userMessage.trim() === '') {
      return null;
    }

    const historyContext = history.length > 0
      ? `\nLỊCH SỬ CHAT:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\n`
      : '';

    const prompt = `
Bạn là chuyên viên tư vấn skincare (chăm sóc da) chuyên nghiệp.
${historyContext}
KHÁCH HÀNG HỎI HIỆN TẠI: "${userMessage}"

Hãy phân tích và trả về JSON với các trường sau:

1. keywords: Mảng từ khóa chính (tối đa 5, ví dụ: ["mụn", "thâm", "dưỡng ẩm"])
2. skinType: Loại da nếu khách đề cập. Chọn 1 trong: "OILY", "DRY", "COMBINATION", "SENSITIVE", "NORMAL", "ALL"
3. concerns: Mảng các vấn đề về da (VD: ["mụn viêm", "thâm sau mụn", "lão hóa", "khô da"])
4. ingredients: Mảng các thành phần khách muốn tìm (VD: ["retinol", "vitamin C", "hyaluronic acid"])
5. priceRange: { min: số hoặc null, max: số hoặc null }
6. categories: Mảng danh mục sản phẩm (VD: ["sữa rửa mặt", "toner", "serum", "kem dưỡng"])
7. isSkincareRelated: true nếu câu hỏi liên quan đến skincare, false nếu KHÔNG liên quan

⚠️ QUAN TRỌNG: 
- Dựa vào LỊCH SỬ CHAT để hiểu ngữ cảnh câu hỏi hiện tại
- Nếu câu hỏi thiếu thông tin, tham khảo lịch sử để suy luận
- Chỉ trả về isSkincareRelated: true khi câu hỏi LIÊN QUAN ĐẾN SKINCARE
- Trả về DUY NHẤT JSON, KHÔNG thêm text khác, KHÔNG markdown.
`;

    const schema = {
      type: 'OBJECT',
      properties: {
        keywords: { type: 'ARRAY', items: { type: 'STRING' } },
        skinType: { type: 'STRING' },
        concerns: { type: 'ARRAY', items: { type: 'STRING' } },
        ingredients: { type: 'ARRAY', items: { type: 'STRING' } },
        priceRange: {
          type: 'OBJECT',
          properties: {
            min: { type: 'NUMBER' },
            max: { type: 'NUMBER' },
          },
        },
        categories: { type: 'ARRAY', items: { type: 'STRING' } },
        isSkincareRelated: { type: 'BOOLEAN' },
      },
      required: ['keywords', 'isSkincareRelated'],
    };

    try {
      const result = await this.generateJson<any>(
        prompt,
        this.timeoutMs * 2,
        schema,
      );

      if (!result) return null;

      return {
        keywords: result.keywords || [],
        skinType: this.parseSkinType(result.skinType),
        concerns: result.concerns || [],
        ingredients: result.ingredients || [],
        priceRange: result.priceRange,
        categories: result.categories || [],
        isSkincareRelated: result.isSkincareRelated === true,
      };
    } catch (error) {
      this.logger.error(`Failed to analyze skincare intent: ${error}`);
      return null;
    }
  }

  private parseSkinType(skinType?: string): SkinType | undefined {
    const mapping: Record<string, SkinType> = {
      OILY: SkinType.OILY,
      DRY: SkinType.DRY,
      COMBINATION: SkinType.COMBINATION,
      SENSITIVE: SkinType.SENSITIVE,
      NORMAL: SkinType.NORMAL,
      ALL: SkinType.ALL,
    };
    if (!skinType) return undefined;
    const upper = skinType.toUpperCase();
    return mapping[upper] || undefined;
  }

  // ============================================================
  // TÌM KIẾM SẢN PHẨM - ĐÃ FIX OR CHO CÁC ĐIỀU KIỆN
  // ============================================================

  private async findSkincareProducts(intent: SkincareIntent) {
    const query = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.details', 'details')
      .leftJoinAndSelect('details.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.status = :status', { status: 'active' });

    // ✅ CATEGORIES - Dùng OR
    if (intent.categories && intent.categories.length > 0) {
      const categoryConditions = intent.categories.map((cat, index) => {
        const paramName = `category_${index}`;
        return `LOWER(category.name) LIKE LOWER(:${paramName})`;
      });

      const categoryParams = intent.categories.reduce(
        (acc, cat, index) => ({
          ...acc,
          [`category_${index}`]: `%${cat}%`,
        }),
        {},
      );

      query.andWhere(`(${categoryConditions.join(' OR ')})`, categoryParams);
    }

    // ✅ SKIN TYPE - Khớp chính xác hoặc ALL
    if (intent.skinType && intent.skinType !== SkinType.ALL) {
      query.andWhere(
        `(LOWER(details.skinType) = LOWER(:skinType) OR LOWER(details.skinType) = LOWER(:allSkinType))`,
        {
          skinType: intent.skinType,
          allSkinType: SkinType.ALL,
        },
      );
    }

    // ✅ INGREDIENTS - Dùng OR
    if (intent.ingredients && intent.ingredients.length > 0) {
      const ingredientConditions = intent.ingredients.map((ing, index) => {
        const paramName = `ingredient_${index}`;
        return `LOWER(details.ingredients) LIKE LOWER(:${paramName})`;
      });

      const ingredientParams = intent.ingredients.reduce(
        (acc, ing, index) => ({
          ...acc,
          [`ingredient_${index}`]: `%${ing}%`,
        }),
        {},
      );

      query.andWhere(`(${ingredientConditions.join(' OR ')})`, ingredientParams);
    }

    // ✅ KEYWORDS - Dùng OR (nới lỏng)
    if (intent.keywords && intent.keywords.length > 0) {
      const keywordConditions = intent.keywords.map((kw, index) => {
        const paramName = `keyword_${index}`;
        return `(LOWER(product.name) LIKE LOWER(:${paramName}) OR LOWER(details.description) LIKE LOWER(:${paramName}) OR LOWER(details.benefits) LIKE LOWER(:${paramName}))`;
      });

      const keywordParams = intent.keywords.reduce(
        (acc, kw, index) => ({
          ...acc,
          [`keyword_${index}`]: `%${kw}%`,
        }),
        {},
      );

      query.andWhere(`(${keywordConditions.join(' OR ')})`, keywordParams);
    }

    // ✅ PRICE RANGE - Chỉ áp dụng khi > 0
    if (intent.priceRange?.min && intent.priceRange.min > 0) {
      query.andWhere('product.price >= :minPrice', {
        minPrice: intent.priceRange.min,
      });
    }
    if (intent.priceRange?.max && intent.priceRange.max > 0) {
      query.andWhere('product.price <= :maxPrice', {
        maxPrice: intent.priceRange.max,
      });
    }

    query
      .orderBy('product.averageRating', 'DESC')
      .addOrderBy('product.totalSold', 'DESC')
      .take(20);

    return query.getMany();
  }

  // ============================================================
  // XẾP HẠNG SẢN PHẨM BẰNG AI
  // ============================================================

  private async rankSkincareProducts(
    products: Product[],
    intent: SkincareIntent,
    userQuery: string,
  ): Promise<Product[]> {
    if (products.length <= 10) return products;

    const topProducts = products.slice(0, 15);

    const productList = topProducts
      .map((p) => {
        const detail = p.details?.[0];
        return `- ${p.name} | ${p.brand?.name || 'Unknown'} | ${p.price.toLocaleString()}đ | ⭐ ${p.averageRating}/5 | ${detail?.ingredients || 'N/A'}`;
      })
      .join('\n');

    const prompt = `
KHÁCH HÀNG: "${userQuery}"

LOẠI DA: ${intent.skinType || 'Không xác định'}
MỐI QUAN TÂM: ${intent.concerns?.join(', ') || 'Không có'}
THÀNH PHẦN MONG MUỐN: ${intent.ingredients?.join(', ') || 'Không có'}

DANH SÁCH SẢN PHẨM:
${productList}

Hãy xếp hạng các sản phẩm này theo mức độ PHÙ HỢP NHẤT với khách hàng.
Trả về JSON là một mảng các ID sản phẩm (string) theo thứ tự ưu tiên từ cao xuống thấp.

Lưu ý: Ưu tiên sản phẩm:
1. Phù hợp với loại da
2. Chứa thành phần mong muốn
3. Giải quyết các mối quan tâm
4. Đánh giá cao và bán chạy

⚠️ QUAN TRỌNG: Trả về DUY NHẤT JSON, KHÔNG thêm text khác.
`;

    const schema = {
      type: 'ARRAY',
      items: { type: 'STRING' },
    };

    try {
      const rankedIds = await this.generateJson<string[]>(
        prompt,
        this.timeoutMs * 2,
        schema,
      );

      if (!rankedIds || rankedIds.length === 0) return products;

      const productMap = new Map(products.map((p) => [p.id, p]));
      const ranked = rankedIds
        .map((id) => productMap.get(id))
        .filter((p) => p !== undefined) as Product[];

      const remaining = products.filter((p) => !rankedIds.includes(p.id));
      return [...ranked, ...remaining];
    } catch (error) {
      this.logger.error(`Rank products error: ${error}`);
      return products;
    }
  }

  // ============================================================
  // TẠO LÝ DO PHÙ HỢP
  // ============================================================

  private generateMatchReason(product: Product, intent: SkincareIntent): string {
    const reasons: string[] = [];
    const detail = product.details?.[0];

    if (intent?.skinType && detail?.skinType) {
      try {
        if (detail.skinType === intent.skinType) {
          reasons.push(`Phù hợp với da ${this.getSkinTypeLabel(intent.skinType)}`);
        } else if (detail.skinType === SkinType.ALL) {
          reasons.push('Phù hợp với mọi loại da');
        }
      } catch (e) {}
    }

    if (intent?.ingredients && detail?.ingredients) {
      try {
        const ingredientsStr = String(detail.ingredients || '').toLowerCase();
        const foundIngredients = intent.ingredients.filter((ing) =>
          ingredientsStr.includes(String(ing || '').toLowerCase())
        );
        if (foundIngredients.length > 0) {
          reasons.push(`Chứa ${foundIngredients.join(', ')}`);
        }
      } catch (e) {}
    }

    if (intent?.concerns && detail?.benefits) {
      try {
        const benefitsStr = String(JSON.stringify(detail.benefits || '')).toLowerCase();
        const foundConcerns = intent.concerns.filter((c) =>
          benefitsStr.includes(String(c || '').toLowerCase())
        );
        if (foundConcerns.length > 0) {
          reasons.push(`Giải quyết vấn đề ${foundConcerns.join(', ')}`);
        }
      } catch (e) {}
    }

    if (product?.averageRating && product.averageRating >= 4.5) {
      reasons.push(`Được đánh giá ${product.averageRating}/5 ⭐`);
    }

    if (reasons.length === 0) {
      return 'Sản phẩm được nhiều người mua với cùng nhu cầu';
    }

    return reasons.join(' • ');
  }

  private getSkinTypeLabel(skinType?: SkinType): string {
    if (!skinType) return 'không xác định';

    const labels: Record<SkinType, string> = {
      [SkinType.OILY]: 'dầu',
      [SkinType.DRY]: 'khô',
      [SkinType.COMBINATION]: 'hỗn hợp',
      [SkinType.SENSITIVE]: 'nhạy cảm',
      [SkinType.NORMAL]: 'thường',
      [SkinType.ALL]: 'mọi loại',
    };
    return labels[skinType] || 'không xác định';
  }

  // ============================================================
  // SINH CÂU TRẢ LỜI
  // ============================================================

  private async generateSkincareReply(
    userMessage: string,
    suggestions: ProductSuggestion[],
    intent: SkincareIntent,
    history: Array<{ role: string; content: string }> = [],
  ): Promise<string> {
    const historyContext = history.length > 0
      ? `\nLỊCH SỬ CHAT:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\n`
      : '';

    if (suggestions.length === 0) {
      const prompt = `
Bạn là chuyên viên tư vấn skincare của shop mỹ phẩm.
${historyContext}
KHÁCH HÀNG HỎI: "${userMessage}"

Tình huống: Hiện tại shop CHƯA CÓ sản phẩm phù hợp với nhu cầu của khách.

Hãy viết câu trả lời:
- MỞ ĐẦU bằng lời chào và cảm ơn khách hàng
- GIẢI THÍCH shop chưa có sản phẩm phù hợp
- GỢI Ý khách hàng thử từ khóa khác hoặc xem danh mục
- Nếu có skinType, đưa ra LỜI KHUYÊN ngắn gọn về cách chăm sóc da đó
- THÂN THIỆN, CHUYÊN NGHIỆP
- Tối đa 60-80 chữ
- KHÔNG sử dụng markdown
- Trả lời bằng TIẾNG VIỆT
`;

      const text = await this.generateText(
        [{ role: 'user', parts: [{ text: prompt }] }],
        undefined,
        undefined,
        this.timeoutMs * 2,
      );

      if (text) return text;
      
      return `😊 Cảm ơn bạn đã quan tâm! Hiện tại shop chưa có sản phẩm phù hợp với "${userMessage}". Bạn có thể thử tìm kiếm với từ khóa khác hoặc xem danh mục sản phẩm nhé! 🛍️`;
    }

    const productList = suggestions
      .map(
        (p) =>
          `- ${p.name} (${p.brand}) - ${p.price.toLocaleString()}đ - ${p.matchReason}`,
      )
      .join('\n');

    const skinTypeInfo = intent.skinType
      ? `Loại da: ${this.getSkinTypeLabel(intent.skinType)}`
      : 'Không xác định';

    const prompt = `
Bạn là chuyên viên tư vấn skincare của shop mỹ phẩm.
${historyContext}
KHÁCH HÀNG: "${userMessage}"
${skinTypeInfo}

DANH SÁCH SẢN PHẨM PHÙ HỢP:
${productList}

Hãy viết câu trả lời:
- MỞ ĐẦU bằng lời chào thân thiện
- GIỚI THIỆU 1-2 sản phẩm NỔI BẬT nhất kèm lý do ngắn gọn
- KHUYẾN KHÍCH khách hàng click vào tên sản phẩm để xem chi tiết
- THÂN THIỆN, CHUYÊN NGHIỆP
- Tối đa 50-60 chữ
- KHÔNG sử dụng markdown
- Trả lời bằng TIẾNG VIỆT
`;

    const text = await this.generateText(
      [{ role: 'user', parts: [{ text: prompt }] }],
      undefined,
      undefined,
      this.timeoutMs * 2,
    );

    if (text) return text;

    return `Chào bạn! Dưới đây là các sản phẩm phù hợp với nhu cầu của bạn. Click vào tên sản phẩm để xem chi tiết và đặt mua nhé! 🛍️`;
  }

  // ============================================================
  // LỜI KHUYÊN VỀ LOẠI DA
  // ============================================================

  private getSkinTypeAdvice(skinType: SkinType): string {
    const advice: Record<SkinType, string> = {
      [SkinType.OILY]:
        '💡 Da dầu cần làm sạch kỹ, sử dụng sản phẩm không chứa dầu (oil-free), chứa Salicylic Acid, Niacinamide để kiểm soát dầu và ngăn ngừa mụn.',
      [SkinType.DRY]:
        '💡 Da khô cần dưỡng ẩm sâu, ưu tiên sản phẩm chứa Hyaluronic Acid, Ceramide, Glycerin. Tránh sửa rửa mặt tạo bọt nhiều.',
      [SkinType.COMBINATION]:
        '💡 Da hỗn hợp cần chăm sóc vùng chữ T và vùng má khác nhau. Sử dụng sản phẩm dịu nhẹ, cân bằng ẩm, ưu tiên gel-cream.',
      [SkinType.SENSITIVE]:
        '💡 Da nhạy cảm cần sản phẩm dịu nhẹ, không hương liệu, không cồn, chứa thành phần làm dịu như Centella Asiatica, Aloe Vera.',
      [SkinType.NORMAL]:
        '💡 Da thường khá dễ chăm sóc, ưu tiên duy trì độ ẩm và bảo vệ da khỏi ánh nắng với kem chống nắng hàng ngày.',
      [SkinType.ALL]:
        '💡 Sản phẩm phù hợp với mọi loại da, thường có thành phần lành tính, dịu nhẹ, an toàn cho đa số người dùng.',
    };
    return advice[skinType] || '';
  }

  // ============================================================
  // CHỨC NĂNG HỖ TRỢ KHÁC
  // ============================================================

  async findSimilarByIngredients(productId: string, limit: number = 5) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['details'],
    });

    if (!product || !product.details?.[0]?.ingredients) return [];

    const ingredients = product.details[0].ingredients;
    const keywords = ingredients.split(',').slice(0, 3);

    const query = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.details', 'details')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.id != :productId', { productId })
      .andWhere('product.status = :status', { status: 'active' });

    const conditions = keywords.map((kw, index) =>
      `LOWER(details.ingredients) LIKE LOWER(:ingredient_${index})`,
    );
    const params = keywords.reduce(
      (acc, kw, index) => ({
        ...acc,
        [`ingredient_${index}`]: `%${kw.trim()}%`,
      }),
      {},
    );
    query.andWhere(`(${conditions.join(' OR ')})`, params);

    return query
      .orderBy('product.averageRating', 'DESC')
      .take(limit)
      .getMany();
  }

  async analyzeSkincareReviews(productId: string) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['reviews'],
    });

    if (!product || product.reviews.length === 0) return null;

    const reviewTexts = product.reviews
      .slice(0, 30)
      .map((r) => `- ${r.comment || ''} (${r.rating}/5)`)
      .join('\n');

    const prompt = `
Phân tích các đánh giá sau cho sản phẩm skincare "${product.name}":

${reviewTexts}

Hãy trả về JSON:
- summary: Tóm tắt cảm nhận chung (1-2 câu, tiếng Việt)
- pros: Mảng ưu điểm được nhắc đến nhiều nhất (tối đa 4)
- cons: Mảng nhược điểm được nhắc đến (tối đa 3)
- effectiveness: Đánh giá hiệu quả (1-10)
- skinTypeSuitable: Loại da phù hợp nhất (OILY/DRY/COMBINATION/SENSITIVE/NORMAL/ALL)
- avgRating: Điểm trung bình

⚠️ QUAN TRỌNG: Trả về DUY NHẤT JSON, KHÔNG thêm text khác.
`;

    const schema = {
      type: 'OBJECT',
      properties: {
        summary: { type: 'STRING' },
        pros: { type: 'ARRAY', items: { type: 'STRING' } },
        cons: { type: 'ARRAY', items: { type: 'STRING' } },
        effectiveness: { type: 'NUMBER' },
        skinTypeSuitable: { type: 'STRING' },
        avgRating: { type: 'NUMBER' },
      },
      required: ['summary', 'pros', 'cons', 'effectiveness', 'avgRating'],
    };

    return this.generateJson<any>(prompt, this.timeoutMs * 3, schema);
  }

  async suggestSkincareRoutine(
    skinType: SkinType,
    concerns: string[] = [],
    budget: 'low' | 'medium' | 'high' = 'medium',
  ): Promise<string | null> {
    if (!this.apiKey || this.provider !== 'gemini') return null;

    const prompt = `
Hãy gợi ý một quy trình skincare cơ bản cho người dùng:
- Loại da: ${this.getSkinTypeLabel(skinType)}
- Mối quan tâm: ${concerns.join(', ') || 'Không có'}
- Ngân sách: ${budget}

Quy trình gồm các bước:
1. Sữa rửa mặt
2. Toner
3. Serum
4. Kem dưỡng ẩm
5. Kem chống nắng (ban ngày)

Mỗi bước gợi ý LOẠI sản phẩm và THÀNH PHẦN nên tìm.
Trả lời bằng TIẾNG VIỆT, ngắn gọn, dễ hiểu, khoảng 100-150 chữ.
`;

    return this.generateText(
      [{ role: 'user', parts: [{ text: prompt }] }],
      undefined,
      undefined,
      this.timeoutMs * 2,
    );
  }

  async createEmbedding(text: string): Promise<number[] | null> {
    if (!this.apiKey || this.provider !== 'gemini') return null;

    const data = await this.postJson<{ embedding?: { values?: number[] } }>(
      this.geminiUrl(this.embeddingModelName, 'embedContent'),
      { content: { parts: [{ text }] } },
      this.timeoutMs,
    );

    const values = data?.embedding?.values;
    if (!values) return null;

    if (values.length !== 768) {
      this.logger.warn(
        `Embedding dimension mismatch: expected 768, got ${values.length}`,
      );
    }

    return values.slice(0, 768);
  }

  // ============================================================
  // FALLBACK
  // ============================================================

  private getFallbackResponse(): ChatbotResponse {
    return {
      message: 'Xin lỗi, hệ thống tư vấn đang tạm thời gián đoạn. Vui lòng thử lại sau hoặc liên hệ hotline 1900xxxx để được hỗ trợ trực tiếp nhé! 💕',
      suggestedProducts: [],
    };
  }

  // ============================================================
  // HÀM CỐT LÕI
  // ============================================================

  private async getJson<T>(
    url: string,
    timeoutMs: number,
    retryCount = this.retryCount,
  ): Promise<T | null> {
    return this.requestJson<T>('GET', url, undefined, timeoutMs, retryCount);
  }

  private async postJson<T>(
    url: string,
    body: unknown,
    timeoutMs: number,
    retryCount = this.retryCount,
  ): Promise<T | null> {
    return this.requestJson<T>('POST', url, body, timeoutMs, retryCount);
  }

  private async requestJson<T>(
    method: 'GET' | 'POST',
    url: string,
    body: unknown,
    timeoutMs: number,
    retryCount: number,
  ): Promise<T | null> {
    for (let attempt = 0; attempt <= retryCount; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const startedAt = Date.now();

      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        const data = (await response.json()) as T & {
          error?: { message?: string };
        };

        if (!response.ok) {
          throw new Error(
            data.error?.message || `AI request failed ${response.status}`,
          );
        }

        this.logger.debug?.(
          `AI ${method} latency=${Date.now() - startedAt}ms attempt=${attempt + 1}`,
        );
        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (attempt >= retryCount) {
          this.logger.warn(
            `AI request failed after ${attempt + 1} attempt(s): ${message}`,
          );
          return null;
        }

        const backoffMs = Math.min(
          1000 * Math.pow(2, attempt) + Math.random() * 500,
          8000,
        );
        this.logger.warn(
          `AI request failed (attempt ${attempt + 1}/${retryCount + 1}), retrying in ${Math.round(backoffMs)}ms. Error: ${message}`,
        );
        await this.sleep(backoffMs);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    return null;
  }

  private async generateJson<T>(
    prompt: string,
    timeoutMs: number,
    schema?: Record<string, unknown>,
  ): Promise<T | null> {
    const generationConfig: Record<string, unknown> = {
      responseMimeType: 'application/json',
    };
    if (schema) {
      generationConfig.responseSchema = schema;
    }

    const text = await this.generateText(
      [{ role: 'user', parts: [{ text: prompt }] }],
      undefined,
      generationConfig,
      timeoutMs,
    );
    return text ? this.safeJsonParse<T>(text) : null;
  }

  private async generateText(
    contents: GeminiContent[],
    systemInstruction?: { parts: Array<{ text: string }> },
    generationConfig?: Record<string, unknown>,
    timeoutMs = 15000,
  ): Promise<string | null> {
    const startedAt = Date.now();
    const data = await this.postJson<GeminiResponse>(
      this.geminiUrl(this.chatModelName, 'generateContent'),
      {
        contents,
        ...(systemInstruction ? { systemInstruction } : {}),
        ...(generationConfig ? { generationConfig } : {}),
      },
      timeoutMs,
    );

    const text = this.extractText(data);
    this.logger.log(
      `AI generateContent model=${this.chatModelName} latency=${Date.now() - startedAt}ms ok=${Boolean(text)}`,
    );
    return text;
  }

  private geminiUrl(model: string, method: string) {
    return `${this.baseUrl}/models/${model}:${method}?key=${this.apiKey}`;
  }

  private extractText(data: GeminiResponse | null): string | null {
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  }

  private safeJsonParse<T>(text: string): T | null {
    try {
      const cleaned = text
        .trim()
        .replace(/^```(json)?/im, '')
        .replace(/```$/im, '')
        .trim();

      try {
        return JSON.parse(cleaned) as T;
      } catch {
        const objectStart = cleaned.indexOf('{');
        const arrayStart = cleaned.indexOf('[');
        const start =
          objectStart === -1
            ? arrayStart
            : arrayStart === -1
              ? objectStart
              : Math.min(objectStart, arrayStart);
        const end = Math.max(
          cleaned.lastIndexOf('}'),
          cleaned.lastIndexOf(']'),
        );

        if (start >= 0 && end >= start) {
          const json = cleaned.slice(start, end + 1);
          return JSON.parse(json) as T;
        }
        throw new Error('No JSON found');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `AI JSON parse failed: ${message}. Raw text: ${text.slice(0, 100)}...`,
      );
      return null;
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================================
  // TRẠNG THÁI AI
  // ============================================================
  getState() {
    return {
      provider: this.provider,
      chatModel: this.chatModelName,
      embedModel: this.embeddingModelName,
      hasApiKey: !!this.apiKey,
      apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 5) : null,
    };
  }
}