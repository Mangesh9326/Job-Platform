import React from "react";
import { motion } from "framer-motion";
import Edit from "./Edit";

const PersonalInfo = ({ name, email, phone, update, variants }) => {
  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 font-medium">
        Click to edit
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 bi bi-person" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Profile</h3>

        <div className="space-y-3 w-full">
          <div className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Edit value={name} placeholder="Your Name" onChange={(v) => update("name", v)} className="text-xl font-bold text-gray-900 block" />
          </div>
          <div className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Edit value={email} placeholder="email@example.com" onChange={(v) => update("email", v)} className="text-gray-600 block" />
          </div>
          <div className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Edit value={phone} placeholder="+1 234 567 890" onChange={(v) => update("phone", v)} className="text-gray-600 block" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalInfo;