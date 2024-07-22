import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log(body)
  const prompts = Array.isArray(body.prompts) ? body.prompts : [body.prompts];
  const seed = body.seed || null;
  const is_customization = body.is_customization || false;

  if (prompts.length === 0) {
    return NextResponse.json({ error: 'No prompts provided' }, { status: 400 });
  }

  try {
    const response = await fetch('https://classic-midge-healthy.ngrok-free.app/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompts, seed, is_customization }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return NextResponse.json({ error: 'Failed to generate images' }, { status: response.status });
    }

    const zipBuffer = await response.arrayBuffer();
    
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="generated_kurtas.zip"',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate images' }, { status: 500 });
  }
}