import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { s3Client } from '../config/s3.config';

export class ImageService {
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || '';
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'products'): Promise<string> {
    try {
      // Process image with sharp
      const processedImage = await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      const key = `${folder}/${uuidv4()}.jpg`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: processedImage,
        ContentType: 'image/jpeg'
      });

      await s3Client.send(command);
      return `https://${this.bucket}.s3.amazonaws.com/${key}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  async uploadMultipleImages(files: Express.Multer.File[], folder: string = 'products'): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, folder));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload images');
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const key = imageUrl.split('.com/')[1];
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }
}