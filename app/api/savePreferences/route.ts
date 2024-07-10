import { NextResponse } from 'next/server';
import driver from '../neo4j';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const session = driver.session();
  
  try {
    const { preferences } = await request.json();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify and decode the token
    let userId;
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Ensure you have JWT_SECRET in your environment variables
      userId = decodedToken.id; // Assuming the user ID is stored in the token's `id` field
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

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
