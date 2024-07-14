import { NextRequest, NextResponse } from 'next/server';
import mysql, { RowDataPacket, OkPacket } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConfig from '../dbconfig';

const SECRET_KEY = 'your_jwt_secret'; // Use the same secret key as in register/route.ts

export async function POST(request: NextRequest) {
  try {
    const { height, ...measurements } = await request.json();

    // Get the token from the HTTP-only cookie
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode the token to get the user ID
    let userId: string;
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as { userId: string, email: string };
      userId = decoded.userId;
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Convert empty strings to null and parse valid numbers
    const parsedHeight = height === '' ? null : parseFloat(height) || null;
    const parsedMeasurements = Object.fromEntries(
      Object.entries(measurements).map(([key, value]) => [
        key,
        value === '' ? null : parseFloat(value as string) || null
      ])
    );

    const [existingMeasurements] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM measurements WHERE user_id = ?',
      [userId]
    );

    if (existingMeasurements.length > 0) {
      // Update existing measurements
      await connection.execute(
        `UPDATE measurements SET 
        height = ?, shoulder_width = ?, arm_length = ?, neck = ?, wrist = ?,
        chest = ?, waist = ?, hip = ?, thigh = ?, ankle = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [
          parsedHeight, parsedMeasurements['Shoulder Width'], parsedMeasurements['Arm Length'],
          parsedMeasurements['Neck'], parsedMeasurements['Wrist'], parsedMeasurements['Chest (around)'],
          parsedMeasurements['Waist (around)'], parsedMeasurements['Hip (around)'],
          parsedMeasurements['Thigh'], parsedMeasurements['Ankle'], userId
        ]
      );
    } else {
      // Insert new measurements
      await connection.execute(
        `INSERT INTO measurements 
        (user_id, height, shoulder_width, arm_length, neck, wrist, chest, waist, hip, thigh, ankle)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, parsedHeight, parsedMeasurements['Shoulder Width'], parsedMeasurements['Arm Length'],
          parsedMeasurements['Neck'], parsedMeasurements['Wrist'], parsedMeasurements['Chest (around)'],
          parsedMeasurements['Waist (around)'], parsedMeasurements['Hip (around)'],
          parsedMeasurements['Thigh'], parsedMeasurements['Ankle']
        ]
      );
    }

    await connection.end();
    return NextResponse.json({ message: 'Measurements saved successfully' });
  } catch (error) {
    console.error('Error saving measurements:', error);
    return NextResponse.json({ error: 'Failed to save measurements' }, { status: 500 });
  }
}