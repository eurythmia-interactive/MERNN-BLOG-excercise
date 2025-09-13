"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

type Inputs = {
  title: string;
  content: string;
};

interface Post {
    _id: string;
    title: string;
    content: string;
    author: { _id: string };
}

const EditPostPage = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Inputs>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`/api/posts/slug/${slug}`);
        setPost(data);
        reset({ title: data.title, content: data.content }); // Pre-populate form
      } catch (error) {
        toast.error("Post not found or you don't have permission to edit it.");
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug, reset, router]);

  // Authorization check
  useEffect(() => {
    if (!authLoading && post && user?.id !== post.author._id) {
        toast.error("You are not authorized to edit this post.");
        router.push(`/posts/${slug}`);
    }
  }, [user, post, authLoading, router, slug]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!post) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Updating post...');

    try {
      await axios.put(`/api/posts/${post._id}`, data);
      toast.success('Post updated successfully!', { id: toastId });
      router.push(`/posts/${slug}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update post.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading editor...</div>;
  }

  if (!post || (user?.id !== post.author._id)) {
    // This will be caught by the useEffect redirect, but it's good practice to have a fallback.
    return <div className="flex justify-center items-center min-h-screen">Access Denied.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        {/* Form fields are identical to the create page */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            {...register("title", { required: "Title is required" })}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            rows={10}
            {...register("content", { required: "Content is required" })}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
        </div>
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPostPage;
