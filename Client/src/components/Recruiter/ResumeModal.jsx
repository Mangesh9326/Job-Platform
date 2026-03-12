import React from "react";
import { X, Mail, Phone, MapPin, Briefcase, GraduationCap, Code, FolderOpen } from "lucide-react";

const ResumeModal = ({ candidate, onClose }) => {
  if (!candidate) return null;

  // 1. Aggregate all skills and projects from the candidate's domains
  let allSkills = [];
  let allProjects = [];
  let certifications = [];

  if (candidate.domains && Array.isArray(candidate.domains)) {
    candidate.domains.forEach(domain => {
      if (domain.sections) {
        if (domain.sections.languages) allSkills.push(...domain.sections.languages);
        if (domain.sections.frameworks) allSkills.push(...domain.sections.frameworks);
        if (domain.sections.certifications) certifications.push(...domain.sections.certifications);
        if (domain.sections.projects) allProjects.push(...domain.sections.projects);
      }
    });
  }

  // Deduplicate skills
  allSkills = [...new Set(allSkills)];

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 sm:p-6">
      {/* Modal Container */}
      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing it
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Scrollable Resume Content */}
        <div className="overflow-y-auto p-8 sm:p-12 custom-scrollbar">
          
          {/* HEADER */}
          <div className="border-b-2 border-gray-900 pb-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img 
              src={candidate.profilePic || `https://ui-avatars.com/api/?name=${candidate.fullName}&background=random`} 
              alt={candidate.fullName} 
              className="w-24 h-24 rounded-full object-cover shadow-md"
            />
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{candidate.fullName}</h1>
              <p className="text-xl text-blue-600 font-medium mt-1">
                 {candidate.domains?.[0]?.name || "Software Professional"}
              </p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-sm text-gray-600 font-medium">
                {candidate.emails?.[0] && (
                  <span className="flex items-center gap-1.5"><Mail size={16}/> {candidate.emails[0]}</span>
                )}
                {candidate.phones?.[0] && (
                  <span className="flex items-center gap-1.5"><Phone size={16}/> {candidate.phones[0]}</span>
                )}
                {candidate.location && (
                  <span className="flex items-center gap-1.5"><MapPin size={16}/> {candidate.location}</span>
                )}
              </div>
            </div>
          </div>

          {/* TWO COLUMN LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            {/* LEFT COLUMN (Wider) */}
            <div className="md:col-span-2 space-y-8">
              
              {/* EXPERIENCE */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <Briefcase size={20} className="text-blue-600" /> Work Experience
                </h2>
                {candidate.experiences?.length > 0 ? (
                  <div className="space-y-6">
                    {candidate.experiences.map((exp, i) => (
                      <div key={i} className="relative pl-4 border-l-2 border-blue-200">
                        <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-1.5"></div>
                        <h3 className="font-bold text-gray-900 text-lg">{exp.role}</h3>
                        <div className="flex justify-between text-sm text-gray-500 font-medium mb-2">
                          <span>{exp.company}</span>
                          <span>{exp.duration}</span>
                        </div>
                        {exp.location && <p className="text-sm text-gray-400">{exp.location}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">No experience listed.</p>
                )}
              </section>

              {/* PROJECTS */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <FolderOpen size={20} className="text-blue-600" /> Key Projects
                </h2>
                {allProjects.length > 0 ? (
                  <div className="space-y-4">
                    {allProjects.map((proj, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900">{proj.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 mb-3">{proj.description}</p>
                        <div className="text-xs font-mono text-blue-700 bg-blue-100/50 inline-block px-2 py-1 rounded">
                          Tech: {proj.stack}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">No projects listed.</p>
                )}
              </section>

            </div>

            {/* RIGHT COLUMN (Narrower) */}
            <div className="space-y-8">
              
              {/* SKILLS */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <Code size={20} className="text-blue-600" /> Technical Skills
                </h2>
                {allSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">No skills listed.</p>
                )}
              </section>

              {/* EDUCATION */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <GraduationCap size={20} className="text-blue-600" /> Education
                </h2>
                {candidate.education?.length > 0 ? (
                  <div className="space-y-4">
                    {candidate.education.map((edu, i) => (
                      <div key={i}>
                        <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                        <p className="text-xs text-gray-500 font-medium">{edu.year}</p>
                        <p className="text-xs text-gray-600 mt-1">Score: {edu.score} {edu.scoreType === 'Percentage' ? '%' : edu.scoreType}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">No education listed.</p>
                )}
              </section>

              {/* CERTIFICATIONS */}
              {certifications.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    Certifications
                  </h2>
                  <ul className="list-disc list-inside space-y-1">
                    {certifications.map((cert, i) => (
                      <li key={i} className="text-sm text-gray-700">{cert}</li>
                    ))}
                  </ul>
                </section>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResumeModal;