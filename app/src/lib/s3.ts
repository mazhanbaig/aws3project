import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET = process.env.S3_BUCKET_NAME || '';

function ensureBucketConfigured(): void {
  if (!BUCKET) {
    throw new Error('S3_BUCKET_NAME environment variable is required');
  }
}

export async function uploadSnapshot(
  trackedPageId: number,
  timestamp: string,
  content: string | Buffer,
  isScreenshot = false
): Promise<string> {
  ensureBucketConfigured();

  const ext = isScreenshot ? 'png' : 'html';
  const prefix = isScreenshot ? 'screenshots' : 'snapshots';
  const key = `${prefix}/${trackedPageId}/${timestamp}.${ext}`;

  const contentType = isScreenshot ? 'image/png' : 'text/html';

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: content,
      ContentType: contentType,
    })
  );

  return key;
}

export async function downloadSnapshot(key: string): Promise<string> {
  ensureBucketConfigured();

  const res = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
  return await res.Body!.transformToString();
}

export async function downloadScreenshotBuffer(key: string): Promise<Buffer> {
  ensureBucketConfigured();

  const res = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
  const bytes = await res.Body!.transformToByteArray();
  return Buffer.from(bytes);
}
