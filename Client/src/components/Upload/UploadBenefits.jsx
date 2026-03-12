import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const UploadBenefits = () => {
  const benefits = [
    { title: "ATS Compatibility Check", desc: "Ensure your resume passes the bot filters." },
    { title: "Skill Gap Analysis", desc: "Identify missing skills for your dream role." },
    { title: "Format Optimization", desc: "Get suggestions on layout and readability." },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-gray-900 font-bold text-lg mb-4">What you'll get:</h3>
      {benefits.map((benefit, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="mt-1 text-green-500 bg-green-50 p-1 rounded-full">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">{benefit.title}</h4>
            <p className="text-xs text-gray-500 mt-1">{benefit.desc}</p>
          </div>
        </motion.div>
      ))}
      
      {/* Mini privacy note */}
      <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-700 leading-relaxed">
        <strong>Privacy Note:</strong> Your resume is processed ephemerally. We do not store your personal data for training purposes without consent.
      </div>
    </div>
  );
};

export default UploadBenefits;