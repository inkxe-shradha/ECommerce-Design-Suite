import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Zap, Mail, Lock, User, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useRegister } from "@workspace/api-client-react";
import { useUser } from "../context/UserContext";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { refreshUser } = useUser();
  const registerMutation = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    if (!name.trim()) {
      newErrors.name = "Full Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    registerMutation.mutate(
      { data: { name, email, password } },
      {
        onSuccess: async (data: any) => {
          if (data?.token || data?.id) {
            localStorage.setItem('shopnow_auth_token', String(data.token || data.id));
          }
          await refreshUser();
          setLocation("/");
        },
        onError: (err: any) => {
          setApiError(err?.data?.error || err.message || "Registration failed. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Store
        </Link>
        
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap size={26} color="white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Join Shop<span className="text-indigo-500">Now</span> for personalized deals & express checkout
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 rounded-2xl">
          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
              <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-rose-800 dark:text-rose-300">{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    errors.name
                      ? "border-rose-400 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.name}</p>
              )}
            </div>

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
                      ? "border-rose-400 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.email}</p>
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
                      ? "border-rose-400 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    errors.confirmPassword
                      ? "border-rose-400 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-lg shadow-indigo-500/25 disabled:opacity-60 transition-all cursor-pointer mt-2"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" /> Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
