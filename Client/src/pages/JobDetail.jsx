import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

// Import Components
import JobHeader from "../components/Jobs/JobHeader";
import JobDescription from "../components/Jobs/JobDescription";
import JobSidebar from "../components/Jobs/JobSidebar";
import JobSkeleton from "../components/Jobs/JobSkeleton";

const JobDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // 1. Get Data Source & Job Data passed from Jobs Page
  // This "passedJob" contains the exact job object you clicked on
  const passedJob = location.state; 
  const dataSource = passedJob?.dataSource || "local";

  const [job, setJob] = useState(passedJob || null); // Initialize with passed data if available
  const [loading, setLoading] = useState(!passedJob); // Only load if we didn't get data
  const [saved, setSaved] = useState(false);
  
  // Profile Data State
  const [localProfile, setLocalProfile] = useState(null);
  const [dbProfile, setDbProfile] = useState(null);

  // Parse User ID
  const userStr = localStorage.getItem("user");
  const loggedInUserId = userStr ? JSON.parse(userStr).id : null;

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. If we ALREADY have the job from the click, skip fetching the job list
        if (!passedJob) {
            const jobRes = await fetch(`/data/jobs.json`);
            const jobsData = await jobRes.json();
            
            // Robust Finder: Try matching ID string, Number, or job_id field
            const foundJob = jobsData.find(j => 
                String(j.id) === String(id) || 
                String(j.job_id) === String(id) ||
                (j.id === undefined && jobsData.indexOf(j) + 1 == id) // Fallback to index matching
            );

            if (foundJob) {
                setJob(foundJob);
            } else {
                console.error("Job not found in JSON");
                // Don't default to jobsData[0], let it show "Not Found"
            }
        }

        // B. Fetch DB Profile if user exists
        if (loggedInUserId) {
          try {
            const profileRes = await axios.get(`http://localhost:5000/api/profile/${loggedInUserId}`);
            setDbProfile(profileRes.data);
            if (profileRes.data?.savedJobs) {
              setSaved(profileRes.data.savedJobs.includes(String(id)));
            }
          } catch (e) { console.error("DB Profile Error", e); }
        }

        // C. Fetch Local Profile
        const localData = localStorage.getItem("resume_analysis_data");
        if (localData) {
           setLocalProfile(JSON.parse(localData));
        }

        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error(err);
        toast.error("Error loading job details");
      }
    };
    fetchData();
  }, [id, loggedInUserId, passedJob]);

  // --- 2. EXTRACT USER SKILLS (Same logic as Jobs.jsx) ---
  const userSkills = useMemo(() => {
    const skillsSet = new Set();

    // CASE 1: LOCAL STORAGE
    if (dataSource === "local" && localProfile?.skills) {
      localProfile.skills.forEach(s => skillsSet.add(s.name.trim().toLowerCase()));
    } 

    // CASE 2: PROFILE DB
    else if (dataSource === "db" && dbProfile) {
      const profile = Array.isArray(dbProfile) ? dbProfile[0] : dbProfile;
      if (profile) {
        // Domains
        if (profile.domains && Array.isArray(profile.domains)) {
            profile.domains.forEach(domain => {
                const sections = domain.sections;
                if (sections) {
                    if (Array.isArray(sections.languages)) sections.languages.forEach(s => skillsSet.add(s.trim().toLowerCase()));
                    if (Array.isArray(sections.frameworks)) {
                        sections.frameworks.forEach(s => {
                            let clean = s.trim().toLowerCase();
                            if(clean === 'eact') clean = 'react';
                            skillsSet.add(clean);
                        });
                    }
                    if (Array.isArray(sections.certifications)) sections.certifications.forEach(s => skillsSet.add(s.trim().toLowerCase()));
                }
            });
        }
        // Experiences
        if (profile.experiences && Array.isArray(profile.experiences)) {
            profile.experiences.forEach(exp => {
                if(exp.role) {
                    const roleParts = exp.role.toLowerCase().split(' ');
                    roleParts.forEach(p => {
                        if(['developer', 'engineer', 'intern'].indexOf(p) === -1) skillsSet.add(p);
                    });
                }
            });
        }
      }
    }
    return Array.from(skillsSet);
  }, [dataSource, localProfile, dbProfile]);

  // --- 3. CALCULATE MATCH & MISSING SKILLS ---
  const analysis = useMemo(() => {
    if (!job || !job.skills_required) return { score: 0, matched: [], missing: [] };

    const jobSkills = job.skills_required; 
    const matched = [];
    const missing = [];

    jobSkills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        // Fuzzy match logic
        const isMatch = userSkills.some(us => 
            us === skillLower || skillLower.includes(us) || (us === 'javascript' && skillLower.includes('js'))
        );

        if (isMatch) matched.push(skill);
        else missing.push(skill);
    });

    const score = jobSkills.length > 0 ? Math.floor((matched.length / jobSkills.length) * 100) : 0;

    return { score, matched, missing };
  }, [job, userSkills]);

  // --- ACTIONS ---
  const handleSave = async () => {
    if (!loggedInUserId) return toast.error("Please login to save jobs");
    setSaved(!saved);
    try {
      const res = await axios.post("http://localhost:5000/api/profile/toggle-saved-job", {
        userId: loggedInUserId,
        jobId: id
      });
      if (res.data.success) {
        toast.success(res.data.isSaved ? "Job saved!" : "Job removed.");
        setSaved(res.data.isSaved); 
      }
    } catch (err) {
      setSaved(!saved); 
      toast.error("Failed to update status");
    }
  };

  const handleApply = () => toast.success("Application Submitted!");

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 px-4 md:px-8 selection:bg-blue-100">
      <Toaster position="bottom-center" />
      
      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Jobs
        </button>

        <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
             Analyzing using: <span className="text-blue-600">{dataSource === 'local' ? "Local Resume" : "Profile DB"}</span>
        </div>
      </div>

      {loading ? (
        <JobSkeleton />
      ) : !job ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
           <div className="text-center">
               <h3 className="text-xl font-bold mb-2">Job Not Found</h3>
               <p>The job ID "{id}" could not be found.</p>
           </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <JobHeader job={job} saved={saved} onSave={handleSave} />
            <JobDescription job={job} />
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1">
            <JobSidebar 
              job={job} 
              saved={saved} 
              onSave={handleSave} 
              onApply={handleApply} 
              matchScore={analysis.score}
              matchedSkills={analysis.matched}
              missingSkills={analysis.missing}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;