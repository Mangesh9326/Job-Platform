import React from "react";
import { Plus, Trash2, Edit2, Save, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EducationCard = ({ education, setEducation, edit, setEdit }) => {
  
  const addEdu = () => setEducation([
    ...education, 
    { id: Date.now(), degree: "", score: "", scoreType: "CGPA", year: "" }
  ]);
  
  const updateEdu = (id, field, val) => {
    setEducation(education.map(e => e.id === id ? { ...e, [field]: val } : e));
  };

  return (
    <motion.div layout className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><GraduationCap size={20} /></div>
          Education
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setEdit(!edit)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${edit ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {edit ? <><Save size={16}/> Save</> : <><Edit2 size={16}/> Edit</>}
          </button>
          {edit && (
            <button onClick={addEdu} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {education.map((edu) => (
            <motion.div 
              key={edu.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col md:flex-row gap-4 items-start md:items-end p-5 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-blue-200 transition-colors"
            >
              {/* Degree Name */}
              <div className="flex-1 w-full">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Degree / School</label>
                <input 
                  value={edu.degree}
                  disabled={!edit}
                  onChange={(e) => updateEdu(edu.id, 'degree', e.target.value)}
                  className="w-full bg-transparent font-semibold text-gray-800 outline-none border-b border-transparent focus:border-blue-500 transition-colors disabled:text-gray-700 py-1"
                  placeholder="e.g. B.Tech Computer Science"
                />
              </div>
              
              {/* Score Section */}
              <div className="flex gap-2 w-full md:w-auto">
                <div className="w-24">
                   <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Type</label>
                   <select
                      disabled={!edit}
                      value={edu.scoreType}
                      onChange={(e) => updateEdu(edu.id, 'scoreType', e.target.value)}
                      className="w-full bg-white px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-medium outline-none focus:border-blue-500 disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:appearance-none"
                   >
                      <option>CGPA</option>
                      <option>Percentage</option>
                      <option>Grade</option>
                   </select>
                </div>
                <div className="w-20">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Value</label>
                  <input 
                    value={edu.score}
                    disabled={!edit}
                    onChange={(e) => updateEdu(edu.id, 'score', e.target.value)}
                    className="w-full bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-center font-medium outline-none focus:border-blue-500 disabled:bg-transparent disabled:border-transparent disabled:text-left disabled:px-0"
                    placeholder="9.0"
                  />
                </div>
              </div>

              {/* Year Section */}
              <div className="w-full md:w-32">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Year / Duration</label>
                <input 
                  value={edu.year}
                  disabled={!edit}
                  onChange={(e) => updateEdu(edu.id, 'year', e.target.value)}
                  className="w-full bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-center font-medium outline-none focus:border-blue-500 disabled:bg-transparent disabled:border-transparent disabled:text-left disabled:px-0"
                  placeholder="2020 - 2024"
                />
              </div>

              {/* Delete Button */}
              {edit && (
                <button 
                  onClick={() => setEducation(education.filter(e => e.id !== edu.id))}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-0.5"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EducationCard;