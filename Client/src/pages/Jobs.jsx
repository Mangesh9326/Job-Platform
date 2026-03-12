import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { MessageSquare, Database, HardDrive, Bot } from "lucide-react";
import axios from "axios";

// Import Custom Components
import JobFilters from "../components/Jobs/JobFilters";
import JobCard from "../components/Jobs/JobCard";
import JobLoader from "../components/Jobs/JobLoader";
import ChatInterface from "../components/Jobs/ChatInterface"; 

// Import AI Service
import { fetchFiltersFromLLM } from "../services/jobAiService"; 

const Jobs = () => {
  // --- STATE ---
  const [jobData, setJobData] = useState([]);
  
  // Unified Filter State
  const [filters, setFilters] = useState({ 
    locations: [],     
    domains: [],       
    salary: 0,         
    types: [],         
    seniority: [],
    manualLocation: "", 
    manualDomain: ""
  });

  const [displayJobs, setDisplayJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- SOURCE TOGGLE STATE ---
  const [dataSource, setDataSource] = useState("local"); // 'local' | 'db'
  const [localProfile, setLocalProfile] = useState(null);
  const [dbProfile, setDbProfile] = useState(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const navigate = useNavigate();
  const perPage = 9;
  const chatEndRef = useRef(null);
  const { ref, inView } = useInView({ threshold: 0, rootMargin: "200px" });

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    setMessages([{ type: 'bot', text: "Hi! 👋 I'm your AI job assistant. Try 'Senior Frontend in Mumbai'." }]);

    // A. Load DB Profile
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        // Assuming your API returns the array structure you provided
        axios.get(`http://localhost:5000/api/profile/${u.id}`)
          .then(res => {
              // console.log("[PROFILE LOAD] DB Data:", res.data);
              setDbProfile(res.data);
          })
          .catch(err => console.log("[PROFILE LOAD] DB Fetch Error:", err));
      } catch(e) {}
    }

    // B. Load Local Storage Profile
    const localData = localStorage.getItem("resume_analysis_data");
    if (localData) {
      try { 
          const parsed = JSON.parse(localData);
          // console.log("[PROFILE LOAD] Local Data:", parsed);
          setLocalProfile(parsed); 
      } catch (e) {}
    }

    // C. Load Jobs
    fetch("/data/jobs.json")
      .then((res) => res.json())
      .then((data) => {
        setJobData(data.map((job, index) => ({
          id: index + 1,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.employment_type || "Full-time",
          seniority: job.seniority || "Mid",
          skills: job.skills_required || [], 
          salary: job.salary_range || "Not Specified",
          posted: job.posted_date || "Recently",
          match: 0,
          raw: job
        })));
      })
      .catch((err) => console.error("Job Fetch Error:", err));
  }, []);

  // --- 2. DYNAMIC SKILL EXTRACTION (The Core Logic) ---
  const userSkills = useMemo(() => {
    const skillsSet = new Set();

    // CASE 1: LOCAL STORAGE
    if (dataSource === "local" && localProfile?.skills) {
      localProfile.skills.forEach(s => skillsSet.add(s.name.trim().toLowerCase()));
    } 

    // CASE 2: PROFILE DB (Using your specific structure)
    else if (dataSource === "db" && dbProfile) {
      // The DB returns an array, usually we take the first user object
      const profile = Array.isArray(dbProfile) ? dbProfile[0] : dbProfile;

      if (profile) {
        // 1. Extract from Domains -> Sections
        if (profile.domains && Array.isArray(profile.domains)) {
            profile.domains.forEach(domain => {
                const sections = domain.sections;
                if (sections) {
                    // Languages
                    if (Array.isArray(sections.languages)) {
                        sections.languages.forEach(s => skillsSet.add(s.trim().toLowerCase()));
                    }
                    // Frameworks
                    if (Array.isArray(sections.frameworks)) {
                        sections.frameworks.forEach(s => {
                            let clean = s.trim().toLowerCase();
                            if(clean === 'eact') clean = 'react'; // Fix specific typo from your DB
                            skillsSet.add(clean);
                        });
                    }
                    // Certifications
                    if (Array.isArray(sections.certifications)) {
                        sections.certifications.forEach(s => skillsSet.add(s.trim().toLowerCase()));
                    }
                }
            });
        }

        // 2. Extract from Experiences (Role names often contain skills like "Fullstack")
        if (profile.experiences && Array.isArray(profile.experiences)) {
            profile.experiences.forEach(exp => {
                if(exp.role) {
                    const roleParts = exp.role.toLowerCase().split(' ');
                    roleParts.forEach(p => {
                        if(['developer', 'engineer', 'intern'].indexOf(p) === -1) {
                             skillsSet.add(p); // Add "fullstack" but skip generic words
                        }
                    });
                }
            });
        }
      }
    }
    
    const extracted = Array.from(skillsSet);
    // console.log(`[SKILLS] Active Source: ${dataSource.toUpperCase()}`, extracted);
    return extracted;
  }, [dataSource, localProfile, dbProfile]);

  // --- 3. MATCH SCORE CALCULATION & FILTERING ---
  const filteredJobs = useMemo(() => {
    let processed = jobData.map(job => {
      // --- SCORE CALCULATION ---
      let score = 0;
      if (userSkills.length > 0 && job.skills.length > 0) {
        const jobSkillsLower = job.skills.map(s => s.trim().toLowerCase());
        let matches = 0;
        
        // Check overlap between User Skills & Job Skills
        jobSkillsLower.forEach(js => {
            const tokens = js.split(/[\s\.\-\/]+/);
            // fuzzy match logic
            const isMatch = userSkills.some(us => 
                us === js || tokens.includes(us) || (us === 'javascript' && tokens.includes('js'))
            );
            if (isMatch) matches++;
        });
        
        if (jobSkillsLower.length > 0) {
            score = Math.floor((matches / jobSkillsLower.length) * 100);
        }
      }
      return { ...job, match: score };
    });

    // --- FILTERING ---
    processed = processed.filter((job) => {
      const jLoc = job.location.toLowerCase();
      const jTitle = job.title.toLowerCase();
      const jType = job.type.toLowerCase();
      const jSkills = job.skills.map(s => s.toLowerCase());
      const jSen = job.seniority.toLowerCase();

      // Location
      const locMatch = (filters.locations.length === 0 && filters.manualLocation === "") || 
        (filters.locations.some(l => jLoc.includes(l))) ||
        (filters.manualLocation !== "" && jLoc.includes(filters.manualLocation.toLowerCase()));

      // Domain
      const domainMatch = (filters.domains.length === 0 && filters.manualDomain === "") || 
        (filters.domains.some(d => jTitle.includes(d) || jSkills.some(sk => sk.includes(d)))) ||
        (filters.manualDomain !== "" && jTitle.includes(filters.manualDomain.toLowerCase()));

      // Type
      const typeMatch = filters.types.length === 0 || filters.types.some(t => jType.includes(t));
      
      // Seniority
      const seniorityMatch = filters.seniority.length === 0 || filters.seniority.some(s => jSen.includes(s) || jTitle.includes(s));

      // Salary
      const salaryMatch = filters.salary === 0 || (() => {
         const nums = job.salary.match(/\d+/g);
         if(!nums) return true;
         const maxSalary = nums.length > 1 ? Number(nums[1]) : Number(nums[0]);
         return maxSalary >= filters.salary; 
      })();

      return locMatch && domainMatch && typeMatch && seniorityMatch && salaryMatch;
    });

    return processed.sort((a, b) => b.match - a.match);
  }, [jobData, filters, userSkills]); 

  // --- 4. PAGINATION & HANDLERS ---
  useEffect(() => {
    const nextJobs = filteredJobs.slice(0, page * perPage);
    setDisplayJobs(nextJobs);
    setHasMore(nextJobs.length < filteredJobs.length);
  }, [filteredJobs, page]);

  useEffect(() => {
    if (inView && hasMore) {
      const t = setTimeout(() => setPage(p => p + 1), 300);
      return () => clearTimeout(t);
    }
  }, [inView, hasMore]);

const handleManualFilterChange = (e) => {
      const { name, value } = e.target;

      setFilters((prev) => {
        const newFilters = { ...prev };

        // Explicitly map input names to state keys
        if (name === "manualLocation" || name === "location") {
            newFilters.manualLocation = value;
        } 
        else if (name === "manualDomain" || name === "domain") {
            newFilters.manualDomain = value;
        } 
        else if (name === "salary") {
            // Convert to number for filtering, handle empty string
            newFilters.salary = value ? Number(value) : 0;
        }

        return newFilters;
      });
      
      setPage(1);
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const userText = inputMessage;
    setMessages(prev => [...prev, { type: 'user', text: userText }]);
    setInputMessage("");
    setIsTyping(true);

    const result = await fetchFiltersFromLLM(userText, filters);

    setIsTyping(false);
    if (result) {
        const sanitizeArray = (arr) => (arr || []).map(s => s.toString().toLowerCase());
        setFilters(prev => ({
            ...prev,
            locations: sanitizeArray(result.locations),
            domains: sanitizeArray(result.domains),
            types: sanitizeArray(result.types),
            seniority: sanitizeArray(result.seniority),
            salary: result.salary !== undefined ? result.salary : prev.salary,
            manualLocation: "", manualDomain: ""
        }));
        setMessages(prev => [...prev, { type: 'bot', text: result.reply || "Filters updated." }]);
        setPage(1);
    } else {
        setMessages(prev => [...prev, { type: 'bot', text: "Connection error. Please use manual filters." }]);
    }
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearChat = () => {
      setFilters({ locations: [], domains: [], salary: 0, types: [], seniority: [], manualLocation: "", manualDomain: "" });
      setPage(1);
      setMessages([{ type: 'bot', text: "Filters cleared." }]);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-12 pb-10">
      
      {/* --- HEADER WITH TOGGLE --- */}
      <div className="max-w-[1920px] mx-auto px-6 mb-6">
        <div className="flex flex-col xl:flex-row justify-between items-end gap-6 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Job <span className="text-blue-600">Feed</span></h1>
            <p className="text-gray-500 mt-1">Found {filteredJobs.length} matches based on your {dataSource === 'local' ? 'Local Resume' : 'Database Profile'}.</p>
          </div>

{/* --- TOGGLE SWITCH --- */}
<div className="relative w-fit">
  <div className="relative grid grid-cols-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">

    {/* Sliding Background */}
    <div
      className={`absolute top-1 bottom-1 left-1 w-1/2 rounded-full bg-blue-600 transition-transform duration-300 ease-in-out ${
        dataSource === 'db' ? 'translate-x-[93%]' : ''
      }`}
    />

    <button
      onClick={() => setDataSource('local')}
      className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
        dataSource === 'local'
          ? 'text-white'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <HardDrive size={16} />
      <span>Resume</span>
    </button>

    <button
      onClick={() => setDataSource('db')}
      className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
        dataSource === 'db'
          ? 'text-white'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <Database size={16} />
      <span>Profile</span>
    </button>

  </div>
</div>

        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-[1920px] mx-auto px-6 flex relative">
        
        <div className={`transition-all duration-300 w-full ${isChatOpen ? "xl:pr-[420px]" : ""}`}>
            <div className="mb-4 bg-transparent p-4 rounded-xl">
                <JobFilters 
        filters={filters} 
        onFilterChange={handleManualFilterChange} 
    />
            </div>

            <div className={`grid gap-6 mx-auto ${isChatOpen ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 w-full" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 w-[80%]"}`}>
              {displayJobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => navigate(`/jobs/${job.id}`, { state: { 
                    ...job.raw,   // Keep passing the raw job data
                    dataSource    // <--- ADD THIS: Passes 'local' or 'db' to the next page
                  } })} />
              ))}
            </div>
            
            {displayJobs.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <Bot size={48} className="mx-auto mb-4 opacity-50"/>
                <p>No jobs found. Try clearing filters.</p>
              </div>
            )}
            <JobLoader ref={ref} hasMore={hasMore} displayCount={displayJobs.length} />
        </div>

        {/* --- CHATBOX --- */}
        <div className={`fixed top-32 right-6 bottom-6 z-40 w-[400px] transition-all duration-300 ease-in-out ${isChatOpen ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0 pointer-events-none"} hidden lg:block`}>
            <div className="h-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
                <ChatInterface 
                    messages={messages} 
                    inputMessage={inputMessage} 
                    setInputMessage={setInputMessage} 
                    handleChat={handleChat} 
                    handleClear={handleClearChat} 
                    close={() => setIsChatOpen(false)} 
                    chatEndRef={chatEndRef}
                    isTyping={isTyping}
                />
            </div>
        </div>

      </div>

      {!isChatOpen && (
        <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-600/40 hover:bg-blue-700 hover:scale-105 transition-all transform animate-bounce-slow">
          <MessageSquare size={24} /><span className="font-bold text-lg hidden md:inline">AI Filter</span>
        </button>
      )}
    </div>
  );
};

export default Jobs;