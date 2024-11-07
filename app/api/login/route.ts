import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import dbConfig from '../dbconfig'

async function registerUser(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO users (full_name, email, password) VALUES ("shriya",?, ?)',
      [email, hashedPassword]
    );
    await connection.end();
    console.log('User registered:', email);
  }

export async function POST(request) {
    console.log("hello");
    // await registerUser('testuser', 'password123');  // Comment this out after first run
    const { email, password } = await request.json();
    
    try {
      const connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      await connection.end();
  
      if (Array.isArray(rows) && rows.length > 0) {
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (passwordMatch) {
          console.log('logged in successfully');
          const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
          
          const response = NextResponse.json({ success: true, email: user.email });
          response.cookies.set('token', token, {
            httpOnly: false,
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