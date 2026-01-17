import React from "react";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import CompanyLogo from "./CompanyLogo";

const cardVars = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

const JobCard = ({ job, onClick }) => {
  return (
    <motion.div
      variants={cardVars}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md flex flex-col justify-between group cursor-pointer relative overflow-hidden h-full"
      onClick={onClick}
    >
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <CompanyLogo name={job.company} />
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full shadow-sm">
            <img
              src="./img/stars.png"
              alt="Match"
              className="w-3 h-3 object-contain"
            />
            <span className="text-sm font-bold text-green-700">
              {job.match}% Match
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
            {job.title}
          </h2>
          <div className="flex items-center gap-2 mt-2 text-gray-500 font-medium text-sm">
            <img src="./img/business-and-trade.png" className="w-3 h-3" alt="" />
            {job.company}
          </div>
        </div>

        <div className="flex flex-wrap gap-y-2 gap-x-4 mt-5 py-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-geo-alt text-blue-500 h-3 w-3" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
              <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
            </svg> {job.location}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-briefcase w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5m1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0M1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5" />
            </svg> {job.domain}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-currency-rupee w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4z" />
            </svg> {job.salary}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {job.skills.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded-md bg-blue-50/50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="px-2 py-1 rounded-md bg-gray-50 text-gray-400 text-[10px] font-bold">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 relative z-10">
        <button className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold shadow-lg group-hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
          View Details <ExternalLink size={16} />
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">
          Posted {job.posted} days ago
        </p>
      </div>
    </motion.div>
  );
};

export default JobCard;