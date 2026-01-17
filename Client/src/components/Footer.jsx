import React from "react";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Mail,
  ArrowRight,
  Briefcase
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const socialLinks = [
    { icon: <Facebook size={20} />, href: "#", color: "hover:text-blue-500" },
    { icon: <Twitter size={20} />, href: "#", color: "hover:text-sky-400" },
    { icon: <Linkedin size={20} />, href: "#", color: "hover:text-blue-700" },
    { icon: <Github size={20} />, href: "#", color: "hover:text-white" },
  ];

  return (
    <footer className="relative bg-gray-950 text-gray-400 pt-20 pb-10 border-t border-white/5 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
      
      <motion.div 
        className="max-w-full mx-auto px-10 relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Newsletter */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-2 group max-w-fit ">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Briefcase size={18} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tighter">
                Smart<span className="text-blue-500">Resume</span>
              </h2>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Empowering careers through advanced Machine Learning. Extract, analyze, and match your potential with the right opportunities.
            </p>
            
            {/* Newsletter Input */}
            <div className="pt-2">
              <p className="text-white text-sm font-semibold mb-3">Subscribe to our newsletter</p>
              <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl p-1 focus-within:border-blue-500/50 transition-all">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-transparent border-none outline-none focus:ring-0 text-sm px-3 w-full"
                />
                <button className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg text-white transition-colors">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-bold mb-6 tracking-wide">Quick Links</h3>
            <ul className="space-y-4">
              {["Home", "Upload Resume", "Analysis", "Jobs", "About"].map((item) => (
                <li key={item}>
                  <motion.a
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    whileHover={{ x: 5 }}
                    className="text-sm hover:text-blue-400 transition-colors inline-block"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Product Features */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-bold mb-6 tracking-wide">Platform</h3>
            <ul className="space-y-4">
              {[
                "AI Resume Parsing",
                "Job Matching Engine",
                "Smart Suggestions",
                "ML Ranking Models",
                "API for Developers"
              ].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    whileHover={{ x: 5 }}
                    className="text-sm hover:text-blue-400 transition-colors inline-block"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Socials */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-bold mb-6 tracking-wide">Get in Touch</h3>
            <div className="space-y-4 mb-8">
              <a href="mailto:support@smartresume.ai" className="flex items-center gap-3 text-sm hover:text-white transition-colors">
                <Mail size={18} className="text-blue-500" />
                support@smartresume.ai
              </a>
            </div>
            <div className="flex gap-4">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center transition-all ${social.color} hover:border-current hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest text-gray-500">
          <p>© {currentYear} SmartResume AI. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
