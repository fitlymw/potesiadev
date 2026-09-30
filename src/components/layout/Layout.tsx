import type { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function Layout({
  children,
  showNav = true,
  showFooter = true,
  className = '',
}: LayoutProps) {
  return (
    <div className={`min-h-screen bg-hound-black ${className}`}>
      {showNav && <Navigation />}
      <main>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
