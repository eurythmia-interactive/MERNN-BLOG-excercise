'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Inputs = {
  title: string;
  content: string;
};

export default function CreatePostForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Creating post...');

    try {
      const res = await axios.post('/api/posts', data);
      toast.success('Post created successfully!', { id: toastId });
      router.push(`/posts/${res.data.slug}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create post.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          id="title"
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          id="content"
          rows={10}
          {...register('content', { required: 'Content is required' })}
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}