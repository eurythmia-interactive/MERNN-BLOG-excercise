import PostCard from "@/components/PostCard";
import { headers } from "next/headers";

// Define the shape of a post object, mirroring the PostCard's expected prop
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

// This function fetches all posts.
// The `cache: 'no-store'` option ensures we get fresh data on every request in development,
// but Next.js will still perform SSG during the build for production.
async function getPosts(): Promise<Post[]> {
  // We need to construct the full URL to our own API route
  // ADD AWAIT HERE:
  const headerList = await headers(); // Get the headers object
  const host = headerList.get("host"); // Access the 'host' header from the resolved object

  // Fallback for when headers might not be available (e.g., during static generation or certain build contexts)
  // or if 'host' isn't explicitly set (though it typically is in HTTP requests).
  // In development, `host` will be `localhost:3000`. In production, it will be your deployed domain.
  if (!host) {
      // You might want a more sophisticated fallback or throw an error based on your needs.
      // For Next.js API routes in development, `host` is usually present.
      // If deployed, `host` would be the domain.
      throw new Error("Could not determine host for API call. `host` header is missing.");
  }


  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/api/posts`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  return res.json();
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <main className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Latest Blog Posts
        </h1>

        {posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No posts found.</p>
        )}
      </div>
    </main>
  );
}

// Add revalidation to re-fetch posts periodically in production (Incremental Static Regeneration)
export const revalidate = 60; // Revalidate every 60 seconds