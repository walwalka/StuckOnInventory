import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
const QR_DIR = path.join(UPLOAD_DIR, 'qr');

/**
 * Ensures the QR code directory exists
 */
async function ensureQRDirectory() {
  try {
    await fs.access(QR_DIR);
  } catch {
    await fs.mkdir(QR_DIR, { recursive: true });
  }
}

/**
 * Generates a QR code for an inventory item
 * @param {string} entity - The entity type (coins, relics, stamps, bunnykins, comics)
 * @param {number} id - The item ID
 * @returns {Promise<string>} The relative path to the QR code image
 */
export async function generateQRCode(entity, id) {
  await ensureQRDirectory();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  const itemUrl = `${frontendUrl}/${entity}/details/${id}`;
  const filename = `qr-${entity}-${id}.png`;
  const filePath = path.join(QR_DIR, filename);

  await QRCode.toFile(filePath, itemUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  return `/uploads/qr/${filename}`;
}

/**
 * Deletes a QR code file
 * @param {string} qrCodePath - The relative path to the QR code (e.g., /uploads/qr/qr-coins-123.png)
 */
export async function deleteQRCode(qrCodePath) {
  if (!qrCodePath) return;

  try {
    const filename = path.basename(qrCodePath);
    const filePath = path.join(QR_DIR, filename);
    await fs.unlink(filePath);
  } catch (error) {
    console.warn(`Failed to delete QR code at ${qrCodePath}:`, error.message);
  }
}

/**
 * Regenerates a QR code by deleting the old one and creating a new one
 * @param {string} entity - The entity type (coins, relics, stamps, bunnykins, comics)
 * @param {number} id - The item ID
 * @param {string} oldPath - The old QR code path to delete
 * @returns {Promise<string>} The new relative path to the QR code image
 */
export async function regenerateQRCode(entity, id, oldPath) {
  await deleteQRCode(oldPath);
  return await generateQRCode(entity, id);
}
