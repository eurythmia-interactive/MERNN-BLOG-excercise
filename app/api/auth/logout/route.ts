import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() { // Removed 'request: Request' parameter as it's not used
  try {
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );

    // Await the cookies() function call before calling .set()
    (await cookies()).set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      expires: new Date(0), // Set to a past date to expire the cookie
      path: '/',
    });

    return response;

  } catch (error) { // 'error' is now 'unknown' or 'any' (implicitly)
    console.error('Logout Error:', error); // Log the error for debugging

    // Improved error message handling
    let errorMessage = 'An error occurred during logout';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = String(error);
    }

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}