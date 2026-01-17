import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";

// Import Custom Components
import JobFilters from "../components/Jobs/JobFilters";
import JobCard from "../components/Jobs/JobCard";
import JobLoader from "../components/Jobs/JobLoader";

const Jobs = () => {
  const [jobData, setJobData] = useState([]);
  const [filters, setFilters] = useState({ location: "", domain: "", salary: "" });
  const [displayJobs, setDisplayJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();
  const perPage = 9;

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  // --- DATA FETCHING ---
  useEffect(() => {
    fetch("/data/jobs.json")
      .then((res) => res.json())
      .then((data) => {
        setJobData(
          data.map((job, index) => ({
            id: index + 1,
            title: job.title,
            company: job.company,
            location: job.location,
            domain: job.seniority || "General",
            skills: job.skills_required || [],
            salary: job.salary_range || "Not Specified",
            match: Math.floor(Math.random() * 41) + 60,
            posted: Math.floor(Math.random() * 10) + 1,
            raw: job
          }))
        );
      })
      .catch((err) => console.error("Error loading job data:", err));
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const parseSalaryRange = (salaryStr) => {
    if (!salaryStr || salaryStr === "Not Specified") return { min: 0, max: 999 };
    const numbers = salaryStr.match(/\d+/g);
    if (!numbers) return { min: 0, max: 999 };
    if (numbers.length === 1) return { min: Number(numbers[0]), max: Number(numbers[0]) };
    return { min: Number(numbers[0]), max: Number(numbers[1]) };
  };

  const filteredJobs = useMemo(() => {
    return jobData.filter((job) => {
      const salaryFilterMatch =
        filters.salary === "" ||
        (() => {
          const s = Number(filters.salary);
          const { min, max } = parseSalaryRange(job.salary);
          return s >= min && s <= max;
        })();

      return (
        (filters.location === "" || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
        (filters.domain === "" || job.title.toLowerCase().includes(filters.domain.toLowerCase())) &&
        salaryFilterMatch
      );
    });
  }, [filters, jobData]);

  const loadMoreJobs = useCallback(() => {
    const nextJobs = filteredJobs.slice(0, page * perPage);
    setDisplayJobs(nextJobs);
    setHasMore(nextJobs.length < filteredJobs.length);
  }, [filteredJobs, page]);

  useEffect(() => {
    loadMoreJobs();
  }, [loadMoreJobs]);

  useEffect(() => {
    if (inView && hasMore) {
      const timeout = setTimeout(() => {
        setPage((prev) => prev + 1);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [inView, hasMore]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 px-4 md:px-8">
      
      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Recommended <span className="text-blue-600">Opportunities</span>
        </h1>
        <p className="text-gray-500 mt-3 text-lg">
          Found {filteredJobs.length} jobs matching your profile.
        </p>
      </div>

      {/* --- SEARCH BAR --- */}
      <JobFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />

      {/* --- JOB GRID --- */}
      <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayJobs.map((job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            onClick={() => navigate(`/jobs/${job.id}`, { state: job.raw })} 
          />
        ))}
      </div>

      {/* --- LOADER --- */}
      <JobLoader 
        ref={ref} 
        hasMore={hasMore} 
        displayCount={displayJobs.length} 
      />

    </div>
  );
};

export default Jobs;