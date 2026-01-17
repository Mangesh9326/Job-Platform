import React, { useState, useEffect } from "react";
import { Menu, X, User, LogOut, Briefcase, ChevronDown, FileText, Search, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Listen for scroll to change background opacity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Nav Links Array - All original routes preserved
  const navLinks = [
    { name: "Home", href: "/", icon: null },
    { name: "Upload Resume", href: "/upload", icon: null },
    { name: "Analysis", href: "/analysis", icon: null },
    { name: "Jobs", href: "/jobs", icon: null },
    { name: "About", href: "/about", icon: null },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-100 transition-all duration-500 ${
        scrolled 
          ? "py-3 bg-gray-950/90 backdrop-blur-xl border-b border-white/10 shadow-2xl" 
          : "py-3 bg-[#121620]"
      }`}
    >
      <motion.div
              className="fixed top-0 left-0 right-0 h-0.5 bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 origin-left z-50"
              style={{ scaleX }}
            />
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-600/30">
            <Briefcase size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-white">
            Smart<span className="text-blue-500">Resume</span>
          </span>
        </a>

        {/* DESKTOP MENU (Large Screens) */}
        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="relative text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-300 group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}

          {/* Login / Profile logic */}
          {!user ? (
            <a
              href="/login"
              className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-2.5 rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              Login
            </a>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-gray-800/50 border border-gray-700 hover:border-blue-500 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <span className="text-sm font-medium text-white">{user.username}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-4 w-48 bg-gray-900 border border-white/10 shadow-2xl rounded-2xl p-2 overflow-hidden"
                  >
                    <a href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition">
                       Profile
                    </a>
                    <a href="/saved-jobs" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition">
                       Saved Jobs
                    </a>
                    <div className="h-px bg-white/5 my-1" />
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition font-medium"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* MOBILE & TABLET HAMBURGER */}
        <button 
          className="lg:hidden p-2.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white active:scale-95 transition-transform" 
          onClick={toggleMenu}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* MOBILE SLIDE-IN MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Overlay Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[-1] lg:hidden"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[80%] max-w-sm h-full bg-gray-950 border-l border-white/10 z-101 p-8 lg:hidden shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <span className="font-bold text-xl text-white">Navigation</span>
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X size={28} /></button>
                </div>

                <div className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <a 
                      key={link.name} 
                      href={link.href} 
                      className="text-2xl font-bold text-gray-400 hover:text-white py-2 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-white/10">
                  {user ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-white">{user.username}</p>
                          <a href="/profile" className="text-sm text-blue-400 underline" onClick={() => setIsOpen(false)}>View Account</a>
                        </div>
                      </div>
                      <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-500 py-4 rounded-2xl font-bold border border-red-500/20"
                      >
                        <LogOut size={20} /> Logout
                      </button>
                    </div>
                  ) : (
                    <a
                      href="/login"
                      className="block w-full text-center bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20"
                    >
                      Login to Portal
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;