'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Image from 'next/image';
import { Lock, Mail } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Images from '@/constants/images';

// Define your schema
const schema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { user, signIn, isLoading: authLoading, error: authError } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (authError) {
      setApiError(authError.message || 'An error occurred during login');
      setIsSubmitting(false);
    }
  }, [authError]);

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      await signIn(data.email, data.password);
    } catch (err) {
      console.error('Login error:', err);
      setApiError('Login failed. Please check your credentials and try again.');
      setIsSubmitting(false);
    }
  };

  // If auth is loading, show a spinner
  if (authLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Branding/Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-600 to-tail-800 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Welcome Back</h2>
          <p className="text-blue-100 mb-8">
            Streamline your workforce management with our admin dashboard.
          </p>
          <div className="relative w-full h-64">
            <Image
              src={Images.LoginIllustration} // Make sure this path is correct
              alt="Login Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md shadow-lg">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-teal-600">Sign In</h1>
              <p className="text-gray-400 mt-2">
                Enter your credentials to access your account
              </p>
            </div>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                error={errors.email?.message}
                disabled={isSubmitting}
                startIcon={<Mail className="h-5 w-5 text-gray-400" />}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                disabled={isSubmitting}
                startIcon={<Lock className="h-5 w-5 text-gray-400" />}
                {...register('password')}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-500">
                  Forgot password?
                </a>
              </div>

              <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={authLoading}
                  loadingText="Signing in..."
                  disabled={isSubmitting || !isValid}
                >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <a href="/register" className="font-medium text-teal-600 hover:text-teal-500">
                Create one
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}