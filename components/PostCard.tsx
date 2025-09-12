import Link from 'next/link';

// Define the shape of the post prop
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

const PostCard = ({ post }: { post: Post }) => {
  // Create a short excerpt from the content
  const excerpt = post.content.substring(0, 150) + '...';

  return (
    <article className="p-6 bg-white rounded-lg border border-gray-200 shadow-md">
      <div className="flex justify-between items-center mb-5 text-gray-500">
        <span className="text-sm">
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="mb-5 font-light text-gray-500">{excerpt}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* You can add an author avatar here in the future */}
          <span className="font-medium">{post.author.name}</span>
        </div>
        <Link
          href={`/posts/${post.slug}`}
          className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-800"
        >
          Read more
          <svg
            className="ml-2 w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="<http://www.w3.org/2000/svg>"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </Link>
      </div>
    </article>
  );
};

export default PostCard;
