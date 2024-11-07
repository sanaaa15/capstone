import { NextResponse } from 'next/server';
import driver from '../neo4j';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET;

export async function POST(request: Request) {
  const session = driver.session();

  try {
    const { kurtaId } = await request.json();

    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { userId: number };
      if (!decoded.userId) {
        throw new Error('Invalid token payload');
      }
      userId = decoded.userId;
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the Kurta node from the user's cart
    await session.run(
      `
      MATCH (u:User {userId: $userId})-[r:CART]->(k:Kurta {kurtaId: $kurtaId})
      DELETE r, k
      `,
      { userId, kurtaId }
    );

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item from cart:', error);
    return NextResponse.json({ error: 'Error deleting item from cart' }, { status: 500 });
  } finally {
    await session.close();
  }
}