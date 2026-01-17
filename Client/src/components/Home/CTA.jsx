import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto relative group"
      >
        {/* The "Border Beam" Effect - A subtle gradient border */}
        <div className="absolute -inset-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent rounded-[2.5rem] blur-sm group-hover:via-blue-400 transition-all duration-500" />

        <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-10 md:p-20 text-center shadow-2xl overflow-hidden">
          
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-blue-400 text-sm font-medium mb-8"
            >
              <Sparkles size={16} />
              <span>Available for Beta Access</span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Ready to land your <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-cyan-300 to-indigo-400">
                Next Dream Role?
              </span>
            </h2>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Our AI doesn't just scan resumes—it understands your potential. Get matched with jobs that actually fit your skill set.
            </p>

            <div className="flex flex-col items-center gap-6">
              <motion.a
                href="/upload"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-3 bg-white text-black px-12 py-5 rounded-2xl text-xl font-bold transition-all"
              >
                Analyze Your Resume Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
              </motion.a>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 text-sm text-gray-500 mt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500/70" />
                  <span>Privacy Focused</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>100+ Jobs Added Daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;