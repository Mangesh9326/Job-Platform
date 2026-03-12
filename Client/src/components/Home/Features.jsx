import React from "react";
import { Brain, Target, Zap, Layout, Shield, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const featureData = [
  {
    icon: <Brain className="text-blue-400" />,
    title: "Entity Extraction",
    desc: "Automatically isolates skills, years of experience, and job titles from unstructured text."
  },
  {
    icon: <Target className="text-purple-400" />,
    title: "Vector Matching",
    desc: "Uses semantic search to find jobs based on context, not just simple keywords."
  },
  {
    icon: <Zap className="text-orange-400" />,
    title: "Real-time Analysis",
    desc: "Get your results in milliseconds with our high-performance ML inference engine."
  }
];

const Features = () => {
  return (
    <section className="py-24 px-6 bg-gray-900/40 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Text */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold"
          >
            Why Choose Our AI Platform?
          </motion.h2>
          <p className="text-gray-400 mt-6 text-lg">
            We've built the most advanced resume analysis tool to help you bridge the gap 
            between your talent and the right opportunities.
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {featureData.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative p-8 bg-gray-800/30 border border-gray-700/50 rounded-4xl hover:bg-gray-800/60 hover:border-blue-500/40 transition-all duration-300"
            >
              {/* Icon Container */}
              <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-700">
                {React.cloneElement(f.icon, { size: 28 })}
              </div>

              <h3 className="text-xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-gray-400 leading-relaxed italic md:not-italic">
                {f.desc}
              </p>

              {/* Decorative Corner Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;