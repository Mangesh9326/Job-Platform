import React, { useState } from "react";
import { Plus, Trash2, Edit2, Save, Layers, Code, Briefcase, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SkillTag = ({ label, onDelete, editable }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
    {label}
    {editable && (
      <button onClick={onDelete} className="hover:text-red-600 transition-colors">
        <Trash2 size={12} />
      </button>
    )}
  </span>
);

const DomainSection = ({ domains, setDomains }) => {
  // Use the first domain's ID if available, otherwise null
  const [activeTab, setActiveTab] = useState(domains.length > 0 ? domains[0].id : null);
  const [editing, setEditing] = useState(null);

  // Safely find the active domain
  const activeDomain = domains.find(d => d.id === activeTab);

  // --- CRUD HELPERS ---
  const updateDomainName = (id, name) => {
    setDomains(domains.map(d => d.id === id ? { ...d, name } : d));
  };

  const addDomain = () => {
    const newId = crypto.randomUUID();
    setDomains([...domains, { 
      id: newId, 
      name: "New Role", 
      sections: { languages: [], frameworks: [], projects: [], experience: [], certifications: [] } 
    }]);
    setActiveTab(newId);
    setEditing(newId);
  };

  const deleteDomain = (id) => {
    const filtered = domains.filter(d => d.id !== id);
    setDomains(filtered);
    if (activeTab === id && filtered.length > 0) setActiveTab(filtered[0].id);
    else if (filtered.length === 0) setActiveTab(null);
  };

  const addItem = (section, val) => {
    if (!val.trim()) return;
    setDomains(domains.map(d => 
      d.id === activeTab ? { 
        ...d, 
        sections: { ...d.sections, [section]: [...d.sections[section], val] } 
      } : d
    ));
  };

  const removeItem = (section, idx) => {
    setDomains(domains.map(d =>
      d.id === activeTab
        ? {
            ...d,
            sections: {
              ...d.sections,
              [section]: d.sections[section].filter((_, i) => i !== idx)
            }
          }
        : d
    ));
  };

  const removeProject = (projectId) => {
    setDomains(domains.map(d =>
      d.id === activeTab
        ? {
            ...d,
            sections: {
              ...d.sections,
              projects: d.sections.projects.filter(p => p.id !== projectId)
            }
          }
        : d
    ));
  };

  // --- RENDER HELPERS ---
  const renderListSection = (title, icon, key) => {
    // Safety check in case sections or the specific key is undefined
    if (!activeDomain || !activeDomain.sections || !activeDomain.sections[key]) return null;

    return (
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          {icon} {title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {activeDomain.sections[key].map((item, idx) => (
            <SkillTag 
              // FIX: Use a more robust key combination
              key={`skill-${activeTab}-${key}-${item}-${idx}`} 
              label={item} 
              editable={editing === activeTab} 
              onDelete={() => removeItem(key, idx)}
            />
          ))}
          
          {editing === activeTab && (
            <div className="flex items-center gap-2">
              <input 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addItem(key, e.target.value);
                    e.target.value = '';
                  }
                }}
                placeholder="Type & Enter..." 
                className="px-3 py-1.5 rounded-full text-sm bg-gray-50 border border-gray-200 outline-none focus:border-blue-500 w-32 focus:w-48 transition-all"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[500px]">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          {domains.map(d => (
            <button
              key={`tab-${d.id}`} // FIX: Ensure tab buttons have unique keys
              onClick={() => setActiveTab(d.id)}
              className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === d.id 
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-200" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {editing === d.id ? (
                <input 
                  value={d.name} 
                  onChange={(e) => updateDomainName(d.id, e.target.value)}
                  className="bg-transparent outline-none w-24 text-center"
                  autoFocus
                />
              ) : d.name}
            </button>
          ))}
          <button 
            onClick={addDomain}
            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          {activeDomain && ( // Only show edit/save if a domain exists
            editing === activeTab ? (
              <>
                <button 
                  onClick={() => deleteDomain(activeTab)} 
                  className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={() => setEditing(null)} 
                  className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Save size={18} /> Save
                </button>
              </>
            ) : (
              <button 
                onClick={() => setEditing(activeTab)} 
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center gap-2"
              >
                <Edit2 size={18} /> Edit
              </button>
            )
          )}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeDomain ? (
          <motion.div
            key={`content-${activeTab}`} // FIX: Use activeTab for motion.div key
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Skills */}
              <div className="lg:col-span-1 space-y-2">
                {renderListSection("Languages", <Code size={16}/>, "languages")}
                {renderListSection("Frameworks", <Layers size={16}/>, "frameworks")}
                {renderListSection("Certifications", <Award size={16}/>, "certifications")}
              </div>

              {/* Right Column: Projects */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={16}/> Projects
                  </h3>
                  {editing === activeTab && (
                    <button 
                      onClick={() => setDomains(domains.map(d => d.id === activeTab ? { ...d, sections: { ...d.sections, projects: [...(d.sections.projects || []), { id: crypto.randomUUID(), title: "New Project", description: "Desc...", stack: "Stack" }] } } : d))}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus size={12}/> Add Project
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {activeDomain.sections?.projects?.map((proj, i) => (
                    <div key={`proj-${proj.id || i}`} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group relative">
                      {editing === activeTab && (
                        <button 
                           onClick={() => removeProject(proj.id)}
                          className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      
                      {editing === activeTab ? (
                        <div className="space-y-2">
                          <input 
                            value={proj.title}
                            onChange={(e) => {
                              const newProjs = [...activeDomain.sections.projects];
                              newProjs[i].title = e.target.value;
                              setDomains(domains.map(d => d.id === activeTab ? { ...d, sections: { ...d.sections, projects: newProjs } } : d));
                            }}
                            className="font-bold text-lg w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none"
                          />
                          <textarea 
                            value={proj.description}
                            onChange={(e) => {
                              const newProjs = [...activeDomain.sections.projects];
                              newProjs[i].description = e.target.value;
                              setDomains(domains.map(d => d.id === activeTab ? { ...d, sections: { ...d.sections, projects: newProjs } } : d));
                            }}
                            className="w-full text-sm text-gray-600 bg-transparent border-b border-transparent focus:border-blue-500 outline-none resize-none"
                            rows={2}
                          />
                          <input 
                            value={proj.stack}
                            onChange={(e) => {
                              const newProjs = [...activeDomain.sections.projects];
                              newProjs[i].stack = e.target.value;
                              setDomains(domains.map(d => d.id === activeTab ? { ...d, sections: { ...d.sections, projects: newProjs } } : d));
                            }}
                            className="text-xs text-blue-600 font-mono w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none"
                          />
                        </div>
                      ) : (
                        <>
                          <h4 className="font-bold text-lg text-gray-900">{proj.title}</h4>
                          <p className="text-gray-600 text-sm mt-1 leading-relaxed">{proj.description}</p>
                          <div className="mt-3 text-xs font-mono text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
                            {proj.stack}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {(!activeDomain.sections?.projects || activeDomain.sections.projects.length === 0) && (
                     <div className="text-sm text-gray-400 italic">No projects added yet.</div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
           <div className="flex flex-col items-center justify-center h-48 text-gray-400 w-full">
             <Briefcase size={48} className="mb-4 opacity-20" />
             <p>Select or add a domain to manage skills</p>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DomainSection;