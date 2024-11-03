import { NextResponse } from 'next/server';
import driver from '../neo4j';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET;

export async function GET() {
  const session = driver.session();

  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
      userId = decoded.userId;
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})-[:WISHLIST]->(k:Kurta)
      RETURN k
      ORDER BY k.createdAt DESC
      `,
      { userId }
    );

    const items = result.records.map(record => {
      const kurta = record.get('k').properties;
      return {
        kurtaId: kurta.kurtaId,
        description: kurta.description,
        imageUrl: kurta.imageUrl,
        createdAt: kurta.createdAt
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Error fetching wishlist' }, { status: 500 });
  } finally {
    await session.close();
  }
}