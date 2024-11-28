import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { imageData, prompt } = await req.json();

    // Remove the data URL prefix to get just the base64 data
    const base64Image = imageData.split(',')[1];

    // Convert base64 to Uint8Array
    const imageBytes = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare the prompt for analysis
    const analysisPrompt = `Analyze the kurta image and prompt ${prompt} then map the attributes from the prompt and image:
    - Sleeve Length (e.g., full, three-quarter, short, sleeveless)
    - Color (pink, green, yellow, red, blue, black, white, purple, orange, brown, grey, etc.)
    - Hemline (e.g., straight, asymmetrical, curved,flared)
    - Neckline (e.g., round, V-neck, mandarin)
    - Print/Pattern (e.g., embellished,solid, floral, geometric)
    - Sleeve Style (e.g., regular, bell, fitted, ruffles)
    - Price (Any number between 1000 - 3000) 
    
    Format the response as key-value pairs, one per line.`;

    // Create the vision request
    const result = await model.generateContent([
      analysisPrompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse the response into structured attributes
    const attributes = parseAttributesFromResponse(text);

    return NextResponse.json({
      attributes,
      success: true
    });

  } catch (error) {
    console.error('Error analyzing kurta:', error);
    return NextResponse.json({
      error: 'Failed to analyze kurta image',
      success: false
    }, { status: 500 });
  }
}

function parseAttributesFromResponse(response: string): {
  sleeveLength: string;
  color: string;
  hemline: string;
  neckline: string;
  print: string;
  sleeveStyle: string;
  price: string;
} {
  // Initialize default values
  const attributes = {
    sleeveLength: '',
    color: '',
    hemline: '',
    neckline: '',
    print: '',
    sleeveStyle: '',
    price: ''
  };

  // Split response into lines and extract attributes
  const lines = response.split('\n');
  for (const line of lines) {
    const [key, value] = line.split(':').map(str => str.trim());
    if (!key || !value) continue;

    if (key.toLowerCase().includes('sleeve length')) {
      attributes.sleeveLength = value;
    } else if (key.toLowerCase().includes('color')) {
      attributes.color = value;
    } else if (key.toLowerCase().includes('hemline')) {
      attributes.hemline = value;
    } else if (key.toLowerCase().includes('neckline')) {
      attributes.neckline = value;
    } else if (key.toLowerCase().includes('print') || key.toLowerCase().includes('pattern')) {
      attributes.print = value;
    } else if (key.toLowerCase().includes('sleeve style')) {
      attributes.sleeveStyle = value;
    } else if (key.toLowerCase().includes('price')) {
      attributes.price = value; 
    }
  }

  return attributes;
}