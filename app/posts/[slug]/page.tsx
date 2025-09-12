import { headers } from "next/headers";
import { notFound } from "next/navigation";

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

// Function to fetch a single post by its slug
async function getPostBySlug(slug: string): Promise<Post | null> {
  // ADD AWAIT HERE:
  const headerList = await headers(); // Get the headers object
  const host = headerList.get("host"); // Access the 'host' header from the resolved object

  if (!host) {
    throw new Error("Could not determine host for API call. `host` header is missing.");
  }

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  // We need to adapt our backend or create a new endpoint to fetch by slug
  // For now, let's assume we create an endpoint `/api/posts/slug/[slug]`
  const res = await fetch(`${protocol}://${host}/api/posts/slug/${slug}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch post");
  }
  return res.json();
}

// This function tells Next.js which slugs to pre-render at build time
export async function generateStaticParams() {
    // ADD AWAIT HERE:
    const headerList = await headers(); // Get the headers object
    const host = headerList.get("host"); // Access the 'host' header from the resolved object

    if (!host) {
        // This is critical for build-time generation. If host isn't available, we can't fetch.
        // In a real deployment, Next.js typically provides `host` during build time,
        // but for local dev with specific setups, it might need to be explicit.
        // A more robust solution for `generateStaticParams` might involve
        // providing a hardcoded base URL for your API if 'host' is reliably absent during build.
        console.error("Warning: `host` header is missing during generateStaticParams. Falling back to localhost.");
        // Fallback for build time if host is unexpectedly null/undefined
        // This might still fail if your API isn't running at http://localhost:3000 during build
        const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
        const fallbackHost = process.env.NEXT_PUBLIC_VERCEL_URL || "localhost:3000";
        const res = await fetch(`${protocol}://${fallbackHost}/api/posts`);
        const posts: Post[] = await res.json();
        return posts.map((post) => ({ slug: post.slug }));
    }


    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const res = await fetch(`${protocol}://${host}/api/posts`);
    const posts: Post[] = await res.json();

    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

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
    </article>
  );
}

// Also add revalidation here
export const revalidate = 60;