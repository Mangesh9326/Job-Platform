import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const JobDescription = ({ job }) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm space-y-8"
    >
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-600 rounded-full" /> About the Role
        </h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
          {job.description}
        </p>
      </section>

      {job.responsibilities && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Responsibilities</h2>
          <ul className="space-y-3">
            {job.responsibilities.map((res, i) => (
              <li key={i} className="flex gap-3 text-gray-600">
                <CheckCircle2 className="text-blue-500 shrink-0 mt-1" size={18} />
                <span className="leading-relaxed">{res}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {job.requirements && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
          <ul className="space-y-3">
            {job.requirements.map((req, i) => (
              <li key={i} className="flex gap-3 text-gray-600">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2.5 shrink-0" />
                <span className="leading-relaxed">{req}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </motion.div>
  );
};

export default JobDescription;