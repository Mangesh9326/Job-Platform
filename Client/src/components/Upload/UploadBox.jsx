import React from "react";
import { UploadCloud, FileType, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const UploadBox = ({ file, dragActive, setDragActive, handleFile, inputRef, setFile, uploading }) => {
  
  // Compact Mode (When file is already selected)
  if (file) {
      return (
        <div 
          onClick={() => setFile(null)}
          className="w-full p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-white hover:border-red-300 hover:text-red-500 cursor-pointer transition-all flex flex-col items-center text-center justify-center gap-2 text-gray-400 h-full min-h-[150px]"
        >
            <RotateCcw size={24} />
            <span className="text-sm font-bold">Change File</span>
        </div>
      )
  }

  // Hero Mode (Default)
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`relative rounded-4xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border-2 border-dashed h-[400px]
        ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50/50 hover:bg-white hover:border-blue-400 hover:shadow-xl"}
      `}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current.click()}
    >
      <input ref={inputRef} type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => handleFile(e.target.files[0])} />

      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
         <UploadCloud size={40} />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800">Drag & drop your resume</h3>
      <p className="text-gray-500 mt-2">or click to browse files</p>
      
      <div className="flex gap-3 mt-8">
         <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-500 flex items-center gap-1">
            <FileType size={12}/> PDF
         </span>
         <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-500 flex items-center gap-1">
            <FileType size={12}/> DOCX
         </span>
      </div>
    </motion.div>
  );
};

export default UploadBox;