
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedButton from '../common/AnimatedButton';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Interview Builder', path: '/interview-builder' },
    { name: 'Interview Simulator', path: '/interview-simulator' },
    { name: 'Insights', path: '/insights' },
  ];

  const NavLink = ({ name, path }: { name: string; path: string }) => {
    const isActive = location.pathname === path;
    
    return (
      <Link 
        to={path}
        className={cn(
          "relative px-3 py-2 text-sm font-medium transition-colors duration-300",
          "hover:text-primary",
          isActive 
            ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:content-['']" 
            : "text-foreground/70"
        )}
      >
        {name}
      </Link>
    );
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass shadow-sm py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold gradient-text">InsightFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <NavLink key={link.path} name={link.name} path={link.path} />
          ))}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <AnimatedButton 
            variant="outline" 
            size="sm"
          >
            Sign In
          </AnimatedButton>
          <AnimatedButton size="sm">
            Get Started
          </AnimatedButton>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden rounded-md p-2 text-foreground/70 hover:bg-accent"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute w-full glass shadow-md transition-all duration-300 ease-in-out overflow-hidden",
          mobileMenuOpen ? "max-h-[400px] py-4" : "max-h-0"
        )}
      >
        <div className="container mx-auto px-4 flex flex-col space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "py-2 px-3 rounded-md transition-colors",
                location.pathname === link.path 
                  ? "bg-accent text-primary font-medium"
                  : "text-foreground/70 hover:bg-accent/50"
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <AnimatedButton variant="outline">Sign In</AnimatedButton>
            <AnimatedButton>Get Started</AnimatedButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
