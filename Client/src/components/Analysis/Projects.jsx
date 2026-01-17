import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Edit from "./Edit";

const Projects = ({ projects, update, variants, projOpen, setProjOpen }) => {
  const handleAddProject = (e) => {
    e.stopPropagation();
    update("projects", [
      ...projects,
      { title: "New Project", description: "Describe it...", stack: [] },
    ]);
  };

  const handleUpdateProject = (index, field, value) => {
    const copy = [...projects];
    if (field === "stack") {
      copy[index] = {
        ...copy[index],
        _stackText: value,
        stack: value.split(",").map((s) => s.trim()),
      };
    } else {
      copy[index] = { ...copy[index], [field]: value };
    }
    update("projects", copy);
  };

  const handleRemoveProject = (index) => {
    update("projects", projects.filter((_, idx) => idx !== index));
  };

  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div
        className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setProjOpen(!projOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 bi bi-book" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Projects</h2>
            <p className="text-xs text-gray-500 font-medium">Click to expand/collapse</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:border-purple-300 hover:text-purple-600 transition-all shadow-sm"
            onClick={handleAddProject}
          >
            <Plus size={16} /> Add Project
          </button>
          {projOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
        </div>
      </div>

      <AnimatePresence>
        {projOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-6 space-y-6"
          >
            {(projects.length ? projects : [{}]).map((proj, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative group p-6 rounded-xl border border-gray-200 bg-gray-50/30 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => handleRemoveProject(i)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>

                <div className="mb-4 pr-10">
                  <Edit
                    value={proj.title}
                    placeholder="Project Title"
                    onChange={(v) => handleUpdateProject(i, "title", v)}
                    className="text-lg font-bold text-gray-900 block w-full mb-1"
                  />
                  <Edit
                    value={proj.description}
                    placeholder="Describe the project..."
                    onChange={(v) => handleUpdateProject(i, "description", v)}
                    className="text-gray-600 block w-full leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-100 w-fit">
                  <span className="font-semibold text-gray-400 uppercase text-xs tracking-wider">Tech Stack:</span>
                  <Edit
                    value={proj._stackText ?? (proj.stack || []).join(", ")}
                    placeholder="React, Node, MongoDB"
                    onChange={(v) => handleUpdateProject(i, "stack", v)}
                    className="font-mono text-blue-600"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Projects;