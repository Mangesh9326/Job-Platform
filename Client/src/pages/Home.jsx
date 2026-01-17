import React, { useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Hero from "../components/Home/Hero";
import Features from "../components/Home/Features";
import CTA from "../components/Home/CTA";

const Home = () => {

  return (
    <div className="bg-[#030712] text-white min-h-screen relative selection:bg-blue-500/30 pb-10">
      
      {/* 3. Global Ambient Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top Right Glow */}
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        
        {/* Bottom Left Glow */}
        <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* 4. Main Content Container */}
      <main className="relative z-10">
        {/* Hero Section - No extra wrapper needed as Hero has internal constraints */}
        <Hero />

        {/* Separator / Divider - Subtle Fade */}
        <div className="w-full h-px bg-linear-to-r from-transparent via-gray-800 to-transparent mx-auto max-w-7xl" />

        {/* Features Section */}
        <section className="relative">
           <Features />
        </section>

        {/* CTA Section */}
        <section >
          <CTA />
        </section>
      </main>
    </div>
  );
};

export default Home;