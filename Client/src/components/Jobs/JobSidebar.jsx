import React from "react";
import { motion } from "framer-motion";
import { Zap, ExternalLink, Bookmark, CheckCircle2, XCircle } from "lucide-react";

// Helper: Match Score Ring
const MatchScore = ({ score }) => {
  // Determine color based on score
  let strokeColor = "text-red-400";
  if(score > 40) strokeColor = "text-yellow-400";
  if(score > 70) strokeColor = "text-green-400";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700/20" />
        <circle 
          cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
          strokeDasharray={251.2} 
          strokeDashoffset={251.2 - (251.2 * score) / 100} 
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-xl font-bold">{score}%</span>
        <span className="text-[10px] uppercase font-bold text-gray-400">Match</span>
      </div>
    </div>
  );
};

const JobSidebar = ({ job, saved, onSave, onApply, matchScore, matchedSkills = [], missingSkills = [] }) => {
  return (
    <div className="space-y-6">
      
      {/* AI Insights Card */}
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-gray-700"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative z-10 flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Zap size={18} className="text-yellow-400 fill-yellow-400" /> AI Insights
            </h3>
            <p className="text-gray-400 text-xs mt-1">Based on your skills</p>
          </div>
          <MatchScore score={matchScore} />
        </div>

        <div className="space-y-3 relative z-10">
          
          {/* Matched Skills */}
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5">
            <p className="text-xs text-green-300 uppercase font-bold mb-2 flex items-center gap-1">
               <CheckCircle2 size={12}/> Matched Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.length > 0 ? (
                  matchedSkills.map((s,i) => (
                    <span key={i} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/20">
                        {s}
                    </span>
                  ))
              ) : (
                  <span className="text-xs text-gray-400 italic">No direct matches found.</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5">
            <p className="text-xs text-red-300 uppercase font-bold mb-2 flex items-center gap-1">
                <XCircle size={12}/> Missing Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {missingSkills.length > 0 ? (
                  missingSkills.map((s,i) => (
                    <span key={i} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded border border-red-500/20">
                        {s}
                    </span>
                  ))
              ) : (
                  <span className="text-xs text-green-400 italic">You match everything! 🎉</span>
              )}
            </div>
          </div>

        </div>
      </motion.div>

      {/* Apply Card (Sticky) */}
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg shadow-gray-200/50 sticky top-28"
      >
        <h3 className="font-bold text-gray-900 text-lg mb-4">Interested?</h3>
        <button 
          onClick={onApply}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 group"
        >
          Apply Now <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform"/>
        </button>
        
        <button 
          onClick={onSave}
          className="w-full mt-3 py-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {saved ? <Bookmark size={18} fill="currentColor" /> : <Bookmark size={18} />}
          {saved ? "Saved to Profile" : "Save for Later"}
        </button>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-900 mb-3">Tech Stack Required</h4>
          <div className="flex flex-wrap gap-2">
            {job.skills_required?.map((skill, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-100 hover:border-blue-200 hover:text-blue-600 transition-colors cursor-default">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JobSidebar;