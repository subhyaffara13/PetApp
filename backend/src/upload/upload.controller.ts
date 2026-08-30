import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * POST /upload?folder=posts|avatars|stories
   * Accepts multipart/form-data with field name "file"
   * Returns { url, publicId }
   */
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB max
    fileFilter: (_, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Only image files are accepted.'), false);
      }
      cb(null, true);
    },
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder = 'general',
  ) {
    if (!file) throw new BadRequestException('No file provided.');
    return this.uploadService.uploadBuffer(file.buffer, folder);
  }
}
