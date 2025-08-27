'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ChevronDown, Shield, Briefcase, UserCog, Clock, CheckCircle, Users } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'manager', 'employee']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'employee',
    },
  });

  useEffect(() => {
    if (user) {
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const {  ...registrationData } = data;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      router.push('/login?registered=true');
    } catch (error) {
      if (error instanceof Error) {
        setError('root', {
          type: 'manual',
          message: error.message,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'manager': return <UserCog className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 -right-32 w-64 h-64 rounded-full bg-gradient-to-br from-teal-400/15 via-cyan-300/10 to-blue-400/8 backdrop-blur-sm border border-white/5 shadow-lg"></div>
        <div className="absolute bottom-20 -left-32 w-64 h-64 bg-gradient-to-tr from-teal-300/20 via-emerald-200/10 to-cyan-300/15 backdrop-blur-sm rounded-full border border-white/5 shadow-lg"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Side Story Section */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">WorkSync</h1>
                <p className="text-teal-200 text-sm">Admin Dashboard</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Get Started</h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Join our platform to streamline your workforce management and optimize business operations with powerful tools.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-10 h-10 bg-teal-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-teal-300" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Team Management</h3>
                  <p className="text-white/70 text-xs">Organize your workforce efficiently</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-10 h-10 bg-cyan-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Role-based Access</h3>
                  <p className="text-white/70 text-xs">Control permissions with precision</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-10 h-10 bg-green-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Real-time Analytics</h3>
                  <p className="text-white/70 text-xs">Make data-driven decisions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">WorkSync</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
                <p className="text-white/70 text-sm">Join our platform to manage your workforce</p>
              </div>

              {errors.root && (
                <div className="mb-4 p-2 bg-red-400/20 backdrop-blur-sm rounded-lg border border-red-400/30 text-red-100 text-xs">
                  {errors.root.message}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-white/90 text-xs font-medium mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-white/50" />
                    </div>
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="John Doe"
                      className="w-full pl-10 pr-3 py-2 text-sm bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 focus:outline-none transition-all"
                      disabled={isSubmitting || isLoading}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-300">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-white/90 text-xs font-medium mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-white/50" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-3 py-2 text-sm bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 focus:outline-none transition-all"
                      disabled={isSubmitting || isLoading}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-white/90 text-xs font-medium mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-white/50" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-8 py-2 text-sm bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 focus:outline-none transition-all"
                      disabled={isSubmitting || isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-white/50 hover:text-white/70" />
                      ) : (
                        <Eye className="h-4 w-4 text-white/50 hover:text-white/70" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-white/90 text-xs font-medium mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-white/50" />
                    </div>
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-8 py-2 text-sm bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 focus:outline-none transition-all"
                      disabled={isSubmitting || isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-white/50 hover:text-white/70" />
                      ) : (
                        <Eye className="h-4 w-4 text-white/50 hover:text-white/70" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-300">{errors.confirmPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-white/90 text-xs font-medium mb-1">Role</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getRoleIcon('employee')}
                    </div>
                    <select
                      {...register('role')}
                      className="w-full pl-10 pr-8 py-2 text-sm appearance-none bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 focus:outline-none transition-all"
                      disabled={isSubmitting || isLoading}
                    >
                      <option value="employee" className="bg-slate-800">Employee</option>
                      <option value="manager" className="bg-slate-800">Manager</option>
                      <option value="admin" className="bg-slate-800">Administrator</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-white/50" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </>
                  ) : (
                    'Register'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white/70 text-sm">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-teal-300 hover:text-teal-200 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-white/50 text-xs">
                🔒 Your data is protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}