import { S3Event } from 'aws-lambda';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKETS } from '../config/aws.config';
import { Readable } from 'stream';
import Jimp = require('jimp');

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const sourceBucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    try {
      const getResult = await s3Client.send(
        new GetObjectCommand({ Bucket: sourceBucket, Key: key }),
      );

      const imageBuffer = await streamToBuffer(getResult.Body as Readable);

      const image = await Jimp.read(imageBuffer);
      // Create a thumbnail (preserve aspect ratio)
      image.resize(320, Jimp.AUTO).quality(80);
      const resized = await image.getBufferAsync(Jimp.MIME_JPEG);

      const destKey = `thumbnails/${key}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKETS.resized,
          Key: destKey,
          Body: resized,
          ContentType: 'image/jpeg',
        }),
      );

      console.log(`Resized ${key} -> ${destKey}`);
    } catch (err) {
      console.error(`Failed to process ${key}:`, err);
      throw err;
    }
  }
};
