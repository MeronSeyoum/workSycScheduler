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
  CheckCircle,
  Shield,
  Users,
  BarChart3,
  Calendar,
  TrendingUp,
  DollarSign,
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

// Feature data
const features = [
  {
    icon: <Users className="w-5 h-5 lg:w-6 lg:h-6 text-teal-300" />,
    title: "Complete Employee Management",
    description:
      "Manage profiles, roles, permissions, and schedules in one centralized dashboard. Track performance metrics and maintain detailed employee records with advanced filtering and search capabilities.",
    tags: ["Role-based access", "Performance analytics", "Document management"],
    color: "teal",
  },
  {
    icon: <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-cyan-300" />,
    title: "Enterprise-Grade Security",
    description:
      "Multi-layered security with end-to-end encryption, two-factor authentication, and role-based access controls. SOC 2 compliant with regular security audits and real-time threat detection.",
    tags: [
      "2FA & MFA",
      "End-to-end encryption",
      "GDPR compliant",
      "Audit logs",
    ],
    color: "cyan",
  },
  {
    icon: <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-300" />,
    title: "Real-time Workforce Tracking",
    description:
      "Live monitoring of attendance, location, and productivity with GPS verification and QR code check-ins. Receive instant notifications and generate comprehensive reports for payroll and compliance.",
    tags: [
      "GPS geofencing",
      "QR attendance",
      "Live dashboard",
      "Automated reports",
    ],
    color: "green",
  },
  {
    icon: <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-blue-300" />,
    title: "Advanced Analytics & Reporting",
    description:
      "Comprehensive business intelligence with customizable dashboards, trend analysis, and predictive insights. Export data in multiple formats and integrate with your existing business tools.",
    tags: [
      "Custom reports",
      "Data export",
      "API integration",
      "Trend analysis",
    ],
    color: "blue",
  },
  {
    icon: <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-purple-300" />,
    title: "Smart Scheduling & Automation",
    description:
      "Intelligent shift planning with conflict detection, availability tracking, and automated shift assignments. Reduce scheduling time by 75% with AI-powered recommendations and pattern recognition.",
    tags: [
      "Auto-scheduling",
      "Conflict detection",
      "Shift swapping",
      "Mobile access",
    ],
    color: "purple",
  },
];

// Custom icons for features
const FeatureIcon = ({
  icon,
  color,
}: {
  icon: React.ReactNode;
  color: string;
}) => (
  <div
    className={`w-10 h-10 lg:w-12 lg:h-12 bg-${color}-500/20 backdrop-blur-xl rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
  >
    {icon}
  </div>
);

const FeatureTag = ({ tag, color }: { tag: string; color: string }) => (
  <span
    className={`inline-block bg-${color}-500/20 text-${color}-300 text-[10px] lg:text-xs px-2 py-1 rounded-full`}
  >
    {tag}
  </span>
);

// Feature Card Component
const FeatureCard = ({ feature }: { feature: (typeof features)[0] }) => (
  <div
    className={`flex items-start gap-4 p-4 lg:p-6 bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl border border-white/10 hover:border-${feature.color}-400/30 transition-all duration-300 group`}
  >
    <FeatureIcon icon={feature.icon} color={feature.color} />
    <div className="flex-1 min-w-0">
      <h3 className="text-white font-semibold text-sm lg:text-base mb-1 lg:mb-2">
        {feature.title}
      </h3>
      <p className="text-white/70 text-xs lg:text-sm leading-relaxed">
        {feature.description}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {feature.tags.map((tag, index) => (
          <FeatureTag key={index} tag={tag} color={feature.color} />
        ))}
      </div>
    </div>
  </div>
);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-teal-400/10 via-cyan-300/8 to-blue-400/5 backdrop-blur-2xl"></div>
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 lg:w-80 lg:h-80 bg-gradient-to-tr from-teal-300/15 via-emerald-200/8 to-cyan-300/10 backdrop-blur-2xl rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-200/8 via-teal-200/10 to-cyan-200/6 backdrop-blur-2xl rounded-3xl rotate-45"></div>
      </div>

      <div className="relative z-10 min-h-screen flex max-w-7xl mx-auto gap-10 ">
        {/* Left Panel - Features */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center gap-4 py-8 sm:py-12 lg:py-12">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">WorkSync</h1>
                <p className="text-teal-200 text-sm">Admin Dashboard</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-white/80 text-sm leading-relaxed">
                Access your workforce management dashboard and streamline your
                business operations.
              </p>
            </div>

            {/* Features Grid */}
            <div className="space-y-4 max-h-auto pr-2">
              {features.map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex-col items-center justify-center p-4 lg:p-10 ">
       <div className="hidden lg:flex items-center gap-3 mb-4 lg:pt-16">
  <h2 className="text-3xl font-bold text-white mb-4">Welcome Back</h2>
</div>
          <div className="w-full max-w-lg">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-center gap-3 lg:pt-0 pt-20 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">WorkSync</span>
            </div>

            {/* Login Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-xl"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
                <p className="text-white/70 text-sm">
                  Enter your credentials to access your dashboard
                </p>
              </div>

              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-white/50" />
                    </div>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all duration-200 text-sm"
                      disabled={isSubmitting || authLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-300">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-white/50" />
                    </div>
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all duration-200 text-sm"
                      disabled={isSubmitting || authLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-white/50 hover:text-white/70 transition-colors" />
                      ) : (
                        <Eye className="h-4 w-4 text-white/50 hover:text-white/70 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-300">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      {...register("rememberMe")}
                      id="rememberMe"
                      type="checkbox"
                      className="h-4 w-4 text-teal-500 bg-white/10 border-white/30 rounded focus:ring-teal-400/20 focus:ring-2"
                      disabled={isSubmitting || authLoading}
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 text-sm text-white/80"
                    >
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

                {/* Error Message */}
                {apiError && (
                  <p className="text-center text-sm text-red-300 py-2">
                    {apiError}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || authLoading || !isValid}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting || authLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-white/70 text-sm">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/register"
                    className="text-teal-300 hover:text-teal-200 font-semibold transition-colors"
                  >
                    Create one
                  </a>
                </p>
              </div>
            </form>

            {/* Security Note */}
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
