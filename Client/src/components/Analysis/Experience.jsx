import React from "react";
import { motion } from "framer-motion";
import Edit from "./Edit";

const Experience = ({ experience_years, update, variants }) => {
  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
    >
      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 text-orange-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 bi bi-briefcase" fill="currentColor" viewBox="0 0 16 16">
          <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5m1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0M1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">Experience</h3>
      <div className="flex items-baseline gap-2 mt-2">
        <Edit
          value={experience_years}
          placeholder="0"
          onChange={(v) => update("experience_years", v)}
          className="text-5xl font-black text-gray-900 tracking-tighter"
        />
        <span className="text-gray-500 font-medium">Years</span>
      </div>
    </motion.div>
  );
};

export default Experience;