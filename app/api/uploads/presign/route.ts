import { NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { CORS_HEADERS, errorResponse, handleError, successResponse } from "@/lib/api/utils";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const PresignBodySchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
  size: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES),
});

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const r2AccountId = requireEnv("R2_ACCOUNT_ID");
    const r2AccessKeyId = requireEnv("R2_ACCESS_KEY_ID");
    const r2SecretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
    const r2Bucket = requireEnv("R2_BUCKET");
    const r2PublicBaseUrl = requireEnv("R2_PUBLIC_BASE_URL").replace(/\/$/, "");

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });

    const body = await request.json();
    const parsed = PresignBodySchema.parse(body);

    if (!allowedImageTypes.has(parsed.contentType)) {
      return errorResponse(
        "VALIDATION_ERROR",
        { message: "지원하지 않는 이미지 형식입니다" },
        400,
      );
    }

    const safeFilename = sanitizeFilename(parsed.filename);
    const key = `items/${Date.now()}-${crypto.randomUUID()}-${safeFilename}`;

    const command = new PutObjectCommand({
      Bucket: r2Bucket,
      Key: key,
      ContentType: parsed.contentType,
      ContentLength: parsed.size,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const publicUrl = `${r2PublicBaseUrl}/${key}`;

    return successResponse({
      key,
      uploadUrl,
      publicUrl,
      expiresIn: 60,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
