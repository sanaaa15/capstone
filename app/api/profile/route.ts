import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mysql from 'mysql2/promise';

const SECRET_KEY = process.env.JWT_SECRET;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

interface JwtPayloadWithUserId extends jwt.JwtPayload {
  userId: number;
}

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token || !SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let userId: number;
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayloadWithUserId;
    userId = decoded.userId;
  } catch (error) {
    console.error('Invalid token:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [userProfile] = await pool.execute(
      'SELECT id, full_name, email FROM users WHERE id = ?',
      [userId]
    );

    if (Array.isArray(userProfile) && userProfile.length > 0) {
      const user = userProfile[0];
      return NextResponse.json({ success: true, username: user.full_name });
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Error fetching profile' }, { status: 500 });
  }
}
