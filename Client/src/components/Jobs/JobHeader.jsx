import React from "react";
import { motion } from "framer-motion";
import { 
  MapPin, Briefcase, DollarSign, Share2, Bookmark, Clock, Building2 
} from "lucide-react";

// Helper: Dynamic Logo
const CompanyLogo = ({ name }) => {
  const initials = name ? name.slice(0, 2).toUpperCase() : "JP";
  const colors = ["bg-blue-600", "bg-purple-600", "bg-emerald-600", "bg-orange-600", "bg-indigo-600"];
  const colorClass = colors[(name?.length || 0) % colors.length];

  return (
    <div className={`w-16 h-16 ${colorClass} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-900/10`}>
      {initials}
    </div>
  );
};

// Helper: Badge
const Badge = ({ icon: Icon, text, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    green: "bg-green-50 text-green-700 border-green-100",
    gray: "bg-gray-50 text-gray-600 border-gray-200"
  };
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm ${colors[color]}`}>
      <Icon size={16} /> {text}
    </div>
  );
};

const JobHeader = ({ job, saved, onSave }) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 flex gap-3">
        <button className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
          <Share2 size={20} />
        </button>
        <button 
          onClick={onSave}
          className={`p-3 rounded-full transition-all duration-300 ${
            saved 
              ? 'bg-pink-50 text-pink-500 scale-110 shadow-inner' 
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
        >
          <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <CompanyLogo name={job.company} />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{job.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-lg text-gray-500 font-medium">
            <Building2 size={18} /> {job.company}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-gray-100">
        <Badge icon={MapPin} text={job.location} color="blue" />
        <Badge icon={Briefcase} text={job.seniority || "Full Time"} color="purple" />
        <Badge icon={DollarSign} text={job.salary_range || "Competitive"} color="green" />
        <Badge icon={Clock} text="Posted 2 days ago" color="gray" />
      </div>
    </motion.div>
  );
};

export default JobHeader;