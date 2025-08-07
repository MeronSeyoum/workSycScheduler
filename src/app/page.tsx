import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Images from "@/constants/images";
import Logo from "@/components/ui/logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#e5f0F0]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <nav className="flex justify-between items-center p-4 max-w-7xl mx-auto">
         <Logo />
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="primary" className="text-gray-700 ">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" className="bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg transition-shadow">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Workforce Management <span className="text-teal-700">Reimagined</span>
              </h1>
              <p className="text-xl text-gray-600">
                The modern way to schedule, track, and optimize your team's workflow.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link href="/demo">
                  <Button size="lg" className="bg-blue-700 hover:bg-blue-800 shadow-md">
                    Live Demo
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-100/80">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-3 mt-12 text-sm text-gray-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                  ))}
                </div>
                <span>Trusted by 500+ businesses worldwide</span>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="relative rounded-2xl bg-gradient-to-br from-blue-50/90 to-gray-50/90 p-8 shadow-lg border border-gray-200/90 backdrop-blur-sm">
                <div className="absolute -top-4 -right-4 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-700">
                  New Feature
                </div>
                <div className="space-y-6">
                  {[
                    {
                      icon: "👥",
                      title: "Team Management",
                      description: "Add and organize your team members in seconds"
                    },
                    {
                      icon: "📅",
                      title: "Smart Scheduling",
                      description: "AI-powered shift recommendations"
                    },
                    {
                      icon: "⏱️",
                      title: "Time Tracking",
                      description: "Real-time attendance monitoring"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 hover:bg-white/70 rounded-lg transition-all duration-200">
                      <div className="text-2xl p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{item.title}</h4>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Cloud */}
        <section className="py-12 bg-white/80 backdrop-blur-sm border-y border-gray-200/60">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-gray-500 mb-8">Trusted by innovative companies</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-80">
              {["Company 1", "Company 2", "Company 3", "Company 4"].map((company, index) => (
                <div key={index} className="h-8 w-auto text-gray-600 font-medium">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything you need to manage your workforce
              </h2>
              <p className="text-gray-600">
                WorkSync combines powerful features with an intuitive interface to save you time and reduce complexity.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "📊",
                  title: "Advanced Analytics",
                  description: "Gain insights into labor costs and productivity trends"
                },
                {
                  icon: "📱",
                  title: "Mobile App",
                  description: "Manage your team on the go with our iOS and Android apps"
                },
                {
                  icon: "🔄",
                  title: "Automations",
                  description: "Set up rules for automatic shift assignments and approvals"
                },
                {
                  icon: "🔒",
                  title: "Security",
                  description: "Enterprise-grade security to protect your data"
                },
                {
                  icon: "🤝",
                  title: "Integrations",
                  description: "Connect with your favorite payroll and HR systems"
                },
                {
                  icon: "🛠️",
                  title: "Customization",
                  description: "Tailor WorkSync to your business needs"
                }
              ].map((feature, index) => (
                <div key={index} className="group p-6 rounded-xl hover:bg-gray-50/80 hover:shadow-sm hover:border-gray-200/60 border border-transparent transition-all duration-200">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-800 to-teal-700 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your workforce management?</h2>
            <p className="text-xl text-blue-100/90 mb-8">
              Join thousands of businesses already using WorkSync to save time and reduce costs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-800 hover:bg-gray-100 shadow-md">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="border-white/80 text-white hover:bg-white/10 hover:border-white">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Image
                  src={Images.logo}
                  alt="WorkSync Logo"
                  width={32}
                  height={32}
                />
                <span className="text-xl font-bold text-white">WorkSync</span>
              </div>
              <p className="text-gray-400">
                Modern workforce management for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="/updates" className="hover:text-white transition-colors">Updates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} WorkSync. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}