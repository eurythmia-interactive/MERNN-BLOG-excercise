'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function NavBar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();          // clears cookies + sets user=null
      toast.success('Logged out');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  if (!user) return null;      // safety; should never happen on protected routes

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="w-full bg-white shadow px-6 py-4 flex items-center justify-between">
      <div className="text-indigo-600 font-bold">Blog</div>

      <div className="flex items-center gap-4">
        {/* Profile Avatar */}
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
          {initials}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}