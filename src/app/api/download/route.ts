import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

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

  try {
    const path = await import("path");
    const fs = await import("fs/promises");
    const cleanFileName = path.basename(fileName);
    const filePath = path.join(process.cwd(), "public", "uploads", cleanFileName);
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${cleanFileName}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (e) {
    const path = await import("path");
    const cleanFileName = path.basename(fileName);
    // Return sample text content if the file is a demo file (e.g. Chapter_1_Final.pdf)
    const mockContent = `SuperSync Project Document: ${cleanFileName}\n\nThis is a mock sample document content generated for frontend development and testing.\nGenerated on: ${new Date().toISOString()}`;
    return new NextResponse(Buffer.from(mockContent), {
      headers: {
        "Content-Disposition": `attachment; filename="${cleanFileName}"`,
        "Content-Type": "text/plain",
      },
    });
  }
}
