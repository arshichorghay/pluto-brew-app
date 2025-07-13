
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Define the directory path
  const dir = join(process.cwd(), 'public/products');
  
  try {
    // Create the directory if it doesn't exist
    await mkdir(dir, { recursive: true });

    // Use a timestamp and the original filename to create a unique name
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const path = join(dir, filename);
    
    await writeFile(path, buffer);
    console.log(`File uploaded to ${path}`);
    const publicUrl = `/products/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Error writing file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file.' }, { status: 500 });
  }
}
