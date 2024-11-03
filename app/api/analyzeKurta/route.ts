import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { prompt, imageUrl } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const analysisPrompt = `
    Analyze this kurta description and identify the following attributes:
    1. Sleeve Length (e.g., full, three-quarter, short)
    2. Color
    3. Hemline Style (e.g., straight, curved, asymmetric)
    4. Neckline Style (e.g., round, V-neck, mandarin)
    5. Print/Pattern (e.g., floral, geometric, solid)
    6. Sleeve Style (e.g., regular, bell, puff)

    Kurta Description: "${prompt}"
    
    Please provide the analysis in a structured format.`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response into structured data
    const attributes = {
      sleeveLength: extractAttribute(text, "Sleeve Length"),
      color: extractAttribute(text, "Color"),
      hemline: extractAttribute(text, "Hemline"),
      neckline: extractAttribute(text, "Neckline"),
      print: extractAttribute(text, "Print/Pattern"),
      sleeveStyle: extractAttribute(text, "Sleeve Style")
    };

    return NextResponse.json({ attributes });
  } catch (error) {
    console.error('Error analyzing kurta:', error);
    return NextResponse.json({ error: 'Failed to analyze kurta' }, { status: 500 });
  }
}

function extractAttribute(text: string, attribute: string): string {
  const regex = new RegExp(`${attribute}:?\\s*([^\\n]+)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}