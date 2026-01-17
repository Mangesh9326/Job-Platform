// src/pages/JobDetail.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Briefcase, DollarSign, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const JobDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch job from backend
  useEffect(() => {
    fetch(`http://localhost:5000/api/jobs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setJob(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading job details...
      </div>
    );
  }

  if (!job || job.error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Job information not available.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-16 px-6 bg-gray-100"
    >
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={22} />
          Back to Jobs
        </button>

        {/* Header Section */}
        <div className="bg-white/60 backdrop-blur-xl shadow-lg border border-white/30 p-8 rounded-2xl">
          <h1 className="text-4xl font-bold text-gray-900">{job.title}</h1>
          <p className="text-lg text-gray-600 mt-2">{job.company}</p>

          <div className="flex flex-wrap gap-6 mt-6 text-gray-700">
            <div className="flex items-center gap-2">
              <MapPin size={20} /> {job.location}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase size={20} /> {job.seniority || "General"}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={20} /> {job.salary_range}
            </div>
          </div>

          {/* Match Score */}
          <div className="mt-6">
            <p className="text-gray-700 font-semibold mb-1">Match Score</p>
            <div className="w-full bg-gray-200 h-3 rounded-xl">
              <div
                className="h-3 bg-green-500 rounded-xl"
                style={{ width: `${Math.floor(Math.random() * 41) + 60}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white/60 backdrop-blur-xl shadow-lg border border-white/30 p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold text-gray-800">Required Skills</h2>
          <div className="flex flex-wrap gap-3 mt-4">
            {job.skills_required?.map((skill, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm shadow-sm"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white/60 backdrop-blur-xl shadow-lg border border-white/30 p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold text-gray-800">Job Description</h2>
          <p className="text-gray-700 leading-relaxed mt-3 whitespace-pre-line">
            {job.description}
          </p>

          {job.responsibilities && (
            <>
              <h3 className="text-xl font-semibold mt-6">Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                {job.responsibilities.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {job.requirements && (
            <>
              <h3 className="text-xl font-semibold mt-6">Requirements</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                {job.requirements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Apply Section */}
        <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl text-center">
          <h2 className="text-3xl font-bold">Interested in this Job?</h2>
          <p className="mt-2 text-lg opacity-90">Click below to apply or save this job for later.</p>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition shadow">
              Apply Now
            </button>
            <button className="px-8 py-3 border border-white font-semibold rounded-xl hover:bg-white/20 transition">
              Save Job
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default JobDetail;
