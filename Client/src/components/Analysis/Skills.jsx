import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import Edit from "./Edit";

const Skills = ({ skills, update, variants, lastSkillRef }) => {
  const handleAddSkill = () => {
    const normalized = skills.map((s) => ({ name: s.name || s }));
    update("skills", [...normalized, { name: "" }]);
    setTimeout(() => lastSkillRef.current?.focus(), 0);
  };

  const handleUpdateSkill = (index, value) => {
    const copy = skills.map((x) => ({ name: x.name || x }));
    copy[index].name = value;
    update("skills", copy);
  };

  const handleBlurSkill = (index) => {
    const trimmed = (skills[index]?.name || "").trim();
    if (!trimmed) {
      handleRemoveSkill(index);
    }
  };

  const handleRemoveSkill = (index) => {
    const filtered = skills.filter((_, idx) => idx !== index);
    update("skills", filtered);
  };

  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 bi bi-lightbulb" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-800">Skills</h3>
        </div>
        <button
          onClick={handleAddSkill}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      <ul className="flex flex-wrap gap-2 overflow-y-auto max-h-[250px] custom-scrollbar">
        <AnimatePresence>
          {skills.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="relative group bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 flex items-center"
            >
              <Edit
                ref={i === skills.length - 1 ? lastSkillRef : null}
                value={s.name}
                placeholder="Skill..."
                onChange={(v) => handleUpdateSkill(i, v)}
                onBlur={() => handleBlurSkill(i)}
                className="text-sm font-medium text-gray-700 min-w-[60px]"
              />
              <button
                onClick={() => handleRemoveSkill(i)}
                className="absolute right-1 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
};

export default Skills;