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
  Sun,
  Moon,
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
    icon: <Users className="w-5 h-5 text-teal-300" />,
    title: "Team Management",
    description: "Organize your workforce efficiently with comprehensive team management tools",
    tags: ["Role management", "Team organization", "Access control"],
    color: "teal"
  },
  {
    icon: <Shield className="w-5 h-5 text-cyan-300" />,
    title: "Secure Platform",
    description: "Enterprise-grade security with end-to-end encryption and role-based access controls",
    tags: ["Data encryption", "2FA support", "Audit logs"],
    color: "cyan"
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-blue-300" />,
    title: "Advanced Analytics",
    description: "Real-time insights and comprehensive reporting for data-driven decisions",
    tags: ["Live dashboards", "Custom reports", "Trend analysis"],
    color: "blue"
  },
  {
    icon: <CheckCircle className="w-5 h-5 text-green-300" />,
    title: "Real-time Workforce Tracking",
    description: "Live monitoring of attendance, location, and productivity with GPS verification and QR code check-ins",
    tags: ["GPS geofencing", "QR attendance", "Live dashboard"],
    color: "green"
  },
];

// Custom components with theme support
const FeatureIcon = ({ icon, color, isDark }: { icon: React.ReactNode; color: string; isDark: boolean }) => (
  <div className={`w-10 h-10 ${
    isDark 
      ? `bg-${color}-500/20 backdrop-blur-xl` 
      : 'bg-white/80 backdrop-blur-sm'
  } rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
    {icon}
  </div>
);

const FeatureTag = ({ tag, color, isDark }: { tag: string; color: string; isDark: boolean }) => (
  <span className={`inline-block ${
    isDark 
      ? `bg-${color}-500/20 text-${color}-300` 
      : `bg-${color}-100 text-${color}-700`
  } text-[10px] px-2 py-1 rounded-full`}>
    {tag}
  </span>
);

const FeatureCard = ({ feature, isDark }: { feature: typeof features[0]; isDark: boolean }) => (
  <div className={`flex items-start gap-4 p-4 ${
    isDark 
      ? `bg-white/5 backdrop-blur-xl border-white/10 hover:border-${feature.color}-400/30` 
      : 'bg-white/60 backdrop-blur-sm border-gray-200 hover:border-teal-500/40'
  } backdrop-blur-xl rounded-xl border transition-all duration-300 group`}>
    <FeatureIcon icon={feature.icon} color={feature.color} isDark={isDark} />
    <div className="flex-1 min-w-0">
      <h3 className={`${
        isDark ? 'text-white' : 'text-gray-900'
      } font-semibold text-sm mb-1`}>
        {feature.title}
      </h3>
      <p className={`${
        isDark ? 'text-white/70' : 'text-gray-600'
      } text-xs leading-relaxed`}>
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

export default function RegisterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      role: 'employee',
    },
  });

  // Watch form values for real-time validation
  const formData = watch();

  useEffect(() => {
    if (user) {
      router.push('/admin/dashboard');
    }
  }, [user, router]);

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

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
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
    select: isDark ? 'bg-white/5 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900',
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
              Join our platform to streamline your workforce management and optimize business operations.
            </p>
          </div>

          {/* Features List - Hidden on mobile */}
          <div className="hidden lg:block space-y-3 max-w-lg">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} isDark={isDark} />
            ))}
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xl font-bold ${themeClasses.text}`}>WorkSync</span>
            </div>

            {/* Registration Card */}
            <div className={`${themeClasses.card} backdrop-blur-2xl rounded-2xl p-6 lg:p-8 border ${themeClasses.cardBorder} shadow-2xl`}>
              <div className="text-center mb-6">
                <h2 className={`text-2xl lg:text-3xl font-bold ${themeClasses.text} mb-2`}>Get Started</h2>
                <p className={`${themeClasses.textMuted} text-sm`}>
                  Create your account to manage your workforce
                </p>
              </div>

              {errors.root && (
                <div className={`mb-4 p-3 ${
                  isDark ? 'bg-red-400/20 border-red-400/30 text-red-100' : 'bg-red-100 border-red-200 text-red-700'
                } backdrop-blur-xl rounded-lg border text-sm`}>
                  {errors.root.message}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className={`block ${themeClasses.textSecondary} text-sm font-medium mb-2`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 ${themeClasses.textMuted}`} />
                    </div>
                    <input
                      {...register("name")}
                      type="text"
                      placeholder="John Doe"
                      className={`w-full pl-10 pr-4 py-3 ${themeClasses.input} backdrop-blur-xl border rounded-xl ${themeClasses.inputFocus} focus:ring-2 focus:outline-none transition-all duration-200`}
                      disabled={isSubmitting || isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className={`mt-1.5 text-xs ${themeClasses.error}`}>{errors.name.message}</p>
                  )}
                </div>

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
                      disabled={isSubmitting || isLoading}
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
                      disabled={isSubmitting || isLoading}
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

                {/* Confirm Password Field */}
                <div>
                  <label className={`block ${themeClasses.textSecondary} text-sm font-medium mb-2`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${themeClasses.textMuted}`} />
                    </div>
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-12 py-3 ${themeClasses.input} backdrop-blur-xl border rounded-xl ${themeClasses.inputFocus} focus:ring-2 focus:outline-none transition-all duration-200`}
                      disabled={isSubmitting || isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className={`h-5 w-5 ${themeClasses.textMuted} hover:opacity-70 transition-opacity`} />
                      ) : (
                        <Eye className={`h-5 w-5 ${themeClasses.textMuted} hover:opacity-70 transition-opacity`} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className={`mt-1.5 text-xs ${themeClasses.error}`}>{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Role Field */}
                <div>
                  <label className={`block ${themeClasses.textSecondary} text-sm font-medium mb-2`}>
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getRoleIcon("employee")}
                    </div>
                    <select
                      {...register("role")}
                      className={`w-full pl-10 pr-8 py-3 appearance-none ${themeClasses.input} backdrop-blur-xl border rounded-xl ${themeClasses.inputFocus} focus:ring-2 focus:outline-none transition-all duration-200`}
                      disabled={isSubmitting || isLoading}
                    >
                      <option value="employee" className={isDark ? "bg-slate-800" : "bg-white"}>Employee</option>
                      <option value="manager" className={isDark ? "bg-slate-800" : "bg-white"}>Manager</option>
                      <option value="admin" className={isDark ? "bg-slate-800" : "bg-white"}>Administrator</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className={`h-5 w-5 ${themeClasses.textMuted}`} />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading || !isValid}
                  className={`w-full ${themeClasses.button} disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2`}
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className={`${themeClasses.textMuted} text-sm`}>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className={`${themeClasses.link} font-semibold transition-colors`}
                  >
                    Sign in
                  </Link>
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