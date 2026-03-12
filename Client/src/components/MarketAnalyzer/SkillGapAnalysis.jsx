import React from "react";
import { Briefcase, CheckCircle, AlertCircle } from "lucide-react";

const SkillGapAnalysis = ({ roles, strongSkills, missingKeywords }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Briefcase size={20} className="text-indigo-500" /> Top Matched Roles
        </h3>
        <div className="space-y-3">
          {roles.map((role, idx) => (
            <div key={idx} className="group flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-white transition-all cursor-default">
              <span className="font-bold text-gray-800 text-sm group-hover:text-indigo-700 transition-colors">{role.title}</span>
              <span className="text-xs font-black text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                {role.match}% Match
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <CheckCircle size={18} className="text-green-500" /> Strong Skills Identified
          </h3>
          <div className="flex flex-wrap gap-2">
            {strongSkills.map((skill, idx) => (
              <span key={idx} className="bg-white text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <AlertCircle size={18} className="text-red-500" /> High-Value Missing Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((skill, idx) => (
              <span key={idx} className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-100 shadow-sm">
                + {skill}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 leading-relaxed font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
            💡 <span className="text-gray-700 font-bold">Pro Tip:</span> Adding these keywords based on current market demand can significantly increase your ATS visibility.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalysis;