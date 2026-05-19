import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKETS.originals,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentLength: file.size,
        }),
      );
    } catch (err: any) {
      const code: string = err?.name ?? err?.Code ?? '';
      if (code === 'NoSuchBucket') {
        throw new BadRequestException(`S3 bucket "${BUCKETS.originals}" does not exist`);
      }
      if (code === 'AccessDenied') {
        throw new InternalServerErrorException('S3 access denied — check IAM permissions');
      }
      throw new InternalServerErrorException(`S3 upload failed: ${err.message}`);
    }

    const url = await this.getPresignedUrl(key);
    return { key, url };
  }

  async getPresignedUrl(key: string, bucket = BUCKETS.originals, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  }

  async remove(key: string): Promise<void> {
    try {
      await s3Client.send(
        new DeleteObjectCommand({ Bucket: BUCKETS.originals, Key: key }),
      );
    } catch (err: any) {
      const code: string = err?.name ?? err?.Code ?? '';
      if (code === 'NoSuchKey') throw new NotFoundException(`File "${key}" not found`);
      if (code === 'AccessDenied') {
        throw new InternalServerErrorException('S3 access denied — check IAM permissions');
      }
      throw new InternalServerErrorException(`S3 delete failed: ${err.message}`);
    }
  }
}
