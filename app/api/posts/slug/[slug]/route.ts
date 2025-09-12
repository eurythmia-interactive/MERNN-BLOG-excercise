import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

interface Params {
  slug: string;
}

// GET a single post by SLUG (Public)
export async function GET(request: NextRequest, { params }: { params: Params }) {
  await dbConnect();
  try {
    const post = await Post.findOne({ slug: params.slug }).populate('author', 'name');

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Error fetching post' }, { status: 500 });
  }
}
