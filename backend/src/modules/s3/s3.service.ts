import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKETS } from '../../config/aws.config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  async upload(file: Express.Multer.File): Promise<{ key: string; url: string }> {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `uploads/${uuidv4()}-${sanitizedName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKETS.originals,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      }),
    );

    const url = await this.getPresignedUrl(key);
    return { key, url };
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKETS.originals,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  }

  async remove(key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: BUCKETS.originals, Key: key }),
    );
  }
}
