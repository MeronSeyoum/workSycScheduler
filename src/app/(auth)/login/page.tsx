"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Clock,
  Sun,
  Moon,
  CheckCircle,
  Shield,
  Users,
  BarChart3,
  Calendar,
} from "lucide-react";

// Validation schema
const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

// Simplified features with shorter descriptions
const features = [
  {
    icon: <Users className="w-5 h-5 text-teal-300" />,
    title: "Employee Management",
    description: "Centralized profiles, roles, and permissions with advanced analytics.",
    tags: ["Role-based access", "Performance analytics"],
    color: "teal",
  },
  {
    icon: <Shield className="w-5 h-5 text-cyan-300" />,
    title: "Enterprise Security",
    description: "Multi-factor auth, encryption, and SOC 2 compliance built-in.",
    tags: ["2FA & MFA", "End-to-end encryption"],
    color: "orange",
  },
  {
    icon: <CheckCircle className="w-5 h-5 text-green-300" />,
    title: "Real-time Tracking",
    description: "Live attendance monitoring with GPS and QR code verification.",
    tags: ["GPS geofencing", "QR attendance"],
    color: "green",
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-blue-300" />,
    title: "Advanced Analytics",
    description: "Custom dashboards, reports, and predictive business insights.",
    tags: ["Custom reports", "Data export"],
    color: "blue",
  },
  {
    icon: <Calendar className="w-5 h-5 text-purple-300" />,
    title: "Smart Scheduling",
    description: "AI-powered shift planning with conflict detection and automation.",
    tags: ["Auto-scheduling", "Conflict detection"],
    color: "purple",
  },
];

// Custom icons for features
const FeatureIcon = ({
  icon,
  color,
  isDark,
}: {
  icon: React.ReactNode;
  color: string;
  isDark: boolean;
}) => (
  <div
    className={`w-10 h-10 ${
      isDark 
        ? `bg-${color}-500/20 backdrop-blur-xl` 
        : 'bg-white/80 backdrop-blur-sm'
    } rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
  >
    {icon}
  </div>
);

const FeatureTag = ({ tag, color, isDark }: { tag: string; color: string; isDark: boolean }) => (
  <span
    className={`inline-block ${
      isDark 
        ? `bg-${color}-500/20 text-${color}-300` 
        : `bg-${color}-100 text-${color}-700`
    } text-[12px] px-2 py-1 rounded-full`}
  >
    {tag}
  </span>
);

// Feature Card Component
const FeatureCard = ({ feature, isDark }: { feature: (typeof features)[0]; isDark: boolean }) => (
  <div
    className={`flex items-start gap-4 p-4 ${
      isDark 
        ? `bg-white/5 backdrop-blur-xl border-white/10 hover:border-${feature.color}-400/30` 
        : 'bg-white/60 backdrop-blur-sm border-gray-200 hover:border-teal-500/40'
    } backdrop-blur-xl rounded-xl border transition-all duration-300 group`}
  >
    <FeatureIcon icon={feature.icon} color={feature.color} isDark={isDark} />
    <div className="flex-1 min-w-0">
      <h3 className={`${
        isDark ? 'text-white' : 'text-gray-900'
      } font-semibold text-base mb-1`}>
        {feature.title}
      </h3>
      <p className={`${
        isDark ? 'text-white/70' : 'text-gray-600'
      } text-sm leading-relaxed`}>
        {feature.description}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {feature.tags.map((tag, index) => (
          <FeatureTag key={index} tag={tag} color={feature.color} isDark={isDark} />
        ))}
      </div>
    </div>
  </div>
);

export default function LoginPage() {

  const [isDark, setIsDark] = useState(false);

 
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
    mode: "onChange",
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  useEffect(() => {
    if (authError) {
      const msg =
        (authError as any)?.message ||
        String(authError) ||
        "An error occurred during login";
      setApiError(msg);
      setIsSubmitting(false);
    }
  }, [authError]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      await signIn(data.email, data.password);
    } catch (err) {
      console.error("Login error:", err);
      setApiError("Login failed. Please check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('loginTheme');
    if (saved) {
      setIsDark(saved === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('loginTheme', newTheme ? 'dark' : 'light');
  };



  const themeClasses = {
    background: isDark 
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900' 
      : 'bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-white/80' : 'text-gray-700',
    textMuted: isDark ? 'text-white/60' : 'text-gray-500',
    card: isDark ? 'bg-white/10' : 'bg-white',
    cardBorder: isDark ? 'border-white/20' : 'border-gray-200',
    input: isDark ? 'bg-white/5 border-white/20 text-white placeholder-white/50' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    inputFocus: isDark ? 'focus:border-teal-400/50 focus:ring-teal-400/20' : 'focus:border-teal-500 focus:ring-teal-500/20',
    button: isDark ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700' : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800',
    featureCard: isDark ? 'bg-white/5 border-white/10 hover:border-teal-400/30' : 'bg-white/60 border-gray-200 hover:border-teal-500/40',
    link: isDark ? 'text-teal-300 hover:text-teal-200' : 'text-teal-600 hover:text-teal-700',
    glow: isDark ? 'from-teal-400/10 to-cyan-400/5' : 'from-teal-200/30 to-cyan-200/20',
    error: isDark ? 'text-red-300' : 'text-red-500',
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} relative overflow-hidden transition-colors duration-300`}>
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-20 -right-32 w-96 h-96 rounded-full bg-gradient-to-br ${themeClasses.glow} backdrop-blur-3xl`}></div>
        <div className={`absolute bottom-20 -left-32 w-80 h-80 bg-gradient-to-tr ${themeClasses.glow} backdrop-blur-3xl rounded-full`}></div>
      </div>

      {/* Theme Toggle - Top Right */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-xl ${themeClasses.card} border ${themeClasses.cardBorder} backdrop-blur-xl transition-all duration-300 hover:scale-105`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-5 h-5 text-teal-300" /> : <Moon className="w-5 h-5 text-teal-600" />}
      </button>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* Left Panel - Branding & Features */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 lg:p-12">
          {/* Logo & Branding */}
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl lg:text-3xl font-bold ${themeClasses.text}`}>WorkSync</h1>
                <p className={`text-sm ${themeClasses.textMuted}`}>Admin Dashboard</p>
              </div>
            </div>
            <p className={`${themeClasses.textSecondary} text-lg max-w-md`}>
              Streamline workforce management with powerful tools designed for modern businesses.
            </p>
          </div>

          {/* Features List - Hidden on mobile */}
          <div className="hidden lg:block space-y-3 max-w-lg">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} isDark={isDark} />
            ))}
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md lg:pt-26">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xl font-bold ${themeClasses.text}`}>WorkSync</span>
            </div>

            {/* Login Card */}
            <div className={`${themeClasses.card} backdrop-blur-2xl rounded-2xl p-6 lg:p-8  border ${themeClasses.cardBorder} shadow-2xl`}>
              <div className="text-center mb-6">
                <h2 className={`text-2xl lg:text-3xl font-bold ${themeClasses.text} mb-2`}>Welcome Back</h2>
                <p className={`${themeClasses.textMuted} text-sm`}>
                  Sign in to access your dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className={`block ${themeClasses.textSecondary} text-sm font-medium mb-2`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 ${themeClasses.textMuted}`} />
                    </div>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="you@company.com"
                      className={`w-full pl-10 pr-4 py-3 ${themeClasses.input} backdrop-blur-xl border rounded-xl ${themeClasses.inputFocus} focus:ring-2 focus:outline-none transition-all duration-200`}
                      disabled={isSubmitting || authLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className={`mt-1.5 text-xs ${themeClasses.error}`}>{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className={`block ${themeClasses.textSecondary} text-sm font-medium mb-2`}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${themeClasses.textMuted}`} />
                    </div>
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-12 py-3 ${themeClasses.input} backdrop-blur-xl border rounded-xl ${themeClasses.inputFocus} focus:ring-2 focus:outline-none transition-all duration-200`}
                      disabled={isSubmitting || authLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className={`h-5 w-5 ${themeClasses.textMuted} hover:opacity-70 transition-opacity`} />
                      ) : (
                        <Eye className={`h-5 w-5 ${themeClasses.textMuted} hover:opacity-70 transition-opacity`} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className={`mt-1.5 text-xs ${themeClasses.error}`}>{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      {...register("rememberMe")}
                      id="rememberMe"
                      type="checkbox"
                      className={`h-4 w-4 text-teal-600 ${
                        isDark ? 'bg-white/10 border-white/30' : 'bg-transparent border-gray-300'
                      } rounded focus:ring-teal-500`}
                      disabled={isSubmitting || authLoading}
                    />
                    <label htmlFor="rememberMe" className={`ml-2 text-sm ${themeClasses.textSecondary}`}>
                      Remember me
                    </label>
                  </div>
                  <a href="/forgot-password" className={`text-sm ${themeClasses.link} transition-colors`}>
                    Forgot password?
                  </a>
                </div>

                {/* Error Message */}
                {apiError && (
                  <p className={`text-center text-sm ${themeClasses.error} py-2`}>
                    {apiError}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || authLoading || !isValid}
                  className={`w-full ${themeClasses.button} disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2`}
                >
                  {isSubmitting || authLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className={`${themeClasses.textMuted} text-sm`}>
                  Don&apot;t have an account?{" "}
                  <a href="/register" className={`${themeClasses.link} font-semibold transition-colors`}>
                    Create one
                  </a>
                </p>
              </div>
            </div>

            {/* Security Note */}
            <p className={`mt-4 text-center ${themeClasses.textMuted} text-xs`}>
              🔒 Protected with enterprise-grade security
            </p>
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
