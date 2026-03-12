import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, FileText, Copy, X } from "lucide-react"; // Added new icons
import { toast, Toaster } from "react-hot-toast";
import { extractSkillsFromJD } from "../services/jobAiService";
import { rankCandidates } from "../utils/matchingAlgorithm"; 

// Modular Components
import JobAnalyzerForm from "../components/Recruiter/JobAnalyzerForm";
import ExtractedSkills from "../components/Recruiter/ExtractedSkills";
import CandidateList from "../components/Recruiter/CandidateList";
import ResumeModal from "../components/Recruiter/ResumeModal";

// --- SAMPLE DATA FOR TESTING ---
const SAMPLE_JDS = [
  {
    title: "Generative AI / LLM Engineer",
    text: "Role: Senior GenAI Engineer\nWe are looking for an experienced AI Engineer to lead the development of our enterprise AI assistants. You will be responsible for building robust RAG (Retrieval-Augmented Generation) pipelines and deploying open-source models.\n\nRequirements:\nStrong proficiency in Python and developing AI applications.\nHands-on experience with orchestration frameworks like LangChain or LlamaIndex.\nExperience fine-tuning and deploying models using Hugging Face.\nFamiliarity with vector databases such as Pinecone, Milvus, or ChromaDB.\nExperience exposing AI models via APIs using FastAPI.\n Nice to have: Experience with TypeScript for frontend integration."
  },
  {
    title: "Full Stack Developer",
    text: "Role: Lead Full Stack Developer\nJoin our core product team to build scalable web applications used by millions of users. You will be working across the entire stack, from database design to UI implementation.\n\nKey Skills:\nDeep expertise in JavaScript and TypeScript.\nExtensive experience building user interfaces with React and Next.js.\nStrong backend skills using Node.js and Express.\nExperience writing complex queries in SQL or PostgreSQL.\nFamiliarity with modern CSS frameworks like Tailwind CSS.\nExperience managing NoSQL databases like MongoDB is a plus."
  },
  {
    title: "Data & MLOps Engineer",
    text: "Role: Data & MLOps Engineer\nWe need a data expert to bridge the gap between our data science and software engineering teams. You will build data pipelines and automate the deployment of machine learning models.\n\nRequirements:\nExcellent programming skills in Python and SQL.\nExperience with big data processing using Apache Spark or Scala.\nHands-on experience scheduling workflows with Airflow.\nKnowledge of modern data warehouses like Snowflake or BigQuery.\nExperience containerizing applications using Docker and orchestrating with Kubernetes.\nFamiliarity with model tracking tools like MLflow is highly preferred."
  }
];

const RecruiterDashboard = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // State for our new Test Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllProfiles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/profile/all");
        setAllProfiles(res.data);
      } catch (err) {
        console.error("Failed to load profiles", err);
      }
    };
    fetchAllProfiles();
  }, []);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      return toast.error("Please enter a job description.");
    }

    setIsAnalyzing(true);
    setHasAnalyzed(false);
    setRankedCandidates([]);
    setExtractedSkills([]);

    let requiredSkills = await extractSkillsFromJD(jobDescription);

    if (
      !requiredSkills ||
      !Array.isArray(requiredSkills) ||
      requiredSkills.length === 0
    ) {
      toast.error("Could not extract technical skills from this JD.");
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      return;
    }

    setExtractedSkills(requiredSkills);

    const ranked = rankCandidates(requiredSkills, allProfiles);
    setRankedCandidates(ranked || []);

    setIsAnalyzing(false);
    setHasAnalyzed(true);
    toast.success("Analysis complete!");
  };

  const handleUseSampleJD = (jd) => {
    navigator.clipboard.writeText(jd.text);
    setJobDescription(jd.text); // Auto-fill the form!
    setIsTestModalOpen(false);
    toast.success(`${jd.title} copied & pasted!`);
  };

  return (
    <div className="min-h-screen bg-[#e9edf1] pt-22 pb-12 px-4 sm:px-6 lg:px-8 relative">
      <Toaster position="bottom-right" />

      <div className="mx-auto lg:w-[85%] w-full grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Column (Job Form & Skills) */}
        <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-38 lg:h-[calc(100vh-7rem)] overflow-y-auto pb-4 scrollbar-hide">
          <div className="shrink-0">
            <JobAnalyzerForm
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
          </div>

          <div className="flex-1">
            <ExtractedSkills skills={extractedSkills} />
          </div>
        </div>

        {/* Right Column: Matched Candidates */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 p-4 rounded-2xl gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={22} className="text-gray-700" /> Match Results
            </h2>
            {rankedCandidates?.length > 0 && (
              <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm w-fit">
                Found {rankedCandidates.length} Candidates
              </span>
            )}
          </div>

          <CandidateList
            candidates={rankedCandidates}
            isAnalyzing={isAnalyzing}
            hasAnalyzed={hasAnalyzed}
            onViewResume={setSelectedCandidate}
          />
        </div>
      </div>

      {selectedCandidate && (
        <ResumeModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {/* ========================================= */}
      {/* 🚀 FLOATING TEST BUTTON & MODAL            */}
      {/* ========================================= */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsTestModalOpen(!isTestModalOpen)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 hover:shadow-2xl transition-all font-semibold"
        >
          <FileText size={20} />
          <span className="hidden sm:inline">Test with Sample JDs</span>
          <span className="sm:hidden">Test JDs</span>
        </button>

        {/* Popover Modal */}
        {isTestModalOpen && (
          <div className="absolute bottom-16 left-0 w-[calc(100vw-3rem)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 mb-2 animate-in slide-in-from-bottom-4 fade-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText size={16} className="text-indigo-600" /> Choose a Sample
              </h3>
              <button 
                onClick={() => setIsTestModalOpen(false)} 
                className="text-gray-400 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {SAMPLE_JDS.map((jd, idx) => (
                <div key={idx} className="p-3 bg-gray-100 rounded-xl border border-gray-200 hover:border-indigo-100 transition-colors group">
                  <h4 className="text-sm font-bold text-gray-800 mb-1">{jd.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{jd.text}</p>
                  <button
                    onClick={() => handleUseSampleJD(jd)}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all active:scale-95"
                  >
                    <Copy size={14} /> Copy & Auto-Fill
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;