import React from "react";
import { Upload, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import HeroImage from "../../assets/img/react.png";

const Hero = () => {
  return (
    <section className="relative pt-20 pb-16 md:pt-40 md:pb-32 px-6 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">

        {/* Left Side: Text Content */}
        <motion.div
          className="flex-1 text-center md:text-left z-10"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Sparkles size={14} />
            <span>Next-Gen Job Matching</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Build Your Future with <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400">
              AI Intelligence
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
            Upload your resume and let our Machine Learning engine extract your top skills,
            optimize your profile, and find matches you actually care about.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              href="/upload"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all"
            >
              <Upload size={20} />
              Upload Resume
            </motion.a>

            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold border border-gray-700 hover:bg-gray-800 transition-all text-gray-300"
            >
              <Play size={18} />
              See How It Works
            </motion.button> */}
          </div>
        </motion.div>

        {/* Right Side: Visual Content */}
        <motion.div
          className="flex-1 w-full max-w-[500px] md:max-w-none relative"
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Floating Card Effect */}
          <div className="absolute -inset-4 bg-linear-to-tr from-blue-500/20 to-purple-500/20 rounded-4xl blur-3xl animate-pulse" />
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <img
              src={HeroImage}
              alt="AI Analytics Dashboard"
              className="w-11/12 h-auto drop-shadow-2xl rounded-2xl mx-auto"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;