import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { description, quantity, attributes, fabric, price } = await req.json();
    
    // Convert price to number if it's a string
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

    // Validate price
    if (isNaN(numericPrice)) {
      return NextResponse.json({ error: 'Invalid price value' }, { status: 400 });
    }

    // Get user ID from session/token
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if JWT_SECRET exists
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify token with type assertion
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    const userId = decoded.userId;

    // Check if all database credentials exist
    const dbHost = process.env.MYSQL_HOST;
    const dbUser = process.env.MYSQL_USER;
    const dbPassword = process.env.MYSQL_PASSWORD;
    const dbName = process.env.MYSQL_DATABASE;

    if (!dbHost || !dbUser || !dbPassword || !dbName) {
      console.error('Database configuration is incomplete');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Create database connection with individual parameters
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    });

    try {
      const [result] = await connection.execute(
        'INSERT INTO kurta_details (user_id, description, quantity, sleeve_length, color, hemline, neckline, print, sleeve_style, fabric, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          description,
          quantity,
          attributes.sleeveLength,
          attributes.color,
          attributes.hemline,
          attributes.neckline,
          attributes.print,
          attributes.sleeveStyle,
          fabric,
          numericPrice
        ]
      );

      return NextResponse.json({ success: true, result });
    } finally {
      // Ensure connection is always closed
      await connection.end();
    }

  } catch (error) {
    console.error('Error in addKurtaDetails:', error);
    return NextResponse.json({ error: 'Failed to add kurta details' }, { status: 500 });
  }
}
