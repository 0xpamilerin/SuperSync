import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  }
});

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("file");

  if (!fileName) {
    return NextResponse.json({ error: "No file specified" }, { status: 400 });
  }

  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    try {
      const path = await import("path");
      const fs = await import("fs/promises");
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      const fileBuffer = await fs.readFile(filePath);

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Type": "application/octet-stream",
        },
      });
    } catch (e) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: `uploads/${fileName}`,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Error generating download link" },
      { status: 500 }
    );
  }
}
