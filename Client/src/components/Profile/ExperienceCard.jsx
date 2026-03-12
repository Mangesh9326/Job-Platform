import React from "react";
import { Plus, Trash2, Edit2, Save, Briefcase, Calendar, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ExperienceCard = ({ experiences, setExperiences, totalExp, setTotalExp, edit, setEdit }) => {
  
  const addExp = () => setExperiences([
    ...experiences, 
    { id: Date.now(), company: "", role: "", duration: "", location: "" }
  ]);
  
  const updateExp = (id, field, val) => {
    setExperiences(experiences.map(e => e.id === id ? { ...e, [field]: val } : e));
  };

  return (
    <motion.div layout className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Briefcase size={20} /></div>
          <div>
            <h2 className="text-xl font-bold">Experience</h2>
            {edit ? (
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 uppercase font-bold">Total:</span>
                    <input 
                        value={totalExp}
                        onChange={(e) => setTotalExp(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-sm w-24 outline-none focus:border-purple-500"
                        placeholder="2 Years"
                    />
                </div>
            ) : (
                <p className="text-xs text-gray-500 font-medium">Total: {totalExp}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setEdit(!edit)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${edit ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {edit ? <><Save size={16}/> Save</> : <><Edit2 size={16}/> Edit</>}
          </button>
          {edit && (
            <button onClick={addExp} className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        <AnimatePresence>
          {experiences.map((exp) => (
            <motion.div 
              key={exp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative p-5 rounded-2xl bg-white border border-gray-200 hover:border-purple-200 hover:shadow-sm transition-all group"
            >
              {edit && (
                <button 
                  onClick={() => setExperiences(experiences.filter(e => e.id !== exp.id))}
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                {/* Role */}
                <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Role / Title</label>
                    <input 
                        value={exp.role}
                        disabled={!edit}
                        onChange={(e) => updateExp(exp.id, 'role', e.target.value)}
                        className="w-full font-bold text-gray-800 text-lg bg-transparent border-b border-transparent focus:border-purple-500 outline-none placeholder-gray-300 disabled:placeholder-transparent"
                        placeholder="Software Engineer"
                    />
                </div>

                {/* Company */}
                <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Company</label>
                    <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400"/>
                        <input 
                            value={exp.company}
                            disabled={!edit}
                            onChange={(e) => updateExp(exp.id, 'company', e.target.value)}
                            className="w-full font-medium text-gray-700 bg-transparent border-b border-transparent focus:border-purple-500 outline-none"
                            placeholder="Google Inc."
                        />
                    </div>
                </div>

                {/* Duration */}
                <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Duration</label>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400"/>
                        <input 
                            value={exp.duration}
                            disabled={!edit}
                            onChange={(e) => updateExp(exp.id, 'duration', e.target.value)}
                            className="w-full text-sm text-gray-600 bg-transparent border-b border-transparent focus:border-purple-500 outline-none"
                            placeholder="July 2020 - Aug 2022"
                        />
                    </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ExperienceCard;