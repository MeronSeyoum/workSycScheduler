import React from 'react';
import { Clock, MapPin, Users, BarChart3, CheckCircle, QrCode, Calendar, Bell, DollarSign, MapPinned, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 relative overflow-hidden">
      {/* Enhanced Glassy Background Elements */}
      <div className="absolute inset-0">
        {/* Large floating glass orbs */}
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-teal-200/20 via-cyan-300/15 to-blue-200/10 backdrop-blur-3xl border border-white/10 shadow-2xl animate-pulse"></div>
        <div className="absolute bottom-20 -left-32 w-80 h-80 bg-gradient-to-tr from-teal-300/25 via-emerald-200/15 to-cyan-300/20 backdrop-blur-3xl rounded-full border border-white/10 shadow-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-blue-200/15 via-teal-200/20 to-cyan-200/15 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-xl rotate-45"></div>
        
        {/* Medium accent shapes */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-gradient-to-bl from-teal-300/20 to-cyan-200/15 backdrop-blur-2xl rounded-full border border-white/10 shadow-lg"></div>
        <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-gradient-to-tr from-blue-300/15 to-teal-300/20 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-lg rotate-12"></div>
        
        {/* Small floating elements */}
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-cyan-200/25 to-teal-200/20 backdrop-blur-xl rounded-full border border-white/15 shadow-md"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-gradient-to-bl from-teal-200/20 to-blue-200/15 backdrop-blur-xl rounded-lg border border-white/10 shadow-md rotate-45"></div>
      </div>

      {/* Premium Glass Navigation */}
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-lg">
        <nav className="flex justify-between items-center p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">WorkSync</span>
          </div>
          <div className="flex gap-4">
             <Link href="/login">
            <button className="text-white/90 hover:bg-white/10 rounded-full px-8 py-2 border border-white/20 backdrop-blur-xl transition-all duration-300 hover:shadow-lg">
              Sign In
            </button>
            </Link>
            <button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-xl rounded-full px-8 py-2 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-0.5">
              Start Free Trial
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section with Premium Glass Effects */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
                  Smart Workforce
                </span>
                <br />
                <span className="text-white/95">Management</span>
              </h1>
              <p className="text-lg text-white/80 mb-10 leading-relaxed">
                Complete workforce solution with admin scheduling, employee management, QR attendance, geofencing, and detailed reporting for local businesses
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-2xl rounded-full px-10 py-3 text-base font-semibold transition-all duration-300 hover:shadow-teal-500/25 transform hover:-translate-y-1">
                  Start Free 30-Day Trial
                </button>
                <button className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full px-10 py-3 text-base font-semibold backdrop-blur-xl transition-all duration-300 hover:shadow-xl">
                  Watch Demo
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">99.9%</div>
                  <div className="text-sm text-white/70">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">500+</div>
                  <div className="text-sm text-white/70">Businesses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">24/7</div>
                  <div className="text-sm text-white/70">Support</div>
                </div>
              </div>
            </div>

            {/* Premium Dashboard Mockup */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-semibold text-white">Admin Dashboard</span>
                  </div>
                  
                  {/* Live employee cards */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-500/20 backdrop-blur-xl rounded-xl border border-green-400/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-400/30 backdrop-blur-xl rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-300" />
                        </div>
                        <div>
                          <span className="text-white font-medium">Sarah Johnson</span>
                          <div className="text-green-200 text-sm">Main Store • 8:15 AM</div>
                        </div>
                      </div>
                      <span className="text-green-300 bg-green-400/20 px-3 py-1 rounded-full text-sm font-medium">Active</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-blue-500/20 backdrop-blur-xl rounded-xl border border-blue-400/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-400/30 backdrop-blur-xl rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-300" />
                        </div>
                        <div>
                          <span className="text-white font-medium">Mike Chen</span>
                          <div className="text-blue-200 text-sm">Warehouse • Break until 2:30 PM</div>
                        </div>
                      </div>
                      <span className="text-blue-300 bg-blue-400/20 px-3 py-1 rounded-full text-sm font-medium">Break</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-500/20 backdrop-blur-xl rounded-xl border border-gray-400/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-400/30 backdrop-blur-xl rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-300" />
                        </div>
                        <div>
                          <span className="text-white font-medium">Alex Rivera</span>
                          <div className="text-gray-200 text-sm">Off Today • Next: Tomorrow 9 AM</div>
                        </div>
                      </div>
                      <span className="text-gray-300 bg-gray-400/20 px-3 py-1 rounded-full text-sm font-medium">Off</span>
                    </div>
                  </div>

                  {/* QR Location */}
                  <div className="mt-8 p-5 bg-teal-500/20 backdrop-blur-xl rounded-xl border border-teal-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Main Store Location</div>
                        <div className="text-teal-200 text-sm">15 employees scheduled today</div>
                      </div>
                      <div className="w-14 h-14 bg-white/90 backdrop-blur-xl border-2 border-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                        <QrCode className="w-8 h-8 text-teal-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Feature Showcase */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Complete Workforce Management Solution</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">Everything you need to manage your team efficiently with cutting-edge technology</p>
          </div>

          {/* Admin Features */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">🎯 Admin Panel Features</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Calendar className="w-8 h-8" />, title: "Smart Scheduling", desc: "Create and manage employee shifts with drag-and-drop simplicity" },
                { icon: <Users className="w-8 h-8" />, title: "Employee Management", desc: "Complete employee profiles, roles, and permission controls" },
                { icon: <MapPinned className="w-8 h-8" />, title: "Geofencing Setup", desc: "Define work locations with GPS boundaries for accurate tracking" },
                { icon: <FileText className="w-8 h-8" />, title: "Advanced Reporting", desc: "Detailed analytics, payroll summaries, and attendance reports" }
              ].map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20 hover:border-teal-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <div className="text-teal-300 mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-white/70 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Features */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">📱 Employee Mobile Experience</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <QrCode className="w-8 h-8" />, title: "QR Clock In/Out", desc: "Quick and secure attendance tracking with QR code scanning" },
                { icon: <Bell className="w-8 h-8" />, title: "Shift Reminders", desc: "Automated notifications for upcoming shifts and schedule changes" },
                { icon: <TrendingUp className="w-8 h-8" />, title: "Hours Tracking", desc: "Real-time work hours tracking and overtime calculations" },
                { icon: <DollarSign className="w-8 h-8" />, title: "Payroll Summary", desc: "View earnings, hours worked, and payment history instantly" }
              ].map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20 hover:border-cyan-400/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <div className="text-cyan-300 mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-white/70 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium CTA Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/30 via-cyan-500/20 to-blue-500/30 backdrop-blur-3xl"></div>
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div className="bg-white/10 backdrop-blur-3xl p-12 rounded-3xl border border-white/20 shadow-2xl">
              <h2 className="text-5xl font-bold text-white mb-6">
                Transform Your Business Today
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
                Join 500+ local businesses using WorkSync to streamline workforce management, reduce payroll errors, and boost productivity by 40%
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-2xl rounded-full px-12 py-4 text-lg font-semibold transition-all duration-300 hover:shadow-teal-500/25 transform hover:-translate-y-1">
                  Start Your Free Trial
                </button>
                <button className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full px-12 py-4 text-lg font-semibold backdrop-blur-xl transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
              <p className="text-white/60 text-sm">No credit card required • Setup in 5 minutes • Cancel anytime</p>
            </div>
          </div>
        </section>

        {/* Mobile App Showcase */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-8">Powerful Mobile Experience</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-500/20 backdrop-blur-xl p-3 rounded-xl text-teal-300 text-xl font-bold min-w-[60px] text-center">1</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Instant Clock-In</h3>
                    <p className="text-white/70">Employees scan QR codes at their work location for instant, secure attendance tracking</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-teal-500/20 backdrop-blur-xl p-3 rounded-xl text-teal-300 text-xl font-bold min-w-[60px] text-center">2</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Location Verification</h3>
                    <p className="text-white/70">Geofencing ensures employees are at the correct location before allowing check-in</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-teal-500/20 backdrop-blur-xl p-3 rounded-xl text-teal-300 text-xl font-bold min-w-[60px] text-center">3</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Real-Time Updates</h3>
                    <p className="text-white/70">View schedules, track hours, and receive notifications all in one beautiful app</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Premium Mobile Mockup */}
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/10 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-white/20">
                <div className="bg-slate-900 rounded-2xl w-full aspect-[9/16] p-8 flex flex-col shadow-2xl">
                  {/* Phone status bar */}
                  <div className="flex justify-between items-center text-white text-sm mb-8">
                    <span className="font-medium">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* App content */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                      <Clock className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">Ready to Clock In</h3>
                    <p className="text-gray-300 text-sm mb-8">Scan QR code to start your shift</p>
                    
                    {/* QR Scanner frame */}
                    <div className="w-40 h-40 border-2 border-teal-400 rounded-2xl flex items-center justify-center mb-6 bg-teal-500/10 backdrop-blur-xl">
                      <QrCode className="w-12 h-12 text-teal-400" />
                    </div>
                    
                    <div className="bg-green-500/20 backdrop-blur-xl rounded-xl p-4 border border-green-400/30">
                      <div className="flex items-center gap-2 text-green-300 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>Location verified • Main Store</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Premium Glass Footer */}
      <footer className="bg-white/5 backdrop-blur-2xl border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="flex items-center gap-4 mb-8 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">WorkSync </span>
            </div>
            {/* <div className="flex gap-12">
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Product</h4>
                <ul className="space-y-2 text-white/70">
                  <li><a href="#" className="hover:text-teal-300 transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-teal-300 transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-teal-300 transition-colors">Demo</a></li>
                  <li><a href="#" className="hover:text-teal-300 transition-colors">API</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Company</h4>
                <ul className="space-y-2 text-white/70">
                  <li><a href="#" className="hover:text-teal-300 transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-teal-300 transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-teal-300 transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-teal-300 transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>*/}
          </div> 
          <div className="border-t border-white/10 pt-8 text-center text-white/60">
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