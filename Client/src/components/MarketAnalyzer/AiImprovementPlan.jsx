import React from "react";
import { Zap, ChevronRight } from "lucide-react";

const AiImprovementPlan = ({ improvements }) => {
  return (
    <div className="bg-[#0f172a] relative overflow-hidden p-6 sm:p-10 rounded-3xl shadow-xl text-white border border-gray-800">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      <div className="relative z-10">
        <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
          <Zap className="text-yellow-400" size={28} /> Content Improvement
        </h3>
        <p className="text-gray-400 font-medium mb-8">Implement these tailored suggestions to strengthen the impact of your experience.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {improvements.map((tip, idx) => (
            <div key={idx} className="bg-white/5 p-5 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-500/20 p-1.5 rounded-lg mt-0.5 shrink-0">
                  <ChevronRight className="text-indigo-300" size={16} />
                </div>
                <p className="text-gray-200 text-sm leading-relaxed font-medium">{tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiImprovementPlan;