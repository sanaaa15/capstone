import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Paneer@12345',
  database: 'capstone',
};

async function registerUser(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    await connection.end();
    console.log('User registered:', username);
  }

  export async function POST(request: Request) {
    // await registerUser('testuser', 'password123');  // Comment this out after first run
    const { username, password } = await request.json();
    
    try {
      const connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      await connection.end();
  
      if (Array.isArray(rows) && rows.length > 0) {
        const user = rows[0] as any;
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (passwordMatch) {
          console.log('logged in successfully');
          const token = jwt.sign({ userId: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
          
          const response = NextResponse.json({ success: true, username: user.username });
          response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 3600,
            path: '/',
          });
          
          return response;  // Return the successful response here
        }
      }
  
      // If we reach here, either user not found or password didn't match
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  }