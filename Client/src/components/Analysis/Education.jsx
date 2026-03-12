import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import Edit from "./Edit";

const Education = ({ education, update, variants, lastEducationRef }) => {
  const handleAddEducation = () => {
    update("education", [...education, ""]);
    setTimeout(() => lastEducationRef.current?.focus(), 0);
  };

  const handleUpdateEducation = (index, value) => {
    const copy = [...education];
    copy[index] = value;
    update("education", copy);
  };

  const handleBlurEducation = (index) => {
    if (!education[index]?.trim()) {
      handleRemoveEducation(index);
    }
  };

  const handleRemoveEducation = (index) => {
    const filtered = education.filter((_, idx) => idx !== index);
    update("education", filtered);
  };

  return (
    <motion.div variants={variants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">Education</h3>
        <button
          onClick={handleAddEducation}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <ul className="space-y-3">
        <AnimatePresence>
          {education.map((e, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="group flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <div className="flex-1 relative">
                <Edit
                  ref={i === education.length - 1 ? lastEducationRef : null}
                  value={e}
                  placeholder="Degree, University, Year"
                  onChange={(v) => handleUpdateEducation(i, v)}
                  onBlur={() => handleBlurEducation(i)}
                  className="w-full text-gray-700 py-2 border-b border-gray-100 focus:border-blue-400 transition-colors"
                />
                <button
                  onClick={() => handleRemoveEducation(i)}
                  className="absolute right-0 top-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
};

export default Education;