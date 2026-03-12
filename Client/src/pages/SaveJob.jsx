import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, MapPin, Briefcase, ArrowRight, ExternalLink, 
  Building2, Calendar, BookmarkX 
} from "lucide-react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

// --- SUB-COMPONENT: Dynamic Company Logo ---
const CompanyLogo = ({ name }) => {
  const initials = name ? name.slice(0, 2).toUpperCase() : "JP";
  const colors = ["bg-blue-600", "bg-purple-600", "bg-emerald-600", "bg-orange-600", "bg-indigo-600"];
  const colorClass = colors[(name?.length || 0) % colors.length];

  return (
    <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md`}>
      {initials}
    </div>
  );
};

// --- SUB-COMPONENT: Empty State ---
const EmptyState = ({ onExplore }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
      <BookmarkX size={40} className="text-gray-400" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">No saved jobs yet</h3>
    <p className="text-gray-500 max-w-md mb-8">
      Jobs you save will appear here. Start exploring to find your next opportunity!
    </p>
    <button 
      onClick={onExplore}
      className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
    >
      Explore Jobs
    </button>
  </motion.div>
);

// --- MAIN PAGE COMPONENT ---
const SavedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get User ID
  const userStr = localStorage.getItem("user");
  const userId = userStr ? JSON.parse(userStr).id : null;

  // 1. Fetch Saved Jobs
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSavedJobs = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${userId}/saved-jobs`);
        setJobs(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load saved jobs", err);
        setLoading(false);
        toast.error("Could not load saved jobs");
      }
    };

    fetchSavedJobs();
  }, [userId]);

  // 2. Handle Remove
  const handleRemove = async (jobId) => {
    // Optimistic UI Update: Remove immediately from list
    const originalJobs = [...jobs];
    setJobs(jobs.filter(j => j.id !== jobId));

    try {
      await axios.post("http://localhost:5000/api/profile/toggle-saved-job", {
        userId,
        jobId
      });
      toast.success("Job removed from list");
    } catch (err) {
      // Revert if failed
      setJobs(originalJobs);
      toast.error("Failed to remove job");
    }
  };

  if (loading) return <SavedJobsSkeleton />;

  return (
    <div className="min-h-screen bg-gray-100 pt-28 pb-20 px-4 md:px-8">
      <Toaster position="bottom-center" />
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Saved Jobs</h1>
          <p className="text-gray-500 mt-2">Manage your bookmarked opportunities ({jobs.length})</p>
        </div>

        {jobs.length === 0 ? (
          <EmptyState onExplore={() => navigate("/jobs")} />
        ) : (
          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {jobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onRemove={() => handleRemove(job.id)}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: Job Card ---
const JobCard = ({ job, onRemove, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all relative group cursor-pointer"
      onClick={onClick}
    >
      {/* Remove Button (Visible on Hover) */}
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click
          onRemove();
        }}
        className="absolute top-4 right-4 p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 z-10"
        title="Remove from saved"
      >
        <Trash2 size={16} />
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <CompanyLogo name={job.company} />
        <div>
          <h3 className="font-bold text-gray-900 line-clamp-1">{job.title}</h3>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
            <Building2 size={14} />
            <span>{job.company}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
          <MapPin size={12} /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
          <Briefcase size={12} /> {job.type || "Full Time"}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium border border-gray-200">
          <Calendar size={12} /> 2d ago
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <span className="text-sm font-semibold text-gray-900">
          {job.salary || "Competitive"}
        </span>
        <span className="text-sm font-medium text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          View Details <ArrowRight size={16} />
        </span>
      </div>
    </motion.div>
  );
};

// --- SKELETON LOADER ---
const SavedJobsSkeleton = () => (
  <div className="min-h-screen bg-[#f8fafc] pt-28 px-4 md:px-8">
    <div className="max-w-6xl mx-auto">
      <div className="h-10 w-48 bg-gray-200 rounded-lg mb-2 animate-pulse" />
      <div className="h-5 w-64 bg-gray-200 rounded-lg mb-10 animate-pulse" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 h-64 animate-pulse">
            <div className="flex gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="h-20 bg-gray-100 rounded-xl mb-6" />
            <div className="h-8 bg-gray-100 rounded-lg w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SavedJobs;