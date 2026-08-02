import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Zap, Mail, Lock, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useLogin } from '@workspace/api-client-react';
import { useUser } from '../context/UserContext';

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const { refreshUser } = useUser();
  const loginMutation = useLogin();
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState<string | null>(
    null,
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [apiError, setApiError] = useState<string | null>(null);

  // Check if session expired
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === 'true') {
      setSessionExpiredMsg('Your session has expired. Please log in again.');
    }
  }, []);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSessionExpiredMsg(null);

    if (!validate()) return;

    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: async (data: any) => {
          if (data?.token || data?.id) {
            localStorage.setItem('shopnow_auth_token', String(data.token || data.id));
          }
          await refreshUser();
          setLocation('/');
        },
        onError: (err: any) => {
          setApiError(
            err?.data?.error ||
              err.message ||
              'Invalid credentials. Please try again.',
          );
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Store
        </Link>

        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap size={26} color="white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome back to Shop<span className="text-indigo-500">Now</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Sign in to access your saved cart, recommendations & deals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 rounded-2xl">
          {sessionExpiredMsg && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
              <AlertCircle
                size={18}
                className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
              />
              <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                {sessionExpiredMsg}
              </span>
            </div>
          )}

          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
              <AlertCircle
                size={18}
                className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5"
              />
              <span className="text-xs font-medium text-rose-800 dark:text-rose-300">
                {apiError}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-lg shadow-indigo-500/25 disabled:opacity-60 transition-all cursor-pointer"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" /> Signing
                  in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
