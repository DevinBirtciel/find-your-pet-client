import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse();
    response.headers.set('Access-Control-Allow-Origin', 'https://api.find-your-pets.com');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }
  const formData = await request.formData();
  const photo = formData.get('photo') as File;
  const type = formData.get('type');

  if (!photo || !(photo instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // get signed s3 url from lambda and then upload the file to s3
  const body = JSON.stringify({
    filename: photo.name,
    type: photo.type,
    size: photo.size,
  });

  // log the body
  console.log('Body:', body);

  const response: Response = await fetch('https://api.find-your-pets/get-signed-url', {
    method: 'GET',
    body,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://api.find-your-pets.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 });
  }
  const { signedUrl } = await response.json();
  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    body: photo,
    headers: {
      'Content-Type': photo.type,
    },
  });
  if (!uploadResponse.ok) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }

  return NextResponse.json({
    message: 'File received successfully',
    filename: photo.name,
    size: photo.size,
    type,
  });
}
