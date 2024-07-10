import { NextResponse } from 'next/server';
import driver from '../neo4j';

export async function POST(request: Request) {
  const session = driver.session();
  
  try {
    const { preferences } = await request.json();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Here you would typically decode the token to get the user ID
    // For this example, we'll use a placeholder
    const userId = 'user123'; // Replace with actual user ID from token

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