import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
      const formData = await request.formData();
      console.log('FormData received:', Object.fromEntries(formData));
  
      const ngrokUrl = 'https://9fd8-35-236-146-190.ngrok-free.app/measure';
      console.log('Sending request to:', ngrokUrl);
  
      const response = await fetch(ngrokUrl, {
        method: 'POST',
        body: formData,
      });
  
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        return NextResponse.json({ error: `Failed to process image: ${errorText}` }, { status: response.status });
      }
  
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        const textData = await response.text();
        return NextResponse.json({ result: textData });
      }
    } catch (error) {
      console.error('Proxy error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }