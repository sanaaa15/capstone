import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { attributes } = await request.json();

  if (!attributes || attributes.trim() === '') {
    return NextResponse.json({ error: 'No attributes provided' }, { status: 400 });
  }

  try {
    const formData = new FormData();
    formData.append('attributes', attributes);

    const response = await fetch('https://257e-34-168-56-216.ngrok-free.app/generate', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return NextResponse.json({ error: `Failed to generate image: ${errorText}` }, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}