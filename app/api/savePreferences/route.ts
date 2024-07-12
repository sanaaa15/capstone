import { NextResponse } from 'next/server';
import driver from '../neo4j';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your-secret-key'; // Replace with your actual secret key 


export async function POST(request: Request) {
  const session = driver.session();
  
  try {
    const { preferences } = await request.json();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode the token to get the user ID
    let userId;
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      userId = decoded.userId; // Ensure your token contains userId
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
