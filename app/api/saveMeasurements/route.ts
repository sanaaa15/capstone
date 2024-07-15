import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConfig from '../dbconfig';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { height, measurements } = await request.json();

    // Get the token from the HTTP-only cookie
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode the token to get the user ID
    let userId: number;
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as { userId: string, email: string };
      userId = parseInt(decoded.userId, 10);
      if (isNaN(userId)) {
        throw new Error('Invalid user ID');
      }
    } catch (error) {
      console.error('Invalid token or user ID:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      const [existingMeasurements] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT * FROM measurements WHERE user_id = ?',
        [userId]
      );

      const query = existingMeasurements.length > 0
        ? `UPDATE measurements SET 
           height = ?, shoulder_width = ?, arm_length = ?, neck = ?, wrist = ?,
           chest = ?, waist = ?, hip = ?, thigh = ?, ankle = ?, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`
        : `INSERT INTO measurements 
           (user_id, height, shoulder_width, arm_length, neck, wrist, chest, waist, hip, thigh, ankle)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        parseFloat(height) || null,
        parseFloat(measurements['Shoulder Width']) || null,
        parseFloat(measurements['Arm Length']) || null,
        parseFloat(measurements['Neck']) || null,
        parseFloat(measurements['Wrist']) || null,
        parseFloat(measurements['Chest (around)']) || null,
        parseFloat(measurements['Waist (around)']) || null,
        parseFloat(measurements['Hip (around)']) || null,
        parseFloat(measurements['Thigh']) || null,
        parseFloat(measurements['Ankle']) || null
      ];

      if (existingMeasurements.length > 0) {
        values.push(userId); // For UPDATE query
      } else {
        values.unshift(userId); // For INSERT query
      }

      await connection.execute(query, values);

      await connection.end();
      return NextResponse.json({ message: 'Measurements saved successfully' });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to save measurements' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving measurements:', error);
    return NextResponse.json({ error: 'Failed to save measurements' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the token from the HTTP-only cookie
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode the token to get the user ID
    let userId: number;
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as { userId: string, email: string };
      userId = parseInt(decoded.userId, 10);
      if (isNaN(userId)) {
        throw new Error('Invalid user ID');
      }
    } catch (error) {
      console.error('Invalid token or user ID:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      const [measurements] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT * FROM measurements WHERE user_id = ?',
        [userId]
      );

      await connection.end();

      if (measurements.length > 0) {
        return NextResponse.json(measurements[0]);
      } else {
        return NextResponse.json({});
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch measurements' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching measurements:', error);
    return NextResponse.json({ error: 'Failed to fetch measurements' }, { status: 500 });
  }
}