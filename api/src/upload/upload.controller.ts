import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './upload.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        console.log('Backend - File filter check:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          fieldname: file.fieldname,
        });
        
        // Allow only image files
        if (file.mimetype.startsWith('image/')) {
          console.log('Backend - File accepted as image');
          cb(null, true);
        } else {
          console.log('Backend - File rejected, not an image type');
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: any) {
    console.log('Backend - Upload endpoint called');
    console.log('Backend - File received:', file ? 'Yes' : 'No');
    
    if (file) {
      console.log('Backend - File details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
    }

    if (!file) {
      console.log('Backend - Error: No file uploaded');
      throw new BadRequestException('No file uploaded');
    }

    try {
      const fileUrl = await this.uploadService.uploadFile(file);
      console.log('Backend - Upload successful:', fileUrl);
      return {
        success: true,
        url: fileUrl,
        filename: file.originalname,
      };
    } catch (error) {
      console.log('Backend - Upload error:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }



  // Serve uploaded files
  @Get('serve/:filename')
  async serveFile(@Res() res: Response, filename: string) {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    return res.sendFile(filePath);
  }
} 