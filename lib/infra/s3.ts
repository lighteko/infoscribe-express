import { Express } from "express";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  GetBucketLocationCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import * as path from "path";
import { createReadStream } from "fs";
import { Readable } from "stream";

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

  public async getObject(s3Path: string, bucket: string = this.bucket): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Path,
    });

    try {
      const response = await this.client.send(command);
      
      // Handle empty response
      if (!response.Body) {
        console.warn(`Empty response body for S3 path: ${s3Path}`);
        return "";
      }
      
      // Get response body as string using SDK methods
      let bodyString = "";
      const stream = response.Body as any;
      
      try {
        // Try SDK v3 transformToString method first (preferred)
        if (typeof stream.transformToString === 'function') {
          bodyString = await stream.transformToString();
        }
        // Try SDK v3 transformToByteArray next
        else if (typeof stream.transformToByteArray === 'function') {
          const byteArray = await stream.transformToByteArray();
          bodyString = new TextDecoder().decode(byteArray);
        }
        // Fallback to manual stream reading
        else {
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          bodyString = Buffer.concat(chunks).toString('utf-8');
        }
      } catch (streamError) {
        console.error(`Error reading S3 stream: ${streamError}`);
        // Last resort fallback
        bodyString = stream.toString() || "";
      }
      
      console.log(`Raw content from S3 (first 100 chars): ${bodyString.substring(0, 100)}...`);
      
      // If the content is JSON, try to extract html property or return stringified version
      if (bodyString.trim().startsWith('{') && bodyString.trim().endsWith('}')) {
        try {
          const jsonObj = JSON.parse(bodyString);
          
          // Check if it's an object with html property
          if (jsonObj && typeof jsonObj === 'object' && jsonObj.html) {
            console.log(`Found HTML property in JSON object`);
            // Ensure the html property is a string
            if (typeof jsonObj.html === 'string') {
              return jsonObj.html;
            } else {
              console.log(`HTML property is not a string, stringifying it`);
              return JSON.stringify(jsonObj.html);
            }
          } 
          
          // Otherwise, stringify the entire object
          console.log(`No HTML property found in JSON object, stringifying the entire object`);
          return JSON.stringify(jsonObj);
        } catch (jsonError) {
          console.error(`Failed to parse JSON: ${jsonError}`);
          // If JSON parsing fails, return the original string
        }
      }
      
      return bodyString;
    } catch (error) {
      console.error(`Error getting object from S3: ${error}`);
      throw error;
    }
  }
}

export default S3;
