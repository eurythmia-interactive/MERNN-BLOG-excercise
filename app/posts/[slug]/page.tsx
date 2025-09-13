import { headers } from "next/headers";
import { notFound } from "next/navigation";
import PostControls from "@/components/PostControls";

// Define the shape of the post object for this page
interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

// Helper function to get the base URL for API calls.
function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000";
  return baseUrl;
}

// Function to fetch a single post by its slug
async function getPostBySlug(slug: string): Promise<Post | null> {
  const headerList = await headers();
  const requestHost = headerList.get("host");

  const fullBaseUrl = getApiBaseUrl();
  const host = requestHost ? requestHost : new URL(fullBaseUrl).host;

  if (!host) {
    throw new Error("Could not determine host for API call to fetch a single post.");
  }

  const protocol = requestHost ? (requestHost.startsWith('localhost') ? "http" : "https") : new URL(fullBaseUrl).protocol.replace(':', '');
  const res = await fetch(`${protocol}://${host}/api/posts/slug/${slug}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch post: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// This function tells Next.js which slugs to pre-render at build time
export async function generateStaticParams() {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/posts`);

    if (!res.ok) {
      console.error(`Failed to fetch posts for generateStaticParams: ${res.status} ${res.statusText}`);
      return [];
    }

    const posts: Post[] = await res.json();

    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function PostPage(props: { params: { slug: string } }) {
  // CRUCIAL FIX: Await the params object itself
  const { params } = await props; // Await the props object to ensure params is resolved
  // Or, if props itself is always an object and only params within is deferred:
  // const awaitedParams = await params;
  // const post = await getPostBySlug(awaitedParams.slug);

  // The most common and direct fix for the specific error "params should be awaited" is to await the destructuring of params
  const { slug } = await params; // Destructure slug from the awaited params

  const post = await getPostBySlug(slug); // Use the awaited slug

  // If the post is not found, show the 404 page
  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{post.title}</h1>
      <div className="flex items-center mb-8 text-gray-500">
        <p>By {post.author.name}</p>
        <span className="mx-2">&bull;</span>
        <p>
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
      <div
        className="prose lg:prose-xl max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/\\n/g, '<br />') }}
      />

      <PostControls
        authorId={post.author._id}
        postId={post._id}
        postSlug={post.slug}
      />
    </article>
  );
}

export const revalidate = 60;