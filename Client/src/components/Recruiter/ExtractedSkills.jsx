import React from "react";
import { Sparkles } from "lucide-react";

const ExtractedSkills = ({ skills }) => {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-blue-500" /> AI Extracted Skills
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 shadow-sm"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ExtractedSkills;