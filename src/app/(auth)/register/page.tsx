"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
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

  User,
  ChevronDown,
  Briefcase,
  UserCog,
} from "lucide-react";
import Link from "next/link";

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  role: z.enum(["admin", "manager", "employee"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Feature data
const features = [
   {
    icon: <Users className="w-5 h-5 lg:w-6 lg:h-6 text-teal-300" />,
    title: "Team Management",
    description: "Organize your workforce efficiently with comprehensive team management tools",
    tags: ["Role management", "Team organization", "Access control"],
    color: "teal"
  },
  {
    icon: <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-cyan-300" />,
    title: "Secure Platform",
    description: "Enterprise-grade security with end-to-end encryption and role-based access controls",
    tags: ["Data encryption", "2FA support", "Audit logs"],
    color: "cyan"
  },
  {
    icon: <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-blue-300" />,
    title: "Advanced Analytics",
    description: "Real-time insights and comprehensive reporting for data-driven decisions",
    tags: ["Live dashboards", "Custom reports", "Trend analysis"],
    color: "blue"
  },
  {
    icon: <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-cyan-300" />,
    title: "Enterprise-Grade Security",
    description: "Multi-layered security with end-to-end encryption, two-factor authentication, and role-based access controls. SOC 2 compliant with regular security audits.",
    tags: ["2FA & MFA", "End-to-end encryption", "GDPR compliant", "Audit logs"],
    color: "cyan"
  },
  {
    icon: <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-300" />,
    title: "Real-time Workforce Tracking",
    description: "Live monitoring of attendance, location, and productivity with GPS verification and QR code check-ins. Receive instant notifications and comprehensive reports.",
    tags: ["GPS geofencing", "QR attendance", "Live dashboard", "Automated reports"],
    color: "green"
  },

];

// Custom components
const FeatureIcon = ({ icon, color }: { icon: React.ReactNode; color: string }) => (
  <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-${color}-500/20 backdrop-blur-xl rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
    {icon}
  </div>
);

const FeatureTag = ({ tag, color }: { tag: string; color: string }) => (
  <span className={`inline-block bg-${color}-500/20 text-${color}-300 text-[10px] lg:text-xs px-2 py-1 rounded-full`}>
    {tag}
  </span>
);

const FeatureCard = ({ feature }: { feature: typeof features[0] }) => (
  <div className={`flex items-start gap-4 p-4 lg:p-6 bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl border border-white/10 hover:border-${feature.color}-400/30 transition-all duration-300 group`}>
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
      const { confirmPassword, ...registrationData } = data;
      
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
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-teal-400/10 via-cyan-300/8 to-blue-400/5 backdrop-blur-2xl"></div>
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 lg:w-80 lg:h-80 bg-gradient-to-tr from-teal-300/15 via-emerald-200/8 to-cyan-300/10 backdrop-blur-2xl rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-200/8 via-teal-200/10 to-cyan-200/6 backdrop-blur-2xl rounded-3xl rotate-45"></div>
      </div>

      <div className="relative z-10 min-h-screen flex max-w-7xl mx-auto gap-10">
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
                Join our platform to streamline your workforce management and optimize business operations.
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

        {/* Right Panel - Registration Form */}
        <div className="w-full lg:w-1/2 flex-col items-center justify-center p-4 lg:p-10">
          <div className="hidden lg:flex items-center gap-3 mb-4 lg:pt-16">
            <h2 className="text-3xl font-bold text-white mb-4">Get Started</h2>
          </div>
          
          <div className="w-full max-w-lg">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-center gap-3  my-8">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">WorkSync</span>
            </div>

            {/* Registration Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-xl"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-white/70 text-sm">
                  Join our platform to manage your workforce
                </p>
              </div>

              {errors.root && (
                <div className="mb-4 p-3 bg-red-400/20 backdrop-blur-xl rounded-lg border border-red-400/30 text-red-100 text-sm">
                  {errors.root.message}
                </div>
              )}

              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-white/50" />
                    </div>
                    <input
                      {...register("name")}
                      type="text"
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all duration-200 text-sm"
                      disabled={isSubmitting || isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-300">
                      {errors.name.message}
                    </p>
                  )}
                </div>

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
                      disabled={isSubmitting || isLoading}
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
                      disabled={isSubmitting || isLoading}
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

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-white/50" />
                    </div>
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all duration-200 text-sm"
                      disabled={isSubmitting || isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-white/50 hover:text-white/70 transition-colors" />
                      ) : (
                        <Eye className="h-4 w-4 text-white/50 hover:text-white/70 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-300">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getRoleIcon("employee")}
                    </div>
                    <select
                      {...register("role")}
                      className="w-full pl-10 pr-8 py-3 text-sm appearance-none bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all duration-200"
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </div>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-white/70 text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-teal-300 hover:text-teal-200 font-semibold transition-colors"
                  >
                    Sign in
                  </Link>
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