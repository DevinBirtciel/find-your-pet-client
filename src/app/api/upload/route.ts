import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Request received:', request);
    if (request.method === 'OPTIONS') {
      const response = new NextResponse();
      response.headers.set('Access-Control-Allow-Origin', 'https://api.find-your-pets.com');
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      return response;
    }
    console.log('Processing form data');
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('Error parsing form data:', error);
      return NextResponse.json({ error: 'Error parsing form data' }, { status: 400 });
    }
    const photo = formData.get('photo') as File;
    const type = formData.get('type');
    console.log('Form data:', formData);
    if (!photo || !(photo instanceof File)) {
      return NextResponse.json({ error: 'Could not retrieve valid form data' }, { status: 400 });
    }
    console.log('set up buffer');
    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // get signed s3 url from lambda and then upload the file to s3
    console.log('Getting signed URL');
    const body = JSON.stringify({
      filename: photo.name,
      type: photo.type,
      size: photo.size,
      buffer: buffer.toString('base64'),
    });

    const response: Response = await fetch(
      `https://api.find-your-pets/get-signed-url?key=${photo.name}&contentType=${photo.type}`,
      {
        method: 'GET',
        body,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://api.find-your-pets.com',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 });
    }
    const { signedUrl } = await response.json();
    console.log('Signed URL:', signedUrl);
    // const uploadResponse = await fetch(signedUrl, {
    //   method: 'PUT',
    //   body: photo,
    //   headers: {
    //     'Content-Type': photo.type,
    //     'Access-Control-Allow-Origin': 'https://api.find-your-pets.com',
    //     'Access-Control-Allow-Methods': 'PUT, OPTIONS',
    //     'Access-Control-Allow-Headers': 'Content-Type',
    //   },
    // });
    // if (!uploadResponse.ok) {
    //   return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    // }

    return NextResponse.json({
      message: 'File received successfully',
      filename: photo.name,
      size: photo.size,
      type,
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
