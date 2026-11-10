import { NextRequest } from 'next/server';
import { requireAuth } from '@/server/utils/auth-check';
import { successResponse, unauthorizedResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import logger from '@/lib/logger';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) {
      return unauthorizedResponse('Authentication required to upload assets.');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file provided in form data.');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return errorResponse(`Unsupported file type: ${file.type}. Allowed: JPG, PNG, WebP, GIF, SVG.`);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds limit of 5MB.`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe filename
    const ext = path.extname(file.name) || (file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg');
    const safeBase = file.name.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);
    const hash = crypto.randomBytes(6).toString('hex');
    const filename = `${safeBase}-${Date.now()}-${hash}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    logger.info({ userId: session.user.id, filename, publicUrl }, 'Asset uploaded successfully');

    return successResponse({ url: publicUrl, filename, size: file.size, type: file.type }, 'File uploaded successfully.', undefined, 201);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to process file upload.');
  }
}

