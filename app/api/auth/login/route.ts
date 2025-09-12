import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // This will now have types after installing @types/jsonwebtoken

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email, and explicitly select the password field
    // It's important to make sure your User model type (if defined explicitly)
    // includes 'password' when `.select('+password')` is used.
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 } // 401 Unauthorized
      );
    }

    // Compare submitted password with the hashed password in the DB
    // Type assertion `user.password as string` might be needed if `user.password`
    // is inferred as `string | undefined` due to `select: false` in schema.
    // However, since you selected it, Mongoose typically ensures it's there.
    const isMatch = await bcrypt.compare(password, user.password as string); // Add `as string` for safety, though Mongoose should guarantee it.

    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT payload
    const payload = {
      id: user._id,
      // You might want to include other user details in the payload if needed
      // email: user.email,
      // name: user.name,
    };

    // Ensure JWT_SECRET is defined and typed.
    // process.env.JWT_SECRET! asserts it's not null/undefined at runtime.
    // However, TypeScript still needs to know it's a string.
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    // Sign the token
    const token = jwt.sign(payload, jwtSecret, { // Use `jwtSecret` here
      expiresIn: '1d', // Token expires in 1 day
    });

    // Create a response object to set the cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );

    // Set the token in a secure, httpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
      maxAge: 60 * 60 * 24, // 1 day in seconds
      path: '/',
    });

    return response;

  } catch (error) { // Removed ': any'. 'error' is now 'unknown' or 'any' (implicitly)
    console.error('Login Error:', error);

    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = String(error);
    }

    return NextResponse.json(
      { message: errorMessage, error: errorMessage },
      { status: 500 }
    );
  }
}