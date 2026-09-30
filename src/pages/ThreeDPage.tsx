import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { playClick } from '@/lib/audio';
import { ArrowLeft, Box, Cpu, Sparkles, Orbit, Layers, ChevronRight, Zap, Shield, Globe } from 'lucide-react';

export function ThreeDPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    playClick();
    navigate('/my-project');
  };

  return (
    <div className="min-h-screen w-full bg-[#030308] text-white font-sans relative overflow-x-hidden">
      {/* Animated Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBack}
        className="fixed top-6 left-6 z-50 p-3 bg-white/5 backdrop-blur-md border border-cyan-500/30 rounded-full hover:bg-white/10 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-cyan-400" />
      </motion.button>

      {/* Navigation */}
      <nav className="relative z-10 w-full px-6 md:px-16 py-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Dimension<span className="text-cyan-400">X</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#experience" className="hover:text-cyan-400 transition-colors">Experience</a>
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#technology" className="hover:text-cyan-400 transition-colors">Technology</a>
        </div>
        <button className="px-5 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium rounded-lg hover:bg-cyan-500/20 transition-colors">
          Launch App
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-32 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full mb-6">
              <Sparkles className="w-3 h-3" />
              Next-Gen 3D Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Step Into The<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
                Future of Web3D
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
              Build, deploy, and experience immersive 3D worlds directly in the browser. 
              Zero installation. Maximum impact.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2">
                Explore Worlds <ChevronRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-3 bg-white/5 border border-white/10 text-slate-300 font-semibold rounded-xl hover:bg-white/10 transition-colors">
                Documentation
              </button>
            </div>
          </motion.div>

          {/* 3D Container Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square max-w-lg mx-auto relative">
              {/* Glowing border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-30 blur-sm" />
              
              {/* Main 3D container */}
              <div className="relative w-full h-full bg-[#0a0a12] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500" />
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono">3D_VIEWPORT_v2.1</span>
                </div>
                
                {/* 3D Scene Placeholder */}
                <div className="flex-1 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
                  <div className="relative w-48 h-48">
                    <motion.div
                      animate={{ rotateY: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="w-full h-full relative"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Wireframe cube approximation */}
                      <div className="absolute inset-0 border-2 border-cyan-500/40 rounded-lg" />
                      <div className="absolute inset-4 border-2 border-blue-500/40 rounded-lg" />
                      <div className="absolute inset-8 border-2 border-purple-500/40 rounded-lg" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
                    </motion.div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-xs text-slate-600 font-mono">
                    <p>Verts: 12,450</p>
                    <p>FPS: 60</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>WebGL 2.0 • Three.js r160</span>
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 text-sm font-medium uppercase tracking-wider mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Immersion</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Cutting-edge technology stack designed for performance and visual fidelity.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Orbit, title: 'Real-time Rendering', desc: 'GPU-accelerated graphics with 60fps performance guarantee.', gradient: 'from-cyan-500 to-blue-500' },
              { icon: Layers, title: 'Layered Compositing', desc: 'Advanced post-processing effects and multi-layer compositing.', gradient: 'from-blue-500 to-purple-500' },
              { icon: Cpu, title: 'WebGPU Ready', desc: 'Next-generation graphics API support for unprecedented performance.', gradient: 'from-purple-500 to-pink-500' },
              { icon: Zap, title: 'Instant Loading', desc: 'Progressive streaming and intelligent caching for near-zero load times.', gradient: 'from-amber-500 to-orange-500' },
              { icon: Shield, title: 'Secure by Design', desc: 'End-to-end encryption and secure asset delivery pipeline.', gradient: 'from-emerald-500 to-teal-500' },
              { icon: Globe, title: 'Cross-Platform', desc: 'Seamless experience across desktop, mobile, and VR headsets.', gradient: 'from-rose-500 to-red-500' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.07] transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="technology" className="relative z-10 py-24 px-6 md:px-16 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-cyan-400 text-sm font-medium uppercase tracking-wider mb-3">Technology</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Powered by the Latest</h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Our platform leverages cutting-edge web technologies to deliver console-quality 
                3D experiences directly in your browser. No plugins. No compromises.
              </p>
              <div className="space-y-4">
                {[
                  { name: 'Three.js / React Three Fiber', level: 95 },
                  { name: 'WebGL 2.0 & WebGPU', level: 90 },
                  { name: 'GLTF 2.0 & Draco Compression', level: 88 },
                  { name: 'Physically Based Rendering', level: 92 },
                ].map((tech) => (
                  <div key={tech.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-300">{tech.name}</span>
                      <span className="text-sm text-cyan-400">{tech.level}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${tech.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/3] bg-[#0a0a12] rounded-2xl border border-white/10 p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
                <div className="relative grid grid-cols-2 gap-4">
                  {['Three.js', 'WebGPU', 'GLTF', 'PBR', 'HDR', 'Bloom', 'SSAO', 'FXAA'].map((tech, i) => (
                    <motion.div
                      key={tech}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-center text-sm font-mono text-cyan-400 hover:bg-white/10 transition-colors cursor-default"
                    >
                      {tech}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Build<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              The Impossible?
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join the next generation of creators pushing the boundaries of what's possible on the web.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
              Start Building Free
            </button>
            <button className="px-8 py-3 bg-white/5 border border-white/10 text-slate-300 font-semibold rounded-xl hover:bg-white/10 transition-colors">
              View Showcase
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 md:px-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Box className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">Dimension<span className="text-cyan-400">X</span></span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 DimensionX. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Discord</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

