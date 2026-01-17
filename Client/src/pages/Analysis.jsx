import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Info, Save, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

// Components
import PersonalInfo from "../components/Analysis/PersonalInfo";
import Experience from "../components/Analysis/Experience";
import Skills from "../components/Analysis/Skills";
import Projects from "../components/Analysis/Projects";
import Education from "../components/Analysis/Education";
import Edit from "../components/Analysis/Edit";

const STORAGE_KEY = "resume_analysis_data";
const fingerprint = (data) => {
  return JSON.stringify({
    name: data.name,
    email: data.email,
    phone: data.phone,
    skills: data.skills,
    projects: data.projects,
    education: data.education,
    summary: data.summary,
  });
};

const Analysis = () => {
  const location = useLocation();
  const { parsedData } = location.state || {};
  const [data, setData] = useState(null);
  const [projOpen, setProjOpen] = useState(true);
  const lastSkillRef = useRef(null);
  const lastEducationRef = useRef(null);
  const [saved, setSaved] = useState(false);

  // --- BUTTON SWAP STATE ---
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const staticButtonRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingButton(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px 0px 50px 0px",
      }
    );

    if (staticButtonRef.current) {
      observer.observe(staticButtonRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // --- DATA LOADING LOGIC ---
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const clean = (d) => ({
      ...d,
      summary: d?.summary?.replace(/\n+/g, " ").replace(/\s+/g, " ").trim() || "",
    });

    if (parsedData) {
      const parsedClean = clean(parsedData);
      const parsedFP = fingerprint(parsedClean);

      if (savedData) {
        const savedObj = JSON.parse(savedData);
        const savedFP = fingerprint(savedObj);

        if (parsedFP === savedFP) {
          setData(savedObj);
        } else {
          setData(parsedClean);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedClean));
        }
      } else {
        setData(parsedClean);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedClean));
      }
    } else if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, [parsedData]);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <Info size={48} className="opacity-50" />
        <p className="text-lg font-medium">No resume data found. Upload a file to begin.</p>
      </div>
    </div>
  );

  const update = (k, v) => setData({ ...data, [k]: v });

  const saveData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] pt-28 pb-10 px-4 md:px-8 overflow-x-hidden selection:bg-blue-100">
      <motion.div
        variants={containerVars}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVars} className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Analysis <span className="text-blue-600">& Editor</span>
          </h1>
          <p className="text-gray-500 mt-2">Review and refine your extracted resume data.</p>
        </motion.div>

        {/* --- FORM CONTENT --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PersonalInfo
            name={data.name}
            email={data.email}
            phone={data.phone}
            update={update}
            variants={itemVars}
          />
          <Experience
            experience_years={data.experience_years}
            update={update}
            variants={itemVars}
          />
          <Skills
            skills={data.skills}
            update={update}
            variants={itemVars}
            lastSkillRef={lastSkillRef}
          />
        </div>

        <Projects
          projects={data.projects}
          update={update}
          variants={itemVars}
          projOpen={projOpen}
          setProjOpen={setProjOpen}
        />

        <Education
          education={data.education}
          update={update}
          variants={itemVars}
          lastEducationRef={lastEducationRef}
        />

        {/* Summary */}
        <motion.div variants={itemVars} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4 border-b border-gray-100 pb-2">Professional Summary</h3>
          <Edit
            value={data.summary}
            placeholder="Write a compelling summary about your professional background..."
            onChange={(v) => update("summary", v)}
            className="w-full text-gray-600 leading-relaxed min-h-20 block"
          />
        </motion.div>

        {/* --- STATIC BUTTON --- */}
        <div ref={staticButtonRef} className="flex justify-center pt-8 pb-4 min-h-[100px] items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveData}
            className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full shadow-xl hover:bg-black transition-all font-bold text-lg"
          >
            {saved ? <CheckCircle2 className="text-green-400" /> : <Save size={20} />}
            {saved ? "Saved Successfully" : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>

      {/* --- FLOATING BUTTON --- */}
      {showFloatingButton && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none"
        >
          <button
            onClick={saveData}
            className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full shadow-2xl hover:bg-black transition-all font-bold text-lg"
          >
            {saved ? <CheckCircle2 className="text-green-400" /> : <Save size={20} />}
            {saved ? "Saved Successfully" : "Save Changes"}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Analysis;