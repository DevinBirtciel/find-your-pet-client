import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const photo = formData.get('photo') as File;
  const type = formData.get('type');

  if (!photo || !(photo instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  await fetch('https://find-your-pets/upload', {
    method: 'POST',
    body: formData,
  });

  return NextResponse.json({
    message: 'File received successfully',
    filename: photo.name,
    size: photo.size,
    type,
  });
}
