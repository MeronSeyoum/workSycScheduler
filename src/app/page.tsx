'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, Users, BarChart3, CheckCircle, QrCode, Calendar, Bell, DollarSign, MapPinned, FileText, TrendingUp, Menu, X } from 'lucide-react';
// Define a type for the color keys
type ColorKey = 'green' | 'blue' | 'gray';

interface Employee {
  name: string;
  location: string;
  status: string;
  color: ColorKey; // Use the specific type here
}


export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Color mapping for consistent styling
  const colorMap = {
    green: { 
      bg: 'bg-green-500/20', 
      border: 'border-green-400/30', 
      text: 'text-green-300', 
      badge: 'bg-green-400/20',
      icon: 'text-green-300'
    },
    blue: { 
      bg: 'bg-blue-500/20', 
      border: 'border-blue-400/30', 
      text: 'text-blue-300', 
      badge: 'bg-blue-400/20',
      icon: 'text-blue-300'
    },
    gray: { 
      bg: 'bg-gray-500/20', 
      border: 'border-gray-400/30', 
      text: 'text-gray-300', 
      badge: 'bg-gray-400/20',
      icon: 'text-gray-300'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -right-32 w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-teal-200/15 via-cyan-300/10 to-blue-200/8 backdrop-blur-3xl opacity-70"></div>
        <div className="absolute bottom-20 -left-32 w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-tr from-teal-300/20 via-emerald-200/10 to-cyan-300/15 backdrop-blur-3xl rounded-full opacity-60"></div>
        <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 lg:w-72 lg:h-72 bg-gradient-to-r from-blue-200/10 via-teal-200/15 to-cyan-200/10 backdrop-blur-3xl rounded-3xl rotate-45 opacity-50"></div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <nav className="flex justify-between items-center p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="text-xl lg:text-2xl font-bold text-white">WorkSync</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4">
            <button 
              onClick={() => router.push('/login')}
              className="text-white/90 hover:text-white hover:bg-white/10 rounded-full px-4 sm:px-6 lg:px-8 py-2 border border-white/20 backdrop-blur-xl transition-all duration-300"
              aria-label="Sign in"
            >
              Sign In
            </button>
            <button 
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-full px-4 sm:px-6 lg:px-8 py-2 transition-all duration-300 transform hover:-translate-y-0.5"
              aria-label="Start free trial"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-xl border-t border-white/10 animate-fadeIn">
            <div className="px-4 py-6 space-y-4">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/login');
                }}
                className="w-full text-white/90 hover:text-white hover:bg-white/10 rounded-full px-6 py-3 border border-white/20 backdrop-blur-xl transition-all duration-300"
              >
                Sign In
              </button>
              <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-full px-6 py-3 transition-all duration-300">
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
                <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  Smart Workforce
                </span>
                <br />
                <span className="text-white">Management</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-lg text-white/80 mb-6 sm:mb-8 lg:mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                WorkSync gives you all the tools to manage your workforce seamlessly—from 
                smart scheduling and QR attendance to geofencing and detailed reporting—streamlining
                 daily operations and keeping your business running smoothly wherever your team works
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-12 justify-center lg:justify-start">
                <button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-full px-6 sm:px-8 lg:px-10 py-3 text-sm sm:text-base font-semibold transition-all duration-300 transform hover:-translate-y-1">
                  Start Free 30-Day Trial
                </button>
                <button className="border-2 border-white/30 text-white/90 hover:text-white hover:bg-white/10 rounded-full px-6 sm:px-8 lg:px-10 py-3 text-sm sm:text-base font-semibold backdrop-blur-xl transition-all duration-300">
                  Watch Demo
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-8 pt-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">99.9%</div>
                  <div className="text-xs sm:text-sm text-white/70">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">500+</div>
                  <div className="text-xs sm:text-sm text-white/70">Businesses</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">24/7</div>
                  <div className="text-xs sm:text-sm text-white/70">Support</div>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative order-2 lg:order-2 mb-8 lg:mb-0">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-white/20 shadow-xl">
                <div className="space-y-4 lg:space-y-6">
                  <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-8">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <span className="text-lg lg:text-xl font-semibold text-white">Admin Dashboard</span>
                  </div>
                  
                  {/* Employee Cards */}
                  <div className="space-y-3 lg:space-y-4">
                    {employeeData.map((employee, index) => {
                      const colors = colorMap[employee.color];
                      return (
                        <div key={index} className={`flex items-center justify-between p-3 lg:p-4 ${colors.bg} backdrop-blur-xl rounded-xl border ${colors.border}`}>
                          <div className="flex items-center gap-3 lg:gap-4 min-w-0 flex-1">
                            <div className={`w-8 h-8 lg:w-10 lg:h-10 ${colors.badge} backdrop-blur-xl rounded-full flex items-center justify-center flex-shrink-0`}>
                              {employee.status === "Active" && <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-300" />}
                              {employee.status === "Break" && <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-blue-300" />}
                              {employee.status === "Off" && <Users className="w-4 h-4 lg:w-5 lg:h-5 text-gray-300" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-white font-medium text-sm lg:text-base block truncate">{employee.name}</span>
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
                  <div className="mt-6 lg:mt-8 p-4 lg:p-5 bg-teal-500/20 backdrop-blur-xl rounded-xl border border-teal-400/30">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium text-sm lg:text-base">Main Store Location</div>
                        <div className="text-teal-300 text-xs lg:text-sm">15 employees scheduled today</div>
                      </div>
                      <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/90 backdrop-blur-xl border-2 border-teal-400 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 lg:mb-6">Complete Workforce Management Solution</h2>
            <p className="text-lg sm:text-xl lg:text-xl text-white/80 max-w-3xl mx-auto">Everything you need to manage your team efficiently with cutting-edge technology</p>
          </div>

          {/* Admin Features */}
          <div className="mb-8 sm:mb-12 lg:mb-20">
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 lg:mb-8 text-center">🎯 Admin Panel Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {adminFeatures.map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-xl p-4 lg:p-6 rounded-2xl border border-white/20 hover:border-teal-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <div className="text-teal-300 mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h4 className="text-base lg:text-lg font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-white/80 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Features */}
          <div className="mb-8 sm:mb-12 lg:mb-20">
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 lg:mb-8 text-center">📱 Employee Mobile Experience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {employeeFeatures.map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-xl p-4 lg:p-6 rounded-2xl border border-white/20 hover:border-cyan-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <div className="text-cyan-300 mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h4 className="text-base lg:text-lg font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-white/80 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-12 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/30 via-cyan-500/20 to-blue-500/30 backdrop-blur-3xl"></div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-6 text-center">
            <div className="bg-white/10 backdrop-blur-3xl p-6 lg:p-12 rounded-2xl lg:rounded-3xl border border-white/20 shadow-2xl">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-6">
                Transform Your Business Today
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed">
                Join local businesses using WorkSync to streamline workforce management, reduce payroll errors, and boost productivity by 40%
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 lg:mb-8">
                <button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-full px-6 sm:px-8 lg:px-12 py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1">
                  Start Your Free Trial
                </button>
                <button className="border-2 border-white/30 text-white/90 hover:text-white hover:bg-white/10 rounded-full px-6 sm:px-8 lg:px-12 py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold backdrop-blur-xl transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
              <p className="text-white/70 text-xs sm:text-sm">No credit card required • Setup in 5 minutes • Cancel anytime</p>
            </div>
          </div>
        </section>

        {/* Mobile App Showcase */}
        <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 lg:mb-8 text-center lg:text-left">Powerful Mobile Experience</h2>
              <div className="space-y-4 lg:space-y-6">
                {mobileSteps.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-teal-500/20 backdrop-blur-xl p-2 lg:p-3 rounded-xl text-teal-300 text-lg lg:text-xl font-bold min-w-[40px] sm:min-w-[48px] lg:min-w-[60px] text-center flex-shrink-0">{item.step}</div>
                    <div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-white/80 text-xs sm:text-sm lg:text-base">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Mobile Mockup */}
            <div className="relative order-1 lg:order-2 flex justify-center mb-8 lg:mb-0">
              <div className="relative max-w-xs w-full">
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-3xl blur-2xl"></div>
                <div className="relative bg-white/10 backdrop-blur-xl p-4 lg:p-2 rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20">
                  <div className="bg-slate-900 rounded-xl lg:rounded-2xl w-full aspect-[9/16] p-4 lg:py-8 lg:py-6 flex flex-col shadow-2xl">
                    {/* Phone Status Bar */}
                    <div className="flex justify-between items-center text-white text-xs lg:text-sm mb-6 lg:mb-8">
                      <span className="font-medium">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 lg:w-4 lg:h-4 bg-white rounded-full"></div>
                        <div className="w-3 h-3 lg:w-4 lg:h-4 bg-white rounded-full"></div>
                        <div className="w-3 h-3 lg:w-4 lg:h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* App Content */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-4 lg:mb-6 shadow-xl">
                        <Clock className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-sm lg:text-lg mb-2">Ready to Clock In</h3>
                      <p className="text-gray-300 text-xs lg:text-sm mb-6 lg:mb-8">Scan QR code to start your shift</p>
                      
                      {/* QR Scanner Frame */}
                      <div className="w-24 h-24 lg:w-40 lg:h-40 border-2 border-teal-400 rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 lg:mb-6 bg-teal-500/10 backdrop-blur-xl">
                        <QrCode className="w-8 h-8 lg:w-12 lg:h-12 text-teal-400" />
                      </div>
                      
                      <div className="bg-green-500/20 backdrop-blur-xl rounded-xl p-3 lg:p-4 border border-green-400/30 w-full">
                        <div className="flex items-center gap-2 text-green-300 text-xs lg:text-sm justify-center">
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
      <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 py-8 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-col items-center mb-8 lg:mb-12">
            <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-8">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl lg:rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-bold text-white">WorkSync</span>
            </div>
          </div> 
          <div className="border-t border-white/10 pt-6 lg:pt-8 text-center text-white/70 text-sm lg:text-base">
            © {new Date().getFullYear()} WorkSync Local. Empowering local businesses with smart workforce management.
          </div>
        </div>
      </footer>
    </div>
  );
}





// import Image from "next/image";
// import Link from "next/link";
// import Button from "@/components/ui/Button";
// import Images from "@/constants/images";
// import Logo from "@/components/ui/logo";

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-[#e5f0F0]">
//       {/* Navigation */}
//       <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
//         <nav className="flex justify-between items-center p-4 max-w-7xl mx-auto">
//          <Logo />
//           <div className="flex gap-4">
//             <Link href="/login">
//               <Button variant="primary" className="text-gray-700 ">
//                 Sign In
//               </Button>
//             </Link>
//             <Link href="/register">
//               <Button variant="secondary" className="bg-teal-700 hover:bg-teal-800 shadow-md hover:shadow-lg transition-shadow">
//                 Get Started
//               </Button>
//             </Link>
//           </div>
//         </nav>
//       </header>

//       {/* Hero Section */}
//       <main>
//         <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
//           <div className="flex flex-col lg:flex-row gap-16 items-center">
//             <div className="lg:w-1/2 space-y-6">
//               <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
//                 Workforce Management <span className="text-teal-700">Reimagined</span>
//               </h1>
//               <p className="text-xl text-gray-600">
//                 The modern way to schedule, track, and optimize your team&apos;s workflow.
//               </p>
//               <div className="flex flex-wrap gap-4 mt-8">
//                 <Link href="/demo">
//                   <Button size="lg" className="bg-teal-700 hover:bg-teal-800 shadow-md">
//                     Live Demo
//                   </Button>
//                 </Link>
//                 <Link href="/register">
//                   <Button variant="secondary" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-100/80">
//                     Start Free Trial
//                   </Button>
//                 </Link>
//               </div>
//               <div className="flex items-center gap-3 mt-12 text-sm text-gray-500">
//                 <div className="flex -space-x-2">
//                   {[1, 2, 3].map((item) => (
//                     <div key={item} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
//                   ))}
//                 </div>
//                 <span>Trusted by 500+ businesses worldwide</span>
//               </div>
//             </div>

//             <div className="lg:w-1/2 relative">
//               <div className="relative rounded-2xl bg-gradient-to-br from-teal-50/90 to-gray-50/90 p-8 shadow-lg border border-gray-200/90 backdrop-blur-sm">
//                 <div className="absolute -top-4 -right-4 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-700">
//                   New Feature
//                 </div>
//                 <div className="space-y-6">
//                   {[
//                     {
//                       icon: "👥",
//                       title: "Team Management",
//                       description: "Add and organize your team members in seconds"
//                     },
//                     {
//                       icon: "📅",
//                       title: "Smart Scheduling",
//                       description: "AI-powered shift recommendations"
//                     },
//                     {
//                       icon: "⏱️",
//                       title: "Time Tracking",
//                       description: "Real-time attendance monitoring"
//                     }
//                   ].map((item, index) => (
//                     <div key={index} className="flex items-start gap-4 p-4 hover:bg-white/70 rounded-lg transition-all duration-200">
//                       <div className="text-2xl p-2 bg-white rounded-lg shadow-sm border border-gray-100">
//                         {item.icon}
//                       </div>
//                       <div>
//                         <h4 className="text-lg font-semibold text-gray-800">{item.title}</h4>
//                         <p className="text-gray-600">{item.description}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Logo Cloud */}
//         <section className="py-12 bg-white/80 backdrop-blur-sm border-y border-gray-200/60">
//           <div className="max-w-7xl mx-auto px-6">
//             <p className="text-center text-gray-500 mb-8">Trusted by innovative companies</p>
//             <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-80">
//               {["Company 1", "Company 2", "Company 3", "Company 4"].map((company, index) => (
//                 <div key={index} className="h-8 w-auto text-gray-600 font-medium">
//                   {company}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* Features Section */}
//         <section className="py-20 bg-white">
//           <div className="max-w-7xl mx-auto px-6">
//             <div className="text-center max-w-2xl mx-auto mb-16">
//               <h2 className="text-3xl font-bold text-gray-900 mb-4">
//                 Everything you need to manage your workforce
//               </h2>
//               <p className="text-gray-600">
//                 WorkSync combines powerful features with an intuitive interface to save you time and reduce complexity.
//               </p>
//             </div>

//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {[
//                 {
//                   icon: "📊",
//                   title: "Advanced Analytics",
//                   description: "Gain insights into labor costs and productivity trends"
//                 },
//                 {
//                   icon: "📱",
//                   title: "Mobile App",
//                   description: "Manage your team on the go with our iOS and Android apps"
//                 },
//                 {
//                   icon: "🔄",
//                   title: "Automations",
//                   description: "Set up rules for automatic shift assignments and approvals"
//                 },
//                 {
//                   icon: "🔒",
//                   title: "Security",
//                   description: "Enterprise-grade security to protect your data"
//                 },
//                 {
//                   icon: "🤝",
//                   title: "Integrations",
//                   description: "Connect with your favorite payroll and HR systems"
//                 },
//                 {
//                   icon: "🛠️",
//                   title: "Customization",
//                   description: "Tailor WorkSync to your business needs"
//                 }
//               ].map((feature, index) => (
//                 <div key={index} className="group p-6 rounded-xl hover:bg-gray-50/80 hover:shadow-sm hover:border-gray-200/60 border border-transparent transition-all duration-200">
//                   <div className="text-3xl mb-4">{feature.icon}</div>
//                   <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
//                   <p className="text-gray-600">{feature.description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* CTA Section */}
//         <section className="py-20 bg-gradient-to-br from-teal-800 to-teal-700 text-white">
//           <div className="max-w-4xl mx-auto px-6 text-center">
//             <h2 className="text-3xl font-bold mb-6">Ready to transform your workforce management?</h2>
//             <p className="text-xl text-teal-100/90 mb-8">
//               Join thousands of businesses already using WorkSync to save time and reduce costs.
//             </p>
//             <div className="flex flex-wrap justify-center gap-4">
//               <Link href="/register">
//                 <Button size="lg" className="bg-white text-teal-800 hover:bg-gray-100 shadow-md">
//                   Start Free Trial
//                 </Button>
//               </Link>
//               <Link href="/demo">
//                 <Button variant="primary" size="lg" className="border-white/80 text-white hover:bg-white/10 hover:border-white">
//                   Book a Demo
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-gray-300 py-16">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
//             <div>
//               <div className="flex items-center gap-2 mb-6">
//                 <Image
//                   src={Images.logo}
//                   alt="WorkSync Logo"
//                   width={32}
//                   height={32}
//                 />
//                 <span className="text-xl font-bold text-white">WorkSync</span>
//               </div>
//               <p className="text-gray-400">
//                 Modern workforce management for modern businesses.
//               </p>
//             </div>
//             <div>
//               <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
//               <ul className="space-y-2 text-gray-400">
//                 <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
//                 <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
//                 <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
//                 <li><Link href="/updates" className="hover:text-white transition-colors">Updates</Link></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
//               <ul className="space-y-2 text-gray-400">
//                 <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
//                 <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
//                 <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
//                 <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
//               <ul className="space-y-2 text-gray-400">
//                 <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
//                 <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
//                 <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
//                 <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
//               </ul>
//             </div>
//           </div>
//           <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
//             <div className="text-gray-500 mb-4 md:mb-0">
//               © {new Date().getFullYear()} WorkSync. All rights reserved.
//             </div>
//             <div className="flex gap-6">
//               <Link href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</Link>
//               <Link href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</Link>
//               <Link href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</Link>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }