import React from "react";
import { FileCheck, Layout, Award, Users } from "lucide-react";

const AtsAndCulture = ({ formatSuggestions, certifications, softSkills }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileCheck size={24} className="text-blue-500" /> ATS & Formatting Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(formatSuggestions || []).map((suggestion, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
              <div className="bg-blue-100 p-1.5 rounded-full text-blue-600 shrink-0 mt-0.5">
                <Layout size={16} />
              </div>
              <p className="text-gray-700 text-sm font-medium leading-relaxed">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={20} className="text-yellow-500" /> Recommended Certifications
          </h3>
          <ul className="space-y-3">
            {(certifications || []).map((cert, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-gray-700 bg-yellow-50/50 p-3 rounded-xl border border-yellow-100">
                <div className="h-2 w-2 bg-yellow-400 rounded-full"></div> {cert}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-teal-500" /> Soft Skills & Cultural Fit
          </h3>
          <div className="flex flex-wrap gap-2">
            {(softSkills || []).map((skill, idx) => (
              <span key={idx} className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-teal-100 shadow-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtsAndCulture;