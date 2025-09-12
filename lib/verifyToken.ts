import { NextRequest } from 'next/server';
import { cookies } from 'next/headers'; // Make sure this is 'next/headers', not 'next/server'
import jwt from 'jsonwebtoken';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'; // Import specific error types for better handling

// Define an interface for the decoded token payload
interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
  // Add any other properties you put in your JWT payload
  // email?: string;
}

export const verifyToken = async (request: NextRequest): Promise<{ userId: string }> => {
  // Make the function async because we're using await
  try {
    // Await the cookies() call
    const token = (await cookies()).get('token')?.value;

    if (!token) {
      throw new Error('No token provided. Authorization denied.');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

    // Attach user ID to the request for easy access in route handlers
    return { userId: decoded.id };

  } catch (error) { // Removed ': any'
    // Re-throw with a more specific message for different JWT errors
    if (error instanceof TokenExpiredError) {
      throw new Error('Token has expired. Please log in again.');
    }
    if (error instanceof JsonWebTokenError) {
      throw new Error('Invalid token. Authorization denied.');
    }
    // For other errors or if the original error has a message
    // Safely extract message if it's an Error instance, otherwise stringify
    if (error instanceof Error) {
        throw new Error(error.message || 'Authentication failed.');
    } else {
        throw new Error(String(error) || 'Authentication failed.');
    }
  }
};