import { Express } from "express";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  GetBucketLocationCommand,
} from "@aws-sdk/client-s3";
import * as path from "path";
import { createReadStream } from "fs";

interface S3Config {
  AWS_REGION: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  AWS_BUCKET_NAME: string;
}

class S3 {
  private static instance: S3 | null = null;
  private static config: S3Config = {
    AWS_REGION: "",
    AWS_ACCESS_KEY: "",
    AWS_SECRET_KEY: "",
    AWS_BUCKET_NAME: "",
  };
  private static initialized = false;
  private _client: S3Client | null = null;

  bucket: string;

  public static initApp(app: Express): void {
    const { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_BUCKET_NAME } =
      app.get("config");

    S3.config.AWS_REGION = AWS_REGION;
    S3.config.AWS_ACCESS_KEY = AWS_ACCESS_KEY;
    S3.config.AWS_SECRET_KEY = AWS_SECRET_KEY;
    S3.config.AWS_BUCKET_NAME = AWS_BUCKET_NAME;

    S3.initialized = true;
  }

  public static getInstance(): S3 {
    if (!S3.initialized) {
      throw new Error("S3 not initialized. Call S3.initApp() first");
    }

    if (!S3.instance) {
      S3.instance = new S3();
    }

    return S3.instance;
  }

  private constructor() {
    this.bucket = S3.config.AWS_BUCKET_NAME;
  }

  private get client(): S3Client {
    if (!this._client) {
      this._client = new S3Client({
        region: S3.config.AWS_REGION,
        credentials: {
          accessKeyId: S3.config.AWS_ACCESS_KEY,
          secretAccessKey: S3.config.AWS_SECRET_KEY,
        },
      });
    }

    return this._client;
  }

  public async uploadFile(
    fileLocalPath: string,
    fileS3Path?: string,
    bucket: string = this.bucket
  ): Promise<string> {
    const key = fileS3Path || path.basename(fileLocalPath);
    const fileStream = createReadStream(fileLocalPath);

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileStream,
      })
    );

    const bucketLocation = await this.client.send(
      new GetBucketLocationCommand({ Bucket: bucket })
    );
    const region = bucketLocation.LocationConstraint || S3.config.AWS_REGION;
    return `https://${bucket}.s3-${region}.amazonaws.com/${key}`;
  }

  public async uploadFileObject(
    fileBuffer: Buffer,
    fileS3Path: string,
    bucket: string = this.bucket
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileS3Path,
        Body: fileBuffer,
      })
    );

    const bucketLocation = await this.client.send(
      new GetBucketLocationCommand({ Bucket: bucket })
    );
    const region = bucketLocation.LocationConstraint || S3.config.AWS_REGION;
    return `https://${bucket}.s3-${region}.amazonaws.com/${fileS3Path}`;
  }

  public async deleteFileObject(
    fileS3Path: string,
    bucket: string = this.bucket
  ): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: fileS3Path,
      })
    );
  }

  public async copyS3File(
    sourceBucket: string,
    sourceKey: string,
    destinationBucket: string,
    destinationKey: string
  ): Promise<string> {
    const copySource = `${sourceBucket}/${sourceKey}`;

    await this.client.send(
      new CopyObjectCommand({
        CopySource: copySource,
        Bucket: destinationBucket,
        Key: destinationKey,
      })
    );

    return `https://${destinationBucket}.s3.amazonaws.com/${destinationKey}`;
  }
}

export default S3;
