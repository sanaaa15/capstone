import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mysql from 'mysql2/promise';

const SECRET_KEY = process.env.JWT_SECRET;

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost', // Your MySQL host
    user: process.env.MYSQL_USER, // Your MySQL username
    password: process.env.MYSQL_PASSWORD, // Your MySQL password
    database: process.env.MYSQL_DATABASE, // Your MySQL database name
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
        const [kurtaDetails] = await pool.execute(
            'SELECT * FROM kurta_details WHERE user_id = ?',
            [userId]
        );

        return NextResponse.json({ kurtaDetails });
    } catch (error) {
        console.error('Error fetching kurta details:', error);
        return NextResponse.json({ error: 'Error fetching kurta details' }, { status: 500 });
    }
}
