import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { verifyToken } from '@/lib/verifyToken';
import { AxiosError } from 'axios'; // Import AxiosError if you plan to use it for client-side errors,
                                   // though here we're catching server-side errors from verifyToken

// GET all posts (Public)
export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('author', 'name'); // Populate author's name only

    return NextResponse.json(posts, { status: 200 });
  } catch (error) { // Removed ': any'
    console.error('Error fetching posts:', error); // Log the error for debugging
    let errorMessage = 'Error fetching posts';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// POST a new post (Protected)
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    // 1. Verify token and get user ID - ADD AWAIT HERE
    const { userId } = await verifyToken(request); // <<< This is the fix

    // 2. Get post data from request body
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
    }

    // 3. Create and save the new post
    const newPost = new Post({
      title,
      content,
      author: userId, // Associate the post with the logged-in user
    });

    await newPost.save();

    return NextResponse.json(newPost, { status: 201 });

  } catch (error) { // Removed ': any'
    console.error('Error creating post:', error); // Log the error for debugging

    let statusCode = 500;
    let errorMessage = 'An internal server error occurred';

    if (error instanceof Error) {
        errorMessage = error.message;
        // Adjust status code based on common authentication errors from verifyToken
        if (errorMessage.includes('Authorization denied') || errorMessage.includes('Token expired') || errorMessage.includes('Invalid token')) {
            statusCode = 401; // Unauthorized
        } else if (errorMessage.includes('validation failed')) {
            statusCode = 400; // Bad Request for validation errors
        }
    } else if (typeof error === 'string') {
        errorMessage = error;
        if (errorMessage.includes('Authorization denied') || errorMessage.includes('Token expired') || errorMessage.includes('Invalid token')) {
            statusCode = 401;
        }
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}