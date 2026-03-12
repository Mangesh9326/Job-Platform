import React from "react";
import { Target, DollarSign, TrendingUp, BarChart2 } from "lucide-react";

const QuickStats = ({ score, value, seniority, demand }) => {
  const getScoreColor = (s) => {
    if (s >= 80) return "bg-green-500";
    if (s >= 50) return "bg-yellow-400";
    return "bg-red-500";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between hover:border-blue-200 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Target size={24} /></div>
          <span className="text-3xl font-black text-gray-900">{score}</span>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-bold mb-2 uppercase tracking-wider">ATS Match Score</p>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${getScoreColor(score)}`} style={{ width: `${score}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between hover:border-green-200 transition-colors">
        <div className="p-3 bg-green-50 rounded-xl text-green-600 w-fit mb-4"><DollarSign size={24} /></div>
        <div>
          <p className="text-sm text-gray-500 font-bold mb-1 uppercase tracking-wider">Estimated Value</p>
          <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between hover:border-purple-200 transition-colors">
        <div className="p-3 bg-purple-50 rounded-xl text-purple-600 w-fit mb-4"><TrendingUp size={24} /></div>
        <div>
          <p className="text-sm text-gray-500 font-bold mb-1 uppercase tracking-wider">Experience Level</p>
          <p className="text-2xl font-black text-gray-900">{seniority}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-between hover:border-orange-200 transition-colors">
        <div className="p-3 bg-orange-50 rounded-xl text-orange-600 w-fit mb-4"><BarChart2 size={24} /></div>
        <div>
          <p className="text-sm text-gray-500 font-bold mb-1 uppercase tracking-wider">Market Demand</p>
          <p className="text-2xl font-black text-gray-900">{demand || "High"}</p>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;