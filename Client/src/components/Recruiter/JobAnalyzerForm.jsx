import React from "react";
import { Search, Loader2 } from "lucide-react";

const JobAnalyzerForm = ({ jobDescription, setJobDescription, onAnalyze, isAnalyzing }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Search size={20} className="text-blue-600" /> Analyze Job Description
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Paste the JD to instantly find the best matching candidates from your database.
      </p>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="e.g. We are looking for a Senior React Developer with experience in Node.js, MongoDB, and AWS..."
        className="w-full h-80 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none text-sm transition-all shadow-inner"
      />

      <button
        onClick={onAnalyze}
        disabled={isAnalyzing || !jobDescription.trim()}
        className="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="animate-spin" size={20} /> Analyzing Skills...
          </>
        ) : (
          "Find Best Candidates"
        )}
      </button>
    </div>
  );
};

export default JobAnalyzerForm;