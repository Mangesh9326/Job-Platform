import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { FileText, Download } from "lucide-react";

// Import our new subcomponents
import UploadSection from "../components/MarketAnalyzer/UploadSection";
import QuickStats from "../components/MarketAnalyzer/QuickStats";
import SkillGapAnalysis from "../components/MarketAnalyzer/SkillGapAnalysis";
import AtsAndCulture from "../components/MarketAnalyzer/AtsAndCulture";
import AiImprovementPlan from "../components/MarketAnalyzer/AiImprovementPlan";

const ResumeMarketAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a resume file first.");

    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    
    try {
      const res = await axios.post("http://localhost:5000/api/analyze-market", formData);
      setResult(res.data);
      setIsAnalyzing(false);
      toast.success("Market analysis complete!");
    } catch (err) {
      toast.error("Analysis failed. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="bottom-right" />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Discover Your <span className="text-indigo-600 px-2 rounded-lg">Market Value</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Upload your resume to get instant, AI-driven feedback on your ATS score, expected salary, missing keywords, and personalized tips to land your dream job.
          </p>
        </div>

        {/* Upload State */}
        {!result && (
          <UploadSection 
            file={file} 
            setFile={setFile} 
            isAnalyzing={isAnalyzing} 
            onUpload={handleUpload} 
          />
        )}

        {/* Results State */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200 gap-4">
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                <FileText className="text-indigo-600" size={20} />
                <span className="font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-xs">{file?.name || "Resume.pdf"}</span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                  <Download size={16} /> Export
                </button>
                <button 
                  onClick={resetAnalysis}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors"
                >
                  Upload New
                </button>
              </div>
            </div>

            {/* Subcomponents Rendering the Data */}
            <QuickStats 
              score={result.ats_score} 
              value={result.market_value} 
              seniority={result.seniority} 
              demand={result.market_demand} 
            />

            <SkillGapAnalysis 
              roles={result.best_roles} 
              strongSkills={result.strong_skills} 
              missingKeywords={result.missing_keywords} 
            />

            <AtsAndCulture 
              formatSuggestions={result.format_ats_suggestions} 
              certifications={result.recommended_certifications} 
              softSkills={result.soft_skills} 
            />

            <AiImprovementPlan 
              improvements={result.improvements} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeMarketAnalyzer;