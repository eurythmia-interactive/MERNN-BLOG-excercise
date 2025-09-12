import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// Define the JWT Payload interface
interface JwtPayload {
  id: string;
  // Add other properties if you include them in your JWT payload (e.g., email)
}

export async function GET() { // Removed 'request: Request' parameter as it's not used
  await dbConnect();

  try {
    // Await the cookies() function call
    const token = (await cookies()).get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Ensure JWT_SECRET is defined and typed
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    // Explicitly type the decoded token
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) { // 'error' is now 'unknown' or 'any' (implicitly)
    console.error('Authentication Error:', error); // Log the error for debugging

    let errorMessage = 'Invalid token or server error';
    if (error instanceof Error) {
      // If it's a JWT error, you might want more specific messages
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Token expired';
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token';
      } else {
        errorMessage = error.message; // Generic error message
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = String(error); // Fallback for other error types
    }

    return NextResponse.json(
      { message: errorMessage }, // Use the derived errorMessage
      { status: 401 }
    );
  }
}