import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const prompts = Array.isArray(body.prompts) ? body.prompts : [body.attributes];
  let seed = body.seed;

  if (seed === undefined) {
    // Generate a random seed if one isn't provided
    seed = Math.floor(Math.random() * 2**32);
  }

  if (prompts.length === 0) {
    return NextResponse.json({ error: 'No prompts provided' }, { status: 400 });
  }

  try {
    const response = await fetch('https://classic-midge-healthy.ngrok-free.app/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompts, seed }),
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