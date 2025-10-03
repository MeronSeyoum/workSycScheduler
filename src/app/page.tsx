'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Clock, MapPin, Users, BarChart3, CheckCircle, QrCode, Calendar, Bell, DollarSign, MapPinned, FileText, TrendingUp, Menu, X, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
type ColorKey = 'green' | 'blue' | 'gray';

interface Employee {
  name: string;
  location: string;
  status: string;
  color: ColorKey;
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    if (saved) {
      setIsDark(saved === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Theme-aware color mapping
  const colorMap = {
    green: { 
      bg: isDark ? 'bg-green-500/20' : 'bg-green-100', 
      border: isDark ? 'border-green-400/30' : 'border-green-300', 
      text: isDark ? 'text-green-300' : 'text-green-700', 
      badge: isDark ? 'bg-green-400/20' : 'bg-green-200',
      icon: isDark ? 'text-green-300' : 'text-green-600'
    },
    blue: { 
      bg: isDark ? 'bg-blue-500/20' : 'bg-blue-100', 
      border: isDark ? 'border-blue-400/30' : 'border-blue-300', 
      text: isDark ? 'text-blue-300' : 'text-blue-700', 
      badge: isDark ? 'bg-blue-400/20' : 'bg-blue-200',
      icon: isDark ? 'text-blue-300' : 'text-blue-600'
    },
    gray: { 
      bg: isDark ? 'bg-gray-500/20' : 'bg-gray-100', 
      border: isDark ? 'border-gray-400/30' : 'border-gray-300', 
      text: isDark ? 'text-gray-300' : 'text-gray-700', 
      badge: isDark ? 'bg-gray-400/20' : 'bg-gray-200',
      icon: isDark ? 'text-gray-300' : 'text-gray-600'
    }
  };

  const employeeData = useMemo((): Employee[] => [
    { name: "Sarah Johnson", location: "Main Store • 8:15 AM", status: "Active", color: "green" },
    { name: "Mike Chen", location: "Warehouse • Break until 2:30 PM", status: "Break", color: "blue" },
    { name: "Alex Rivera", location: "Off Today • Next: Tomorrow 9 AM", status: "Off", color: "gray" }
  ], []);

  const adminFeatures = useMemo(() => [
    { icon: <Calendar className="w-6 h-6 lg:w-8 lg:h-8" />, title: "Smart Scheduling", desc: "Create and manage employee shifts with drag-and-drop simplicity" },
    { icon: <Users className="w-6 h-6 lg:w-8 lg:h-8" />, title: "Employee Management", desc: "Complete employee profiles, roles, and permission controls" },
    { icon: <MapPinned className="w-6 h-6 lg:w-8 lg:h-8" />, title: "Geofencing Setup", desc: "Define work locations with GPS boundaries for accurate tracking" },
    { icon: <FileText className="w-6 h-6 lg:w-8 lg:h-8" />, title: "Advanced Reporting", desc: "Detailed analytics, payroll summaries, and attendance reports" }
  ], []);

  const employeeFeatures = useMemo(() => [
    { icon: <QrCode className="w-6 h-6 lg:w-8 lg:h-8" />, title: "QR Clock In/Out", desc: "Quick and secure attendance tracking with QR code scanning" },
    { icon: <Bell className="w-6 h-6 lg:w-8 lg:h-8" />, title: "Shift Reminders", desc: "Automated notifications for upcoming shifts and schedule changes" },
    { icon: <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8" />, title: "Hours Tracking", desc: "Real-time work hours tracking and overtime calculations" },
    { icon: <DollarSign className="w-6 h-6 lg:w-8 lg:h-8" />, title: "Payroll Summary", desc: "View earnings, hours worked, and payment history instantly" }
  ], []);

  const mobileSteps = useMemo(() => [
    { step: "1", title: "Instant Clock-In", desc: "Employees scan QR codes at their work location for instant, secure attendance tracking" },
    { step: "2", title: "Location Verification", desc: "Geofencing ensures employees are at the correct location before allowing check-in" },
    { step: "3", title: "Real-Time Updates", desc: "View schedules, track hours, and receive notifications all in one beautiful app" }
  ], []);

  const themeClasses = {
    background: isDark 
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900' 
      : 'bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-white/80' : 'text-gray-700',
    textMuted: isDark ? 'text-white/70' : 'text-gray-600',
    card: isDark ? 'bg-white/10' : 'bg-white/80',
    cardBorder: isDark ? 'border-white/20' : 'border-gray-200',
    cardHover: isDark ? 'hover:border-teal-400/50' : 'hover:border-teal-500/50',
    header: isDark ? 'bg-white/5' : 'bg-white/70',
    headerBorder: isDark ? 'border-white/10' : 'border-gray-200/50',
    button: isDark ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700' : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800',
    buttonSecondary: isDark ? 'border-white/30 text-white/90 hover:text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100',
    gradient: isDark ? 'from-teal-300 to-cyan-300' : 'from-teal-600 to-cyan-600',
    glowLight: isDark ? 'from-teal-200/15 via-cyan-300/10 to-blue-200/8' : 'from-teal-200/40 via-cyan-300/30 to-blue-200/25',
    ctaSection: isDark ? 'from-teal-600/30 via-cyan-500/20 to-blue-500/30' : 'from-teal-400/40 via-cyan-300/30 to-blue-400/40',
    footer: isDark ? 'bg-white/5' : 'bg-gray-900/5',
    footerBorder: isDark ? 'border-white/10' : 'border-gray-300/50',
    phoneBar: isDark ? 'text-white' : 'text-gray-900',
    phoneContent: isDark ? 'bg-slate-900' : 'bg-white border border-gray-200'
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} relative overflow-hidden transition-colors duration-300`}>
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-20 -right-32 w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br ${themeClasses.glowLight} backdrop-blur-3xl opacity-70`}></div>
        <div className={`absolute bottom-20 -left-32 w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-tr ${themeClasses.glowLight} backdrop-blur-3xl rounded-full opacity-60`}></div>
        <div className={`hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 lg:w-72 lg:h-72 bg-gradient-to-r ${themeClasses.glowLight} backdrop-blur-3xl rounded-3xl rotate-45 opacity-50`}></div>
      </div>

      {/* Navigation */}
      <header className={`sticky top-0 z-50 ${themeClasses.header} backdrop-blur-xl border-b ${themeClasses.headerBorder}`}>
        <nav className="flex justify-between items-center p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className={`text-xl lg:text-2xl font-bold ${themeClasses.text}`}>WorkSync</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4 items-center">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${themeClasses.buttonSecondary} backdrop-blur-xl transition-all duration-300`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              className={`${themeClasses.textSecondary} hover:bg-opacity-10 rounded-full px-4 sm:px-6 lg:px-8 py-2 border ${themeClasses.buttonSecondary} backdrop-blur-xl transition-all duration-300`}
              aria-label="Sign in"
               onClick={() => router.push('/login')}
            >
              Sign In
            </button>
            <button 
              className={`${themeClasses.button} text-white rounded-full px-4 sm:px-6 lg:px-8 py-2 transition-all duration-300 transform hover:-translate-y-0.5`}
              aria-label="Start free trial"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`md:hidden ${themeClasses.text} p-2`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${themeClasses.card} backdrop-blur-xl border-t ${themeClasses.headerBorder} animate-fadeIn`}>
            <div className="px-4 py-6 space-y-4">
              <button 
                onClick={toggleTheme}
                className={`w-full ${themeClasses.buttonSecondary} rounded-full px-6 py-3 border backdrop-blur-xl transition-all duration-300 flex items-center justify-center gap-2`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full ${themeClasses.buttonSecondary} rounded-full px-6 py-3 border backdrop-blur-xl transition-all duration-300`}
              >
                Sign In
              </button>
              <button className={`w-full ${themeClasses.button} text-white rounded-full px-6 py-3 transition-all duration-300`}>
                Start Free Trial
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-4 lg:px-6 py-8 sm:py-12 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight">
                <span className={`bg-gradient-to-r ${themeClasses.gradient} bg-clip-text text-transparent`}>
                  Smart Workforce
                </span>
                <br />
                <span className={themeClasses.text}>Management</span>
              </h1>
              <p className={`text-base sm:text-lg lg:text-lg ${themeClasses.textSecondary} mb-6 sm:mb-8 lg:mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0`}>
                WorkSync gives you all the tools to manage your workforce seamlessly—from 
                smart scheduling and QR attendance to geofencing and detailed reporting—streamlining
                 daily operations and keeping your business running smoothly wherever your team works
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-12 justify-center lg:justify-start">
                <button className={`${themeClasses.button} text-white rounded-full px-6 sm:px-8 lg:px-10 py-3 text-sm sm:text-base font-semibold transition-all duration-300 transform hover:-translate-y-1`}>
                  Start Free 30-Day Trial
                </button>
                <button className={`border-2 ${themeClasses.buttonSecondary} rounded-full px-6 sm:px-8 lg:px-10 py-3 text-sm sm:text-base font-semibold backdrop-blur-xl transition-all duration-300`}>
                  Watch Demo
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-8 pt-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${themeClasses.gradient} bg-clip-text text-transparent`}>99.9%</div>
                  <div className={`text-xs sm:text-sm ${themeClasses.textMuted}`}>Uptime</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${themeClasses.gradient} bg-clip-text text-transparent`}>500+</div>
                  <div className={`text-xs sm:text-sm ${themeClasses.textMuted}`}>Businesses</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${themeClasses.gradient} bg-clip-text text-transparent`}>24/7</div>
                  <div className={`text-xs sm:text-sm ${themeClasses.textMuted}`}>Support</div>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative order-2 lg:order-2 mb-8 lg:mb-0">
              <div className={`${themeClasses.card} backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-8 border ${themeClasses.cardBorder} shadow-xl`}>
                <div className="space-y-4 lg:space-y-6">
                  <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-8">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <span className={`text-lg lg:text-xl font-semibold ${themeClasses.text}`}>Admin Dashboard</span>
                  </div>
                  
                  {/* Employee Cards */}
                  <div className="space-y-3 lg:space-y-4">
                    {employeeData.map((employee, index) => {
                      const colors = colorMap[employee.color];
                      return (
                        <div key={index} className={`flex items-center justify-between p-3 lg:p-4 ${colors.bg} backdrop-blur-xl rounded-xl border ${colors.border}`}>
                          <div className="flex items-center gap-3 lg:gap-4 min-w-0 flex-1">
                            <div className={`w-8 h-8 lg:w-10 lg:h-10 ${colors.badge} backdrop-blur-xl rounded-full flex items-center justify-center flex-shrink-0`}>
                              {employee.status === "Active" && <CheckCircle className={`w-4 h-4 lg:w-5 lg:h-5 ${colors.icon}`} />}
                              {employee.status === "Break" && <Clock className={`w-4 h-4 lg:w-5 lg:h-5 ${colors.icon}`} />}
                              {employee.status === "Off" && <Users className={`w-4 h-4 lg:w-5 lg:h-5 ${colors.icon}`} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className={`${themeClasses.text} font-medium text-sm lg:text-base block truncate`}>{employee.name}</span>
                              <div className={`${colors.text} text-xs lg:text-sm truncate`}>{employee.location}</div>
                            </div>
                          </div>
                          <span className={`${colors.text} ${colors.badge} px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium flex-shrink-0`}>
                            {employee.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* QR Location */}
                  <div className={`mt-6 lg:mt-8 p-4 lg:p-5 ${isDark ? 'bg-teal-500/20 border-teal-400/30' : 'bg-teal-100 border-teal-300'} backdrop-blur-xl rounded-xl border`}>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className={`${themeClasses.text} font-medium text-sm lg:text-base`}>Main Store Location</div>
                        <div className={`${isDark ? 'text-teal-300' : 'text-teal-700'} text-xs lg:text-sm`}>15 employees scheduled today</div>
                      </div>
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 ${isDark ? 'bg-white/90 border-teal-400' : 'bg-white border-teal-500'} backdrop-blur-xl border-2 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <QrCode className="w-6 h-6 lg:w-8 lg:h-8 text-teal-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 lg:px-6 pb-12 lg:pb-24">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${themeClasses.text} mb-4 lg:mb-6`}>Complete Workforce Management Solution</h2>
            <p className={`text-lg sm:text-xl lg:text-xl ${themeClasses.textSecondary} max-w-3xl mx-auto`}>Everything you need to manage your team efficiently with cutting-edge technology</p>
          </div>

          {/* Admin Features */}
          <div className="mb-8 sm:mb-12 lg:mb-20">
            <h3 className={`text-xl lg:text-2xl font-bold ${themeClasses.text} mb-6 lg:mb-8 text-center`}>🎯 Admin Panel Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {adminFeatures.map((feature, index) => (
                <div key={index} className={`${themeClasses.card} backdrop-blur-xl p-4 lg:p-6 rounded-2xl border ${themeClasses.cardBorder} ${themeClasses.cardHover} shadow-xl hover:shadow-2xl transition-all duration-300 group`}>
                  <div className={`${isDark ? 'text-teal-300' : 'text-teal-600'} mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300`}>{feature.icon}</div>
                  <h4 className={`text-base lg:text-lg font-semibold ${themeClasses.text} mb-2`}>{feature.title}</h4>
                  <p className={`${themeClasses.textSecondary} text-sm`}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Features */}
          <div className="mb-8 sm:mb-12 lg:mb-20">
            <h3 className={`text-xl lg:text-2xl font-bold ${themeClasses.text} mb-6 lg:mb-8 text-center`}>📱 Employee Mobile Experience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {employeeFeatures.map((feature, index) => (
                <div key={index} className={`${themeClasses.card} backdrop-blur-xl p-4 lg:p-6 rounded-2xl border ${themeClasses.cardBorder} hover:border-cyan-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 group`}>
                  <div className={`${isDark ? 'text-cyan-300' : 'text-cyan-600'} mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300`}>{feature.icon}</div>
                  <h4 className={`text-base lg:text-lg font-semibold ${themeClasses.text} mb-2`}>{feature.title}</h4>
                  <p className={`${themeClasses.textSecondary} text-sm`}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-12 lg:py-24 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${themeClasses.ctaSection} backdrop-blur-3xl`}></div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-6 text-center">
            <div className={`${themeClasses.card} backdrop-blur-3xl p-6 lg:p-12 rounded-2xl lg:rounded-3xl border ${themeClasses.cardBorder} shadow-2xl`}>
              <h2 className={`text-2xl sm:text-3xl lg:text-5xl font-bold ${themeClasses.text} mb-4 lg:mb-6`}>
                Transform Your Business Today
              </h2>
              <p className={`text-base sm:text-lg lg:text-xl ${themeClasses.textSecondary} mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed`}>
                Join local businesses using WorkSync to streamline workforce management, reduce payroll errors, and boost productivity by 40%
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 lg:mb-8">
                <button className={`${themeClasses.button} text-white rounded-full px-6 sm:px-8 lg:px-12 py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1`}>
                  Start Your Free Trial
                </button>
                <button className={`border-2 ${themeClasses.buttonSecondary} rounded-full px-6 sm:px-8 lg:px-12 py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold backdrop-blur-xl transition-all duration-300`}>
                  Schedule Demo
                </button>
              </div>
              <p className={`${themeClasses.textMuted} text-xs sm:text-sm`}>No credit card required • Setup in 5 minutes • Cancel anytime</p>
            </div>
          </div>
        </section>

        {/* Mobile App Showcase */}
        <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${themeClasses.text} mb-6 lg:mb-8 text-center lg:text-left`}>Powerful Mobile Experience</h2>
              <div className="space-y-4 lg:space-y-6">
                {mobileSteps.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`${isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-100 text-teal-700'} backdrop-blur-xl p-2 lg:p-3 rounded-xl text-lg lg:text-xl font-bold min-w-[40px] sm:min-w-[48px] lg:min-w-[60px] text-center flex-shrink-0`}>{item.step}</div>
                    <div>
                      <h3 className={`text-base sm:text-lg lg:text-xl font-semibold ${themeClasses.text} mb-2`}>{item.title}</h3>
                      <p className={`${themeClasses.textSecondary} text-xs sm:text-sm lg:text-base`}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Mobile Mockup */}
            <div className="relative order-1 lg:order-2 flex justify-center mb-8 lg:mb-0">
              <div className="relative max-w-xs w-full">
                <div className={`absolute -inset-4 bg-gradient-to-r ${isDark ? 'from-teal-400/20 to-cyan-400/20' : 'from-teal-400/40 to-cyan-400/40'} rounded-3xl blur-2xl`}></div>
                <div className={`relative ${themeClasses.card} backdrop-blur-xl p-4 lg:p-2 rounded-2xl lg:rounded-3xl shadow-2xl border ${themeClasses.cardBorder}`}>
                  <div className={`${themeClasses.phoneContent} rounded-xl lg:rounded-2xl w-full aspect-[9/16] p-4 lg:py-8 lg:py-6 flex flex-col shadow-2xl`}>
                    {/* Phone Status Bar */}
                    <div className={`flex justify-between items-center ${themeClasses.phoneBar} text-xs lg:text-sm mb-6 lg:mb-8`}>
                      <span className="font-medium">9:41</span>
                      <div className="flex gap-1">
                        <div className={`w-3 h-3 lg:w-4 lg:h-4 ${isDark ? 'bg-white' : 'bg-gray-900'} rounded-full`}></div>
                        <div className={`w-3 h-3 lg:w-4 lg:h-4 ${isDark ? 'bg-white' : 'bg-gray-900'} rounded-full`}></div>
                        <div className={`w-3 h-3 lg:w-4 lg:h-4 ${isDark ? 'bg-white' : 'bg-gray-900'} rounded-full`}></div>
                      </div>
                    </div>
                    
                    {/* App Content */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-4 lg:mb-6 shadow-xl">
                        <Clock className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
                      </div>
                      <h3 className={`${themeClasses.phoneBar} font-bold text-sm lg:text-lg mb-2`}>Ready to Clock In</h3>
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-xs lg:text-sm mb-6 lg:mb-8`}>Scan QR code to start your shift</p>
                      
                      {/* QR Scanner Frame */}
                      <div className={`w-24 h-24 lg:w-40 lg:h-40 border-2 ${isDark ? 'border-teal-400 bg-teal-500/10' : 'border-teal-500 bg-teal-100'} rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 lg:mb-6 backdrop-blur-xl`}>
                        <QrCode className={`w-8 h-8 lg:w-12 lg:h-12 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                      </div>
                      
                      <div className={`${isDark ? 'bg-green-500/20 border-green-400/30 text-green-300' : 'bg-green-100 border-green-300 text-green-700'} backdrop-blur-xl rounded-xl p-3 lg:p-4 border w-full`}>
                        <div className="flex items-center gap-2 text-xs lg:text-sm justify-center">
                          <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span>Location verified • Main Store</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`${themeClasses.footer} backdrop-blur-xl border-t ${themeClasses.footerBorder} py-8 lg:py-16`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-col items-center mb-8 lg:mb-12">
            <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-8">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl lg:rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <span className={`text-xl lg:text-2xl font-bold ${themeClasses.text}`}>WorkSync</span>
            </div>
          </div> 
          <div className={`border-t ${themeClasses.footerBorder} pt-6 lg:pt-8 text-center ${themeClasses.textMuted} text-sm lg:text-base`}>
            © {new Date().getFullYear()} WorkSync Local. Empowering local businesses with smart workforce management.
          </div>
        </div>
      </footer>
    </div>
  );
}