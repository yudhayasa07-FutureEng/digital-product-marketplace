import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string || 'thumbnail';

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    // Limit size check (e.g., 25MB for MVP)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file melebihi batas maksimum (25MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let url = '';

    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeName);
      fs.writeFileSync(filePath, buffer);
      url = `/uploads/${safeName}`;
    } catch {
      // Serverless (Vercel) read-only filesystem fallback: encode as Data URL
      const mimeType = file.type || 'application/octet-stream';
      url = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    return NextResponse.json({
      success: true,
      url,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengunggah file' }, { status: 500 });
  }
}
