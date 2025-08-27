'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/components/providers/AuthProvider';
import { Lock, Mail, Eye, EyeOff, Clock, CheckCircle, Shield, Users } from 'lucide-react';

// validation schema
const schema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { signIn, isLoading: authLoading, error: authError } = useAuth();

  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    if (authError) {
      // authError might be an Error or a custom object; handle gracefully
      const msg = (authError as any)?.message || String(authError) || 'An error occurred during login';
      setApiError(msg);
      setIsSubmitting(false);
    }
  }, [authError]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      await signIn(data.email, data.password);
      // if signIn does not throw, consider login successful
    } catch (err) {
      console.error('Login error:', err);
      setApiError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-teal-400/15 via-cyan-300/10 to-blue-400/8 backdrop-blur-3xl border border-white/5 shadow-2xl"></div>
        <div className="absolute bottom-20 -left-32 w-80 h-80 bg-gradient-to-tr from-teal-300/20 via-emerald-200/10 to-cyan-300/15 backdrop-blur-3xl rounded-full border border-white/5 shadow-2xl"></div>
        <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-200/10 via-teal-200/15 to-cyan-200/10 backdrop-blur-3xl rounded-3xl border border-white/5 shadow-xl rotate-45"></div>
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-gradient-to-bl from-teal-300/15 to-cyan-200/10 backdrop-blur-2xl rounded-full border border-white/5 shadow-lg"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-tr from-blue-300/10 to-teal-300/15 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-lg rotate-12"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-lg">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Clock className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">WorkSync</h1>
                <p className="text-teal-200">Admin Dashboard</p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-4xl font-bold text-white mb-6">Welcome Back</h2>
              <p className="text-white/80 text-lg leading-relaxed">
                Access your workforce management dashboard and streamline your business operations with ease.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-teal-500/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-teal-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Employee Management</h3>
                  <p className="text-white/70 text-sm">Complete control over your workforce</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-cyan-500/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Secure Access</h3>
                  <p className="text-white/70 text-sm">Advanced security and data protection</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-green-500/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Real-time Tracking</h3>
                  <p className="text-white/70 text-sm">Live attendance and location monitoring</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">WorkSync</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                <p className="text-white/70">Enter your credentials to access your dashboard</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="your@email.com"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all duration-300"
                      disabled={isSubmitting || authLoading}
                    />
                  </div>
                  {errors.email && <p className="mt-2 text-xs text-red-300">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all duration-300"
                      disabled={isSubmitting || authLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-white/50 hover:text-white/70 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-white/50 hover:text-white/70 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-2 text-xs text-red-300">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      {...register('rememberMe')}
                      id="rememberMe"
                      type="checkbox"
                      className="h-4 w-4 text-teal-500 bg-white/10 border-white/30 rounded focus:ring-teal-400/20 focus:ring-2"
                      disabled={isSubmitting || authLoading}
                    />
                    <label htmlFor="rememberMe" className="ml-3 text-sm text-white/80">
                      Remember me
                    </label>
                  </div>
                  <a
                    href="/forgot-password"
                    className="text-sm text-teal-300 hover:text-teal-200 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                {apiError && <p className="text-center text-sm text-red-300">{apiError}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting || authLoading || !isValid}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                >
                  {isSubmitting || authLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-white/70">
                  Don&apos;t have an account?{' '}
                  <a
                    href="/register"
                    className="text-teal-300 hover:text-teal-200 font-semibold transition-colors"
                  >
                    Create one
                  </a>
                </p>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/50 text-sm">
                🔒 Your data is protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// 'use client';

// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { useAuth } from '@/components/AuthProvider';
// import { useEffect, useState } from 'react';
// import Button from '@/components/ui/Button';
// import Input from '@/components/ui/Input';
// import Card from '@/components/ui/Card';
// import Image from 'next/image';
// import { Lock, Mail } from 'lucide-react';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';
// import Images from '@/constants/images';

// // Define your schema
// const schema = z.object({
//   email: z.string()
//     .min(1, 'Email is required')
//     .email('Please enter a valid email address'),
//   password: z.string()
//     .min(1, 'Password is required')
//     .min(6, 'Password must be at least 6 characters'),
// });

// type FormData = z.infer<typeof schema>;

// export default function LoginPage() {
//   const { user, signIn, isLoading: authLoading, error: authError } = useAuth();
//   const [apiError, setApiError] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isValid },
//   } = useForm<FormData>({
//     resolver: zodResolver(schema),
//     mode: 'onChange',
//   });

//   useEffect(() => {
//     if (authError) {
//       setApiError(authError.message || 'An error occurred during login');
//       setIsSubmitting(false);
//     }
//   }, [authError]);

//   const onSubmit = async (data: FormData) => {
//     setApiError(null);
//     setIsSubmitting(true);
//     try {
//       await signIn(data.email, data.password);
//     } catch (err) {
//       console.error('Login error:', err);
//       setApiError('Login failed. Please check your credentials and try again.');
//       setIsSubmitting(false);
//     }
//   };

//   // If auth is loading, show a spinner
//   if (authLoading && !user) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <LoadingSpinner className="h-12 w-12 text-blue-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
//       {/* Left side - Branding/Illustration */}
//       <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-600 to-tail-800 items-center justify-center p-8">
//         <div className="max-w-md text-center">
//           <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-6">
//             <Lock className="h-8 w-8 text-white" />
//           </div>
//           <h2 className="text-3xl font-bold text-white mb-4">Welcome Back</h2>
//           <p className="text-blue-100 mb-8">
//             Streamline your workforce management with our admin dashboard.
//           </p>
//           <div className="relative w-full h-64">
//             <Image
//               src={Images.LoginIllustration} // Make sure this path is correct
//               alt="Login Illustration"
//               fill
//               className="object-contain"
//               priority
//             />
//           </div>
//         </div>
//       </div>

//       {/* Right side - Login Form */}
//       <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8">
//         <Card className="w-full max-w-md shadow-lg">
//           <div className="p-6 sm:p-8">
//             <div className="text-center mb-8">
//               <h1 className="text-2xl font-bold text-teal-600">Sign In</h1>
//               <p className="text-gray-400 mt-2">
//                 Enter your credentials to access your account
//               </p>
//             </div>

//             {apiError && (
//               <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center">
//                 <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                 </svg>
//                 {apiError}
//               </div>
//             )}

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               <Input
//                 label="Email Address"
//                 type="email"
//                 placeholder="your@email.com"
//                 error={errors.email?.message}
//                 disabled={isSubmitting}
//                 startIcon={<Mail className="h-5 w-5 text-gray-400" />}
//                 {...register('email')}
//               />

//               <Input
//                 label="Password"
//                 type="password"
//                 placeholder="••••••••"
//                 error={errors.password?.message}
//                 disabled={isSubmitting}
//                 startIcon={<Lock className="h-5 w-5 text-gray-400" />}
//                 {...register('password')}
//               />

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <input
//                     id="remember-me"
//                     name="remember-me"
//                     type="checkbox"
//                     className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
//                     Remember me
//                   </label>
//                 </div>
//                 <a href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-500">
//                   Forgot password?
//                 </a>
//               </div>

//               <Button
//                   type="submit"
//                   variant="primary"
//                   size="lg"
//                   fullWidth
//                   isLoading={authLoading}
//                   loadingText="Signing in..."
//                   disabled={isSubmitting || !isValid}
//                 >
//                 Sign In
//               </Button>
//             </form>

//             <div className="mt-6 text-center text-sm text-gray-500">
//               Don&apos;t have an account?{' '}
//               <a href="/register" className="font-medium text-teal-600 hover:text-teal-500">
//                 Create one
//               </a>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }