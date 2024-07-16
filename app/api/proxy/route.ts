import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  
  const response = await fetch('https://eca4-34-68-61-126.ngrok-free.app/measure', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return NextResponse.json(data);
}