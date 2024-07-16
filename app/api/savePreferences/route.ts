import { NextResponse } from 'next/server';
import driver from '../neo4j'; // Adjust the path as necessary
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const SECRET_KEY = process.env.JWT_SECRET; // Use the same secret key as in login/route.ts

// Function to get random purchase attributes from FINAL.csv
function getRandomPurchaseAttributes() {
  const possibleAttributes = [
    { colour: 'red', design: 'sequins', neck: 'v-neck', hemline: 'flared' },
    { colour: 'plain blue', hemline: 'asymmetric', sleeve: 'sleeveless' },
    { colour: 'plain green', neck: 'round neck', sleeve: 'short sleeves', length: 'short' },
    { colour: 'blue', design: 'golden embroidery' },
    { colour: 'pink', sleeve: 'three-quarter sleeves', design: 'white floral print' },
    { colour: 'peach', design: 'white floral design', hemline: 'flared', neck: 'round neck', sleeve: 'three-fourth sleeves' },
    { colour: 'red and yellow', design: 'traditional', fabric: 'cotton', neck: 'v neck' },
    { colour: 'black', neck: 'square neck', hemline: 'straight', design: 'edgy', sleeve: 'sleeveless' },
    { colour: 'lavender', design: 'small daisy flower', neck: 'square neckline', sleeve: 'half puffy sleeves', hemline: 'flared' },
    { colour: 'plain white', design: 'low-key simple', sleeve: 'full sleeves', fabric: 'silk', neck: 'boat neck' },
    { colour: 'black', neck: 'mandarin collar', sleeve: 'three-quarter sleeve' },
    { colour: 'white embroidered', neck: 'tie up neck', style: 'anarkali', sleeve: 'long sleeve', hemline: 'high low' },
    { colour: 'teal', neck: 'boat neck', slit: 'front slit', design: 'floral' },
    { neck: 'keyhole neck', hemline: 'flared', colour: 'white with red design' },
    { colour: 'blue', design: 'ethnic motifs', length: 'calf length', sleeve: 'sleeveless' },
    { colour: 'yellow', design: 'green leaves pattern', neck: 'v neck', sleeve: 'full sleeves' },
    { colour: 'blue', design: 'golden peacock', sleeve: 'sleeveless' },
    { colour: 'orange', design: 'chikankari work', neck: 'round neck', sleeve: 'short sleeves', hemline: 'straight' },
    { colour: 'charcoal grey', design: 'block print', neck: 'mandarin collar', sleeve: 'sleeveless', hemline: 'asymmetric' },
    { colour: 'deep red', design: 'mirror work', neck: 'sweetheart neckline', sleeve: 'sleeveless', style: 'anarkali' }
  ];

  const randomAttributes = possibleAttributes[Math.floor(Math.random() * possibleAttributes.length)];

  // Shuffle the attributes within the selected set
  const shuffledAttributes = Object.keys(randomAttributes)
    .map(key => ({ key, value: randomAttributes[key] }))
    .sort(() => Math.random() - 0.5)
    .reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

  return {
    price: Math.floor(Math.random() * 1000) + 500, // Random price between 500 and 1500
    colour: shuffledAttributes.colour || '',
    fabric: shuffledAttributes.fabric || '',
    fabric_purity: shuffledAttributes.fabric_purity || '',
    sleeve_styling: shuffledAttributes.sleeve || '',
    images: shuffledAttributes.images || '',
    Sleeve_Length: shuffledAttributes.sleeve_length || '',
    Shape: shuffledAttributes.shape || '',
    Neck: shuffledAttributes.neck || '',  
    Print_or_Pattern_Type: shuffledAttributes.design || '',
    Design_Styling: shuffledAttributes.design_styling || '',
    Slit_Detail: shuffledAttributes.slit || '',
    Length: shuffledAttributes.length || '',
    Hemline: shuffledAttributes.hemline || ''
  };
}
export async function POST(request: Request) {
  const session = driver.session();

  try {
    const { preferences } = await request.json();

    // Get the token from the HTTP-only cookie
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      userId = decoded.userId;
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create or update the user node and link preferences
    await session.run(
      'MERGE (u:User {id: $userId}) ' +
      'SET u.preferences = $preferences ' +
      'WITH u ' +
      'MERGE (p:Preference {id: $userId}) ' +
      'SET p.preferences = $preferences ' +
      'MERGE (u)-[:LIKES]->(p) ' +
      'RETURN u, p',
      { userId, preferences: JSON.stringify(preferences) }
    );

    // Create three purchase nodes with random attributes and link to the user
    for (let i = 0; i < 3; i++) {
      const purchaseAttributes = getRandomPurchaseAttributes();
      await session.run(
        'CREATE (pu:Purchase { ' +
        'price: $price, colour: $colour, fabric: $fabric, fabric_purity: $fabric_purity, ' +
        'sleeve_styling: $sleeve_styling, images: $images, ' +
        'Sleeve_Length: $Sleeve_Length, Shape: $Shape, Neck: $Neck, ' +
        'Print_or_Pattern_Type: $Print_or_Pattern_Type, Design_Styling: $Design_Styling, ' +
        'Slit_Detail: $Slit_Detail, Length: $Length, Hemline: $Hemline }) ' +
        'MERGE (u:User {id: $userId}) ' +
        'MERGE (u)-[:PURCHASED]->(pu)',
        { userId, ...purchaseAttributes }
      );
    }

    return NextResponse.json({ message: 'Preferences and purchases saved successfully' });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ error: 'Error saving preferences' }, { status: 500 });
  } finally {
    await session.close();
  }
}