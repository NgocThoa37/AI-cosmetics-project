import { v2 as cloudinary } from 'cloudinary';
import * as mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load biến môi trường
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('=== CLOUDINARY CONFIG ===');
console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('=========================\n');

/**
 * Upload 1 file từ đĩa lên Cloudinary
 */
async function uploadFileToCloudinary(
  localPath: string,
  folder: string,
  prefix: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const publicId = `aicosmetics/${folder}/${prefix}-${uniqueSuffix}`;

    cloudinary.uploader.upload(
      localPath,
      {
        public_id: publicId,
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          console.error(`❌ Upload lỗi [${localPath}]:`, error.message);
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary không trả về kết quả'));
        }
        resolve(result.secure_url);
      },
    );
  });
}

/**
 * Migrate ảnh products
 */
async function migrateProductImages(conn: mysql.Connection) {
  console.log('\n=== MIGRATE PRODUCTS ===\n');

  const [rows] = await conn.query<mysql.RowDataPacket[]>(
    `SELECT id, image_url FROM products_image WHERE image_url LIKE '/uploads/%'`,
  );

  console.log(`Tìm thấy ${rows.length} ảnh products cần migrate\n`);

  let success = 0;
  let failed = 0;

  for (const row of rows) {
    const oldUrl: string = row.image_url;
    const imageId: number = row.id;

    // /uploads/products/xxx.png → uploads/products/xxx.png
    const relativePath = oldUrl.replace(/^\//, '');
    const localPath = path.join(__dirname, '..', relativePath);

    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️ [ID ${imageId}] File không tồn tại: ${localPath}`);
      failed++;
      continue;
    }

    try {
      // Upload lên Cloudinary
      const newUrl = await uploadFileToCloudinary(localPath, 'products', 'product');

      // Update DB
      await conn.query(`UPDATE products_image SET image_url = ? WHERE id = ?`, [
        newUrl,
        imageId,
      ]);

      console.log(`✅ [ID ${imageId}] ${oldUrl}`);
      console.log(`         → ${newUrl}`);
      success++;
    } catch (err: any) {
      console.error(`❌ [ID ${imageId}] Thất bại:`, err.message);
      failed++;
    }
  }

  console.log(`\n📊 Products: ${success} thành công, ${failed} thất bại\n`);
}

/**
 * Migrate ảnh reviews (JSON array)
 */
async function migrateReviewImages(conn: mysql.Connection) {
  console.log('\n=== MIGRATE REVIEWS ===\n');

  const [rows] = await conn.query<mysql.RowDataPacket[]>(
    `SELECT id, image_urls FROM reviews 
     WHERE image_urls IS NOT NULL 
     AND JSON_LENGTH(image_urls) > 0`,
  );

  console.log(`Tìm thấy ${rows.length} reviews có ảnh\n`);

  let success = 0;
  let failed = 0;

  for (const row of rows) {
    const reviewId: number = row.id;
    let imageUrls: string[] = row.image_urls;

    if (typeof imageUrls === 'string') {
      try {
        imageUrls = JSON.parse(imageUrls);
      } catch (e) {
        console.warn(`⚠️ [Review ${reviewId}] JSON không hợp lệ`);
        failed++;
        continue;
      }
    }

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) continue;

    const newUrls: string[] = [];
    let hasChange = false;

    for (const url of imageUrls) {
      // Nếu đã là Cloudinary URL → giữ nguyên
      if (url.startsWith('https://res.cloudinary.com/')) {
        newUrls.push(url);
        continue;
      }

      // Nếu là local URL → migrate
      if (url.startsWith('/uploads/')) {
        const relativePath = url.replace(/^\//, '');
        const localPath = path.join(__dirname, '..', relativePath);

        if (!fs.existsSync(localPath)) {
          console.warn(`⚠️ [Review ${reviewId}] File không tồn tại: ${localPath}`);
          newUrls.push(url); // giữ nguyên nếu không tìm thấy
          continue;
        }

        try {
          const newUrl = await uploadFileToCloudinary(localPath, 'reviews', 'review');
          newUrls.push(newUrl);
          hasChange = true;
          console.log(`✅ [Review ${reviewId}] ${url}`);
          console.log(`         → ${newUrl}`);
        } catch (err: any) {
          console.error(`❌ [Review ${reviewId}] Upload lỗi:`, err.message);
          newUrls.push(url);
          failed++;
        }
      } else {
        // URL khác (http, data URI...) → giữ nguyên
        newUrls.push(url);
      }
    }

    if (hasChange) {
      try {
        await conn.query(`UPDATE reviews SET image_urls = ? WHERE id = ?`, [
          JSON.stringify(newUrls),
          reviewId,
        ]);
        console.log(`💾 [Review ${reviewId}] Đã update DB\n`);
        success++;
      } catch (err: any) {
        console.error(`❌ [Review ${reviewId}] Update DB lỗi:`, err.message);
        failed++;
      }
    }
  }

  console.log(`\n📊 Reviews: ${success} thành công, ${failed} thất bại\n`);
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Bắt đầu migrate ảnh lên Cloudinary...\n');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  console.log('✅ Kết nối DB thành công\n');

  try {
    await migrateProductImages(conn);
    await migrateReviewImages(conn);

    console.log('\n🎉 HOÀN TẤT MIGRATE!\n');
  } catch (err) {
    console.error('❌ Lỗi migrate:', err);
  } finally {
    await conn.end();
    console.log('Đã đóng kết nối DB');
  }
}

main();