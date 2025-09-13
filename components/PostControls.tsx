"use client";

import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PostControlsProps {
  authorId: string;
  postId: string;
  postSlug: string;
}

const PostControls = ({ authorId, postId, postSlug }: PostControlsProps) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      const toastId = toast.loading('Deleting post...');
      try {
        await axios.delete(`/api/posts/${postId}`);
        toast.success('Post deleted successfully', { id: toastId });
        router.push('/'); // Redirect to homepage after deletion
        router.refresh(); // Refresh server components
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete post', { id: toastId });
      }
    }
  };

  // Only render controls if the logged-in user is the author of the post
  if (user?.id === authorId) {
    return (
      <div className="mt-8 flex items-center space-x-4">
        <Link
          href={`/posts/${postSlug}/edit`}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    );
  }

  return null; // Render nothing if the user is not the author
};

export default PostControls;
