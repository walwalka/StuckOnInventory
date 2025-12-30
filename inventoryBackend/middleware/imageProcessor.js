import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, readFileSync, statSync } from 'fs';
import heicConvert from 'heic-convert';

/**
 * Image processing middleware for optimizing uploaded images
 * Features:
 * - HEIC/HEIF to JPEG conversion
 * - Automatic resizing to max dimensions (1920x1080)
 * - JPEG compression with 85% quality
 * - Thumbnail generation (300x300)
 * - EXIF metadata stripping
 * - WebP conversion with fallback
 */

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const THUMBNAIL_SIZE = 300;
const JPEG_QUALITY = 85;
const WEBP_QUALITY = 80;

/**
 * Process a single uploaded image
 * @param {Object} file - Multer file object
 * @param {string} uploadDir - Directory to save processed images
 * @returns {Promise<Object>} - Processed file info with paths
 */
async function processSingleImage(file, uploadDir) {
  try {
    const originalPath = file.path;
    const ext = path.extname(file.filename).toLowerCase();
    const baseName = path.basename(file.filename, ext);

    // Read the original file
    let imageBuffer = await fs.readFile(originalPath);

    // Convert HEIC/HEIF to JPEG first
    if (ext === '.heic' || ext === '.heif') {
      console.log(`Converting HEIC/HEIF file: ${file.originalname}`);
      imageBuffer = await heicConvert({
        buffer: imageBuffer,
        format: 'JPEG',
        quality: 1 // Use max quality for conversion, Sharp will compress later
      });
    }

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();

    // Determine if resizing is needed
    const needsResize = metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT;

    // Process main image
    let mainImage = sharp(imageBuffer);

    if (needsResize) {
      mainImage = mainImage.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to JPEG with quality compression and strip metadata
    const processedPath = path.join(uploadDir, `${baseName}.jpg`);
    await mainImage
      .jpeg({ quality: JPEG_QUALITY, progressive: true })
      .withMetadata(false) // Strip EXIF data
      .toFile(processedPath);

    // Generate thumbnail
    const thumbnailPath = path.join(uploadDir, `${baseName}-thumb.jpg`);
    await sharp(imageBuffer)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: JPEG_QUALITY })
      .withMetadata(false)
      .toFile(thumbnailPath);

    // Generate WebP version for modern browsers
    const webpPath = path.join(uploadDir, `${baseName}.webp`);
    await sharp(imageBuffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: WEBP_QUALITY })
      .withMetadata(false)
      .toFile(webpPath);

    // Delete original file if it's different from processed
    if (originalPath !== processedPath) {
      await fs.unlink(originalPath).catch(() => {});
    }

    // Get file sizes for comparison
    const processedStats = statSync(processedPath);

    return {
      originalName: file.originalname,
      filename: `${baseName}.jpg`,
      path: processedPath,
      thumbnailPath: thumbnailPath,
      webpPath: webpPath,
      size: processedStats.size,
      originalSize: file.size,
      compressionRatio: ((1 - processedStats.size / file.size) * 100).toFixed(2)
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Image processing failed: ${error.message}`);
  }
}

/**
 * Middleware to process uploaded images after multer
 * Usage: router.post('/upload', upload.array('images', 3), processImages, handler)
 */
async function processImages(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const uploadDir = path.dirname(req.files[0].path);

    // Process all uploaded files
    const processedFiles = await Promise.all(
      req.files.map(file => processSingleImage(file, uploadDir))
    );

    // Attach processed file info to request
    req.processedFiles = processedFiles;

    // Log compression results
    processedFiles.forEach(file => {
      console.log(`Processed ${file.originalName}: ${file.originalSize} -> ${file.size} bytes (${file.compressionRatio}% reduction)`);
    });

    next();
  } catch (error) {
    console.error('Image processing middleware error:', error);
    next(error);
  }
}

/**
 * Process a single file (for single uploads)
 */
async function processSingleFile(req, res, next) {
  try {
    if (!req.file) {
      return next();
    }

    const uploadDir = path.dirname(req.file.path);
    const processed = await processSingleImage(req.file, uploadDir);

    req.processedFile = processed;

    console.log(`Processed ${processed.originalName}: ${processed.originalSize} -> ${processed.size} bytes (${processed.compressionRatio}% reduction)`);

    next();
  } catch (error) {
    console.error('Image processing middleware error:', error);
    next(error);
  }
}

export {
  processImages,
  processSingleFile,
  processSingleImage
};
