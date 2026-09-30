import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { playClick } from '@/lib/audio';
import { ArrowLeft, BarChart3, Globe, Shield, Zap, Users, CheckCircle, ChevronRight, Mail, Phone, MapPin } from 'lucide-react';

export function ModernPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    playClick();
    navigate('/my-project');
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 font-sans relative overflow-x-hidden">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBack}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <ArrowLeft className="w-5 h-5 text-slate-700" />
      </motion.button>

      {/* Navigation Bar */}
      <nav className="w-full px-6 md:px-16 py-6 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-slate-900">NexaCorp</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          <a href="#stats" className="hover:text-blue-600 transition-colors">Results</a>
          <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
        </div>
        <button className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 opacity-70" />
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Trusted by 500+ Enterprises
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Scale Your Business<br />With Confidence
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
              Enterprise-grade solutions designed to streamline operations, 
              boost productivity, and drive measurable growth for modern organizations.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25">
                Start Free Trial
              </button>
              <button className="px-8 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-blue-300 transition-colors flex items-center gap-2">
                Watch Demo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p>Join 10,000+ satisfied customers</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square max-w-lg mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-slate-500">Revenue Growth</p>
                    <p className="text-2xl font-bold text-slate-900">+142%</p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">+12.5%</div>
                </div>
                <div className="h-32 flex items-end gap-2">
                  {[40, 55, 45, 70, 60, 85, 75, 95, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-500 rounded-t-sm" style={{ height: `${h}%`, opacity: 0.5 + (i * 0.05) }} />
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-lg font-bold text-slate-900">2.4k</p>
                    <p className="text-xs text-slate-500">Users</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-lg font-bold text-slate-900">98%</p>
                    <p className="text-xs text-slate-500">Uptime</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-lg font-bold text-slate-900">4.9</p>
                    <p className="text-xs text-slate-500">Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logos */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6 md:px-16">
          <p className="text-center text-sm text-slate-400 mb-8">Trusted by industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50">
            {['Acme Corp', 'Globex', 'Hooli', 'Initech', 'Massive'].map((name) => (
              <span key={name} className="text-lg font-semibold text-slate-600">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-24 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Solutions</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Comprehensive tools and services designed to address every aspect of your business growth.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time insights and comprehensive reporting tools for data-driven decisions.', color: 'bg-blue-100 text-blue-600' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption and compliance standards to protect your sensitive data.', color: 'bg-emerald-100 text-emerald-600' },
              { icon: Globe, title: 'Global CDN', desc: 'Lightning-fast content delivery across 200+ edge locations worldwide.', color: 'bg-purple-100 text-purple-600' },
              { icon: Zap, title: 'Automation', desc: 'Streamline workflows and eliminate repetitive tasks with intelligent automation.', color: 'bg-amber-100 text-amber-600' },
              { icon: Users, title: 'Team Collaboration', desc: 'Unified workspace for seamless communication and project management.', color: 'bg-rose-100 text-rose-600' },
              { icon: CheckCircle, title: '24/7 Support', desc: 'Dedicated customer success team available around the clock.', color: 'bg-cyan-100 text-cyan-600' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-24 px-6 md:px-16 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '$2.4B+', label: 'Transactions Processed' },
              { value: '99.99%', label: 'Uptime Guarantee' },
              { value: '500+', label: 'Enterprise Clients' },
              { value: '150+', label: 'Countries Served' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">Join thousands of companies already using NexaCorp to drive growth and innovation.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
              Start Free Trial
            </button>
            <button className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors border border-blue-500">
              Contact Sales
            </button>
          </div>
        </motion.div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6 md:px-16 bg-slate-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Contact</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Let's Start a Conversation</h2>
            <p className="text-slate-600 leading-relaxed mb-8">Our team is ready to help you find the perfect solution for your business needs.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-700">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>contact@nexacorp.com</span>
              </div>
              <div className="flex items-center gap-4 text-slate-700">
                <Phone className="w-5 h-5 text-blue-600" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-4 text-slate-700">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>San Francisco, CA 94105</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" className="px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                <input type="text" placeholder="Last Name" className="px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              </div>
              <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              <textarea placeholder="How can we help?" rows={4} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none" />
              <button className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-16 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">NexaCorp</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 NexaCorp. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

