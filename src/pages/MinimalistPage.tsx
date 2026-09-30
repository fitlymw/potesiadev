import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { playClick } from '@/lib/audio';
import { ArrowLeft, Camera, Building2, PenTool, Users, Mail, MapPin, Phone } from 'lucide-react';

export function MinimalistPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    playClick();
    navigate('/my-project');
  };

  return (
    <div className="min-h-screen w-full bg-[#fafaf9] text-[#1c1917] font-sans relative overflow-x-hidden">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBack}
        className="fixed top-6 left-6 z-50 p-3 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <ArrowLeft className="w-5 h-5 text-stone-700" />
      </motion.button>

      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col justify-center px-6 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="text-stone-500 text-sm tracking-[0.3em] uppercase mb-6">Architecture & Design Studio</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-stone-900 leading-[1.1] mb-8">
            Aura<br />Studio
          </h1>
          <p className="max-w-xl text-stone-600 text-lg md:text-xl leading-relaxed">
            We craft spaces that breathe. Minimalist architecture meets timeless elegance — 
            where every line serves a purpose and every material tells a story.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-16 flex items-center gap-8"
        >
          <div className="w-24 h-[1px] bg-stone-300" />
          <span className="text-stone-400 text-sm tracking-widest uppercase">Scroll to explore</span>
        </motion.div>
      </section>

      {/* Featured Project */}
      <section className="py-24 px-6 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center"
        >
          <div className="aspect-[4/5] bg-stone-200 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"
              alt="Minimalist Interior"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div>
            <p className="text-stone-400 text-sm tracking-[0.2em] uppercase mb-4">Featured Project</p>
            <h2 className="text-3xl md:text-4xl font-light text-stone-900 mb-6">The Silent House</h2>
            <p className="text-stone-600 leading-relaxed mb-8">
              A residential sanctuary nestled in the Kyoto hills. Designed around the principles 
              of ma — the meaningful pause between elements. Natural light becomes the primary 
              material, shifting across textured concrete walls throughout the day.
            </p>
            <div className="flex gap-8 text-sm text-stone-500">
              <div>
                <p className="font-medium text-stone-900">Location</p>
                <p>Kyoto, Japan</p>
              </div>
              <div>
                <p className="font-medium text-stone-900">Year</p>
                <p>2024</p>
              </div>
              <div>
                <p className="font-medium text-stone-900">Area</p>
                <p>340 m²</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-6 md:px-16 lg:px-24 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-stone-400 text-sm tracking-[0.2em] uppercase mb-12 text-center">Our Expertise</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Building2, title: 'Architecture', desc: 'Residential and commercial spaces designed with intentional simplicity.' },
              { icon: PenTool, title: 'Interior Design', desc: 'Curated environments where materiality and light create atmosphere.' },
              { icon: Camera, title: 'Spatial Photography', desc: 'Visual storytelling that captures the essence of designed spaces.' },
            ].map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="text-center group"
              >
                <service.icon className="w-8 h-8 text-stone-400 mx-auto mb-6 group-hover:text-stone-700 transition-colors" />
                <h3 className="text-xl font-light text-stone-900 mb-3">{service.title}</h3>
                <p className="text-stone-500 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Philosophy Quote */}
      <section className="py-32 px-6 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto text-center"
        >
          <blockquote className="text-2xl md:text-4xl font-light text-stone-800 leading-relaxed italic">
            "Perfection is achieved not when there is nothing more to add, 
            but when there is nothing left to take away."
          </blockquote>
          <p className="mt-8 text-stone-500 tracking-widest uppercase text-sm">— Antoine de Saint-Exupéry</p>
        </motion.div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-24 px-6 md:px-16 lg:px-24 bg-stone-100">
        <p className="text-stone-400 text-sm tracking-[0.2em] uppercase mb-12 text-center">Selected Works</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', title: 'Glass Pavilion', loc: 'Oslo, Norway' },
            { img: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80', title: 'Concrete Retreat', loc: 'Tulum, Mexico' },
            { img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80', title: 'Timber House', loc: 'Copenhagen, Denmark' },
          ].map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] bg-stone-200 overflow-hidden mb-4">
                <img
                  src={project.img}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="text-lg font-light text-stone-900">{project.title}</h3>
              <p className="text-stone-500 text-sm">{project.loc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 px-6 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-stone-400 text-sm tracking-[0.2em] uppercase mb-6">Get in Touch</p>
          <h2 className="text-3xl md:text-4xl font-light text-stone-900 mb-12">Let's Create Together</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-stone-600">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <span>hello@aurastudio.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <span>+81 90 1234 5678</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" />
              <span>Kyoto, Japan</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-16 lg:px-24 border-t border-stone-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-stone-400 text-sm">© 2024 Aura Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <Users className="w-5 h-5 text-stone-400 hover:text-stone-700 cursor-pointer transition-colors" />
            <Camera className="w-5 h-5 text-stone-400 hover:text-stone-700 cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}

