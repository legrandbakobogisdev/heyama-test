import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET as string;
    this.publicUrl = process.env.S3_PUBLIC_URL as string;

    this.client = new S3Client({
      // MinIO : "us-east-1" par convention. R2 : "auto" (S3_REGION=auto).
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      // requis par MinIO et R2 (style de requête path/bucket, pas bucket.domaine)
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY as string,
        secretAccessKey: process.env.S3_SECRET_KEY as string,
      },
    });
  }

  // Upload le fichier et renvoie l'URL publique + la clé (pour suppression future)
  async upload(
    file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    const extension = file.originalname.split('.').pop();
    const key = `${randomUUID()}.${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // S3_PUBLIC_URL est deja scope a la bucket (MinIO : http://host:9000/bucket,
    // R2 : le sous-domaine r2.dev de la bucket), donc pas de bucket dans le chemin.
    return { url: `${this.publicUrl}/${key}`, key };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  // Retrouve la clé à partir de l'URL publique stockée en base
  keyFromUrl(url: string): string {
    return url.replace(`${this.publicUrl}/`, '');
  }
}
