'use client';

import ProtectedWrapper from '@/components/ProtectedWrapper';
import CreatePostForm from './CreatePostForm';   // we extract the form below

export default function CreatePostPage() {
  return (
    <ProtectedWrapper>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
        <CreatePostForm />
      </div>
    </ProtectedWrapper>
  );
}