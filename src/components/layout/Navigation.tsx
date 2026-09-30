import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { label: 'Main Menu', path: '/' },
  { label: 'About Me', path: '/about-me' },
  { label: 'My Project', path: '/my-project' },
  { label: 'Social Media', path: '/social-media' },
  { label: 'Academic Journal', path: '/academic-journal' },
  { label: 'Freelance', path: '/freelance' },
];

export function Navigation() {
  const location = useLocation();
  const { addButtonPress } = useGamification();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Don't show nav on landing page and menu page
  if (location.pathname === '/' || location.pathname === '/menu') {
    return null;
  }

  const handleNavClick = () => {
    addButtonPress();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-gothic text-xl md:text-2xl text-white hover:opacity-80 transition-opacity">
            Potesia
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  onClick={addButtonPress}
                  className={`
                    px-4 py-2 text-sm tracking-widest uppercase transition-all duration-200
                    ${isActive(item.path)
                      ? 'text-white'
                      : 'text-white/50 hover:text-white'
                    }
                  `}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile Hamburger Button */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hamburger-icon"
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          )}
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-menu-overlay open"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="mobile-menu-drawer open"
            >
              <div className="flex items-center justify-between p-4 border-b border-amber-500/30">
                <span className="font-gothic text-xl text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-white/10 rounded"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <nav className="p-4">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={handleNavClick}
                      className={`
                        block px-4 py-3 text-lg tracking-widest uppercase transition-all duration-200 border-b border-white/5
                        ${isActive(item.path)
                          ? 'text-amber-400'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
