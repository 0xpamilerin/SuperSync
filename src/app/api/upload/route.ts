import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  }
});

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename to avoid overwrites
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const originalName = file.name;
    const extension = path.extname(originalName);
    const basename = path.basename(originalName, extension);
    const fileName = `${basename}-${uniqueSuffix}${extension}`;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!bucketName) {
      // Local storage fallback for development
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const fs = await import("fs/promises");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        fileUrl: `/api/download?file=${fileName}`,
        fileName: fileName,
        originalName: originalName,
        size: file.size,
      });
    }

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: `uploads/${fileName}`,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(putCommand);

    return NextResponse.json({
      success: true,
      fileUrl: `/api/download?file=${fileName}`,
      fileName: fileName,
      originalName: originalName,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "File upload failed" },
      { status: 500 }
    );
  }
}
