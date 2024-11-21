import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Create a response that will clear the token cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });

    // Clear the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 0, // Immediately expire the cookie
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      error: 'Logout failed' 
    }, { status: 500 });
  }
}