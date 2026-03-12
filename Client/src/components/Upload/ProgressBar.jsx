import React from "react";
import { motion } from "framer-motion";

const ProgressBar = ({ visualProgress }) => {
  const getStatus = () => {
    if (visualProgress < 30) return "Uploading to Secure Server...";
    if (visualProgress < 70) return "Extracting Resume Entities...";
    if (visualProgress < 95) return "Extracting Resume Entities...";
    return "Finalizing Results...";
  };

  return (
    <div className="h-full flex flex-col justify-center items-center p-8">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-widest animate-pulse">
            {getStatus()}
          </span>
          <span className="text-lg font-black text-gray-800">{visualProgress}%</span>
        </div>
        
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner border border-gray-200">
          <motion.div
            className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${visualProgress}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          >
             {/* Striped Animation overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-size-[20px_20px] animate-[move_1s_linear_infinite]" />
          </motion.div>
        </div>
        
        <p className="text-center text-gray-400 text-xs mt-6">
          Please do not close this window while we process your data.
        </p>
      </motion.div>
    </div>
  );
};
export default ProgressBar;