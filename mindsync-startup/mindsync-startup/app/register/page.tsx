'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Құпия сөздер сәйкес келмейді!');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      // Тіркелген соң бірден кіру бетіне немесе чатқа бағыттау
      router.push('/chat');
      
    } catch (err: any) {
      setError(err.message || 'Тіркелу кезінде қате кетті.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MindSync</h1>
          <p className="text-gray-500 mt-2">Жаңа аккаунт жасау</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Құпия сөз</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Құпия сөзді қайталаңыз</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-semibold py-2.5 rounded-lg hover:bg-black transition disabled:opacity-50 mt-4"
          >
            {loading ? 'Тіркелуде...' : 'Тіркелу'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Аккаунтыңыз бар ма?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Кіру
          </Link>
        </p>
      </div>
    </div>
  );
}
