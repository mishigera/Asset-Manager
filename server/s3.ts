import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export type UploadKind = "image" | "cv";

const DEFAULT_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const DEFAULT_MAX_CV_BYTES = 20 * 1024 * 1024;

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

const s3Endpoint = requiredEnv("S3_ENDPOINT");
const s3Region = process.env.S3_REGION || "us-east-1";
const s3Bucket = requiredEnv("S3_BUCKET");
const s3AccessKey = requiredEnv("S3_ACCESS_KEY");
const s3SecretKey = requiredEnv("S3_SECRET_KEY");
const s3PublicBaseUrl = requiredEnv("S3_PUBLIC_BASE_URL").replace(/\/$/, "");

const maxImageBytes = envNumber("S3_MAX_IMAGE_BYTES", DEFAULT_MAX_IMAGE_BYTES);
const maxCvBytes = envNumber("S3_MAX_CV_BYTES", DEFAULT_MAX_CV_BYTES);

export const uploadLimits = {
  maxImageBytes,
  maxCvBytes,
  maxAnyBytes: Math.max(maxImageBytes, maxCvBytes),
};

const s3 = new S3Client({
  region: s3Region,
  endpoint: s3Endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: s3AccessKey,
    secretAccessKey: s3SecretKey,
  },
});

function sanitizeExt(ext: string): string {
  return ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function getImageExtension(fileName: string, mimeType: string): string {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  if (mimeType === "image/svg+xml") return "svg";
  const extFromName = fileName.includes(".") ? fileName.split(".").pop() ?? "" : "";
  const sanitized = sanitizeExt(extFromName);
  return sanitized || "bin";
}

export function resolveUploadKind(mimeType: string): UploadKind {
  if (mimeType === "application/pdf") return "cv";
  if (mimeType.startsWith("image/")) return "image";
  throw new Error("Tipo de archivo no permitido. Solo imágenes o PDF.");
}

export function validateUpload(mimeType: string, size: number): UploadKind {
  const kind = resolveUploadKind(mimeType);

  if (kind === "image" && size > maxImageBytes) {
    throw new Error("La imagen excede el límite de 10MB");
  }

  if (kind === "cv" && size > maxCvBytes) {
    throw new Error("El PDF excede el límite de 20MB");
  }

  return kind;
}

export function buildObjectKey(kind: UploadKind, originalName: string, mimeType: string): string {
  if (kind === "cv") {
    return `uploads/cv/${randomUUID()}.pdf`;
  }

  const ext = getImageExtension(originalName, mimeType);
  return `uploads/images/${randomUUID()}.${ext}`;
}

function getCacheControl(kind: UploadKind): string {
  if (kind === "cv") {
    return "public, max-age=3600";
  }
  return "public, max-age=31536000, immutable";
}

export async function uploadBufferToS3(params: {
  key: string;
  contentType: string;
  body: Buffer;
  kind: UploadKind;
}): Promise<{ key: string; url: string; kind: UploadKind }> {
  const { key, contentType, body, kind } = params;

  await s3.send(
    new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: getCacheControl(kind),
    }),
  );

  return {
    key,
    url: `${s3PublicBaseUrl}/${key}`,
    kind,
  };
}
