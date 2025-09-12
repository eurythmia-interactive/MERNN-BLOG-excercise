import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { verifyToken } from '@/lib/verifyToken';
// No need to import AxiosError here unless you're catching client-side Axios errors

interface Params {
  id: string;
}

// GET a single post (Public)
export async function GET(request: NextRequest, { params }: { params: Params }) {
  await dbConnect();
  try {
    const post = await Post.findById(params.id).populate('author', 'name');
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post, { status: 200 });
  } catch (error) { // Removed ': any'
    console.error(`Error fetching post with ID ${params.id}:`, error); // Log the error for debugging
    let errorMessage = 'Error fetching post';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// PUT (update) a single post (Protected)
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  await dbConnect();

  try {
    // 1. Authentication - ADD AWAIT HERE
    const { userId } = await verifyToken(request); // <<< This is the fix

    // 2. Find the post
    const post = await Post.findById(params.id);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // 3. Authorization: Check if the logged-in user is the author
    // Ensure post.author is populated or safely accessed
    if (!post.author || post.author.toString() !== userId) { // Added check for !post.author
      return NextResponse.json({ message: 'Not authorized to update this post' }, { status: 403 }); // 403 Forbidden
    }

    // 4. Update the post
    const { title, content } = await request.json();
    const updatedPost = await Post.findByIdAndUpdate(
      params.id,
      { title, content },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    return NextResponse.json(updatedPost, { status: 200 });

  } catch (error) { // Removed ': any'
    console.error(`Error updating post with ID ${params.id}:`, error); // Log the error for debugging

    let statusCode = 500;
    let errorMessage = 'An internal server error occurred';

    if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes('Authorization denied') || errorMessage.includes('Token expired') || errorMessage.includes('Invalid token')) {
            statusCode = 401; // Unauthorized
        } else if (errorMessage.includes('Not authorized')) { // Specific check for 403 message
            statusCode = 403;
        } else if (errorMessage.includes('validation failed')) {
            statusCode = 400; // Bad Request for validation errors
        }
    } else if (typeof error === 'string') {
        errorMessage = error;
        if (errorMessage.includes('Authorization denied') || errorMessage.includes('Token expired') || errorMessage.includes('Invalid token')) {
            statusCode = 401;
        } else if (errorMessage.includes('Not authorized')) {
            statusCode = 403;
        }
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}

// DELETE a single post (Protected)
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  await dbConnect();

  try {
    // 1. Authentication - ADD AWAIT HERE
    const { userId } = await verifyToken(request); // <<< This is the fix

    // 2. Find the post
    const post = await Post.findById(params.id);
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // 3. Authorization: Check if the logged-in user is the author
    // Ensure post.author is populated or safely accessed
    if (!post.author || post.author.toString() !== userId) { // Added check for !post.author
      return NextResponse.json({ message: 'Not authorized to delete this post' }, { status: 403 });
    }

    // 4. Delete the post
    await Post.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });

  } catch (error) { // Removed ': any'
    console.error(`Error deleting post with ID ${params.id}:`, error); // Log the error for debugging

    let statusCode = 500;
    let errorMessage = 'An internal server error occurred';

    if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes('Authorization denied') || errorMessage.includes('Token expired') || errorMessage.includes('Invalid token')) {
            statusCode = 401; // Unauthorized
        } else if (errorMessage.includes('Not authorized')) { // Specific check for 403 message
            statusCode = 403;
        }
    } else if (typeof error === 'string') {
        errorMessage = error;
        if (errorMessage.includes('Authorization denied') || errorMessage.includes('Token expired') || errorMessage.includes('Invalid token')) {
            statusCode = 401;
        } else if (errorMessage.includes('Not authorized')) {
            statusCode = 403;
        }
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}