import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/** Allowlisted upload folder names to prevent path traversal */
const ALLOWED_FOLDERS = ['posts', 'avatars', 'stories', 'pets', 'receipts', 'general'] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * POST /upload?folder=posts|avatars|stories|pets|receipts|general
   * Accepts multipart/form-data with field name "file"
   * Returns { url, publicId }
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB max
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files are accepted.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder = 'general',
  ) {
    if (!file) throw new BadRequestException('No file provided.');
    // Validate folder against allowlist to prevent path traversal
    const safeFolder: AllowedFolder = ALLOWED_FOLDERS.includes(folder as AllowedFolder)
      ? (folder as AllowedFolder)
      : 'general';
    return this.uploadService.uploadBuffer(file.buffer, safeFolder);
  }
}
