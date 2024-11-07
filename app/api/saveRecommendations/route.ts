// /api/saveRecommendations/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function POST(request: Request) {
  let connection;

  try {
    // Get user token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { recommendations } = body;

    if (!Array.isArray(recommendations)) {
      return NextResponse.json({ error: 'Invalid recommendations format' }, { status: 400 });
    }

    // Connect to MySQL
    connection = await mysql.createConnection(dbConfig);

    // Delete existing recommendations older than 7 days
    await connection.execute(
      `DELETE FROM user_recommendations 
       WHERE user_id = ? 
       AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );

    // Insert new recommendations
    for (const rec of recommendations) {
      await connection.execute(
        `INSERT INTO user_recommendations 
         (user_id, prompt, image_url, seed) 
         VALUES (?, ?, ?, ?)`,
        [userId, rec.prompt, rec.imageUrl, rec.seed]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to save recommendations' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}