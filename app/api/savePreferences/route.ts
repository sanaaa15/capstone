import { NextResponse } from 'next/server';
import driver from '../neo4j'; // Adjust the path as necessary
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET_KEY = 'your_jwt_secret'; // Use the same secret key as in login/route.ts

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

    // Decode the token to get the user ID
    let userId;
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as { userId: string, email: string };
      userId = decoded.userId;
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Make sure to pass userId to the Neo4j query
    await session.run(
      'MERGE (u:User {id: $userId}) ' +
      'SET u.preferences = $preferences ' +
      'RETURN u',
      { userId, preferences: JSON.stringify(preferences) }
    );

    return NextResponse.json({ message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ error: 'Error saving preferences' }, { status: 500 });
  } finally {
    await session.close();
  }
}