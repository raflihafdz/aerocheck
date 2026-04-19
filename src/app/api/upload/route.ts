import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary environment variables');
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'aerocheck/fod',
      resource_type: 'image',
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Gagal mengupload gambar';
    
    // Check if it's a Cloudinary configuration error
    if (errorMessage.includes('Invalid cloud_name')) {
      return NextResponse.json({ 
        error: 'Konfigurasi Cloudinary tidak valid. Silakan periksa NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME di file .env.local' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
