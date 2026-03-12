import React from "react";
import { MapPin, Briefcase, FileText } from "lucide-react";

// Reusable SVG Match Score Ring
const MatchScore = ({ score }) => {
  let strokeColor = "text-red-400";
  if (score >= 40) strokeColor = "text-yellow-400";
  if (score >= 70) strokeColor = "text-green-500";

  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
        <circle 
          cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" 
          strokeDasharray={213.6} 
          strokeDashoffset={213.6 - (213.6 * score) / 100} 
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-900">
        <span className="text-lg font-bold">{score}%</span>
      </div>
    </div>
  );
};

// ADD onViewResume to props
const CandidateCard = ({ candidate, onViewResume }) => { 
  const currentRole = candidate.experiences?.length > 0 
    ? candidate.experiences[0].role 
    : candidate.domains?.[0]?.name || "Software Professional";

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6 items-start">
      
      {/* 1. Profile Info & Score */}
      <div className="flex items-center gap-4 w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-100 pb-4 sm:pb-0 sm:pr-4">
        <img 
            src={candidate.profilePic || `https://ui-avatars.com/api/?name=${candidate.fullName}&background=random`} 
            alt={candidate.fullName} 
            className="w-16 h-16 rounded-full object-cover shadow-sm"
        />
        <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">{candidate.fullName}</h3>
            <p className="text-sm font-medium text-blue-600 mb-1 line-clamp-1">{currentRole}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={12}/> {candidate.location || "Remote"}</span>
                <span className="flex items-center gap-1"><Briefcase size={12}/> {candidate.totalExperience || "0 Yrs"}</span>
            </div>
        </div>
      </div>

      {/* 2. Skills Breakdown & Action Button */}
      <div className="flex-1 w-full flex flex-col justify-between">
         <div className="flex justify-between items-start">
            <div className="space-y-3 flex-1">
                {/* Matched Skills */}
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Matched Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                        {candidate.matchedSkills?.length > 0 ? (
                            candidate.matchedSkills.map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded text-xs font-semibold">
                                    {skill}
                                </span>
                            ))
                        ) : <span className="text-xs text-gray-400 italic">No exact matches</span>}
                    </div>
                </div>

                {/* Missing Skills */}
                {candidate.missingSkills?.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Missing Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                            {candidate.missingSkills.map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-xs font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* The Score Ring */}
            <div className="flex flex-col items-center ml-4">
                <MatchScore score={candidate.matchScore} />
                
                {/* ✅ THE NEW VIEW RESUME BUTTON */}
                <button 
                    onClick={() => onViewResume(candidate)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-colors px-3 py-1.5 rounded-full"
                >
                    <FileText size={14} /> View Resume
                </button>
            </div>
         </div>
      </div>

    </div>
  );
};

export default CandidateCard;