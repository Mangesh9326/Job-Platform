import React from "react";
import { Users, AlertCircle } from "lucide-react";
import CandidateCard from "./CandidateCard";

const CandidateList = ({ candidates, isAnalyzing, hasAnalyzed, onViewResume }) => {
  // Skeleton Loading UI
  if (isAnalyzing) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="flex gap-2 mt-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="w-16 h-16 bg-gray-200 rounded-full hidden sm:block"></div>
          </div>
        ))}
      </div>
    );
  }

  // Found Matches
  if (candidates?.length > 0) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate._id || candidate.id}
            candidate={candidate}
            onViewResume={onViewResume}
          />
        ))}
      </div>
    );
  }

  // Analyzed but no matches
  if (hasAnalyzed) {
    return (
      <div className="bg-white rounded-3xl border border-red-100 p-12 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
        <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Matches Found</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          None of the candidates in your database have the required skills for this role. Try adjusting the job description.
        </p>
      </div>
    );
  }

  // Initial Empty State
  return (
    <div className="bg-white rounded-3xl border border-gray-200 border-dashed p-16 text-center text-gray-400 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <Users size={40} className="text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-gray-700 mb-2">Awaiting Job Description</h3>
      <p className="text-sm max-w-sm">
        Paste a JD on the left and click analyze to let the AI scan your talent pool and find the perfect match.
      </p>
    </div>
  );
};

export default CandidateList;