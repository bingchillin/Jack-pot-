import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async uploadFile(file: any): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const filename = `${timestamp}-${Math.random().toString(36).substring(2)}${extension}`;
    
    const filePath = path.join(uploadDir, filename);
    
    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);
    
    // Return the URL that can be used to access the file
    const baseUrl = this.configService.get('NEXT_PUBLIC_API_URL') || 'http://localhost:3000';
    return `${baseUrl}/uploads/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const filename = path.basename(fileUrl);
      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
} 