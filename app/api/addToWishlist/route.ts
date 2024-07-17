import { NextResponse } from 'next/server';
import driver from '../neo4j'; // Adjust the path as necessary
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET; // Use the same secret key as in login/route.ts

export async function POST(request: Request) {
  const session = driver.session();

  try {
    const { prompt } = await request.json();

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

    // Create or update the user node and link the prompt to the wishlist
    await session.run(
      'MERGE (u:User {id: $userId}) ' +
      'MERGE (w:Wishlist {id: $userId}) ' +
      'CREATE (p:Prompt { ' +
      'color: $color, fabric: $fabric, designStyle: $designStyle, sleeveStyle: $sleeveStyle, ' +
      'hemlineStyle: $hemlineStyle, necklineStyle: $necklineStyle, shape: $shape, price: $price }) ' +
      'MERGE (u)-[:HAS_WISHLIST]->(w) ' +
      'MERGE (w)-[:CONTAINS]->(p)',
      { userId, ...prompt }
    );

    return NextResponse.json({ message: 'Added to wishlist successfully' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Error adding to wishlist' }, { status: 500 });
  } finally {
    await session.close();
  }
}