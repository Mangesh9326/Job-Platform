import React, { useState } from "react";
import { UploadCloud, Loader2, Zap, FileText, X, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const UploadSection = ({ file, setFile, isAnalyzing, onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        toast.error("Please upload a valid PDF file."); 
      }
    }
  };

  const removeFile = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents triggering the file upload dialog
    setFile(null);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 text-center transition-all relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-50/50 blur-3xl -z-10 rounded-full"></div>

      {/* Dropzone Area */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center transition-all duration-300 ${
          isDragging 
            ? "border-indigo-500 bg-indigo-50/80 scale-[1.02] shadow-inner" 
            : file 
              ? "border-green-400 bg-green-50/30" 
              : "border-gray-300 hover:bg-gray-50 hover:border-indigo-400"
        }`}
      >
        {file ? (
          // ==========================================
          // SUCCESS STATE: File Selected
          // ==========================================
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300 w-full">
            <div className="relative">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-green-100">
                <FileText className="h-10 w-10 text-green-600" />
              </div>
              <div className="absolute bottom-3 -right-2 bg-green-500 text-white rounded-full p-1 border-2 border-white shadow-sm">
                <CheckCircle size={16} />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 truncate max-w-[250px] sm:max-w-xs mb-1">
              {file.name}
            </h3>
            <p className="text-sm text-green-600 font-medium mb-6">
              PDF Document • Ready for analysis
            </p>

            <button
              onClick={removeFile}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              <X size={16} /> Remove File
            </button>
          </div>
        ) : (
          // ==========================================
          // EMPTY STATE: Waiting for Upload
          // ==========================================
          <div className="flex flex-col items-center w-full">
            <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragging ? "bg-indigo-100" : "bg-gray-100"}`}>
              <UploadCloud className={`h-10 w-10 transition-colors ${isDragging ? "text-indigo-600 animate-pulse" : "text-gray-500"}`} />
            </div>
            
            <p className="text-gray-800 text-lg font-bold mb-2">
              {isDragging ? "Drop it here!" : "Drag & drop your resume"}
            </p>
            <p className="text-gray-400 text-sm mb-8 font-medium">
              Only PDF formats are supported
            </p>
            
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  if (e.target.files[0].type === "application/pdf") {
                    setFile(e.target.files[0]);
                  } else {
                    toast.error("Please upload a valid PDF file.");
                  }
                }
              }} 
              className="hidden" 
              id="resume-upload" 
            />
            <label 
              htmlFor="resume-upload" 
              className="cursor-pointer bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-sm flex items-center gap-2 active:scale-95"
            >
              Browse Files
            </label>
          </div>
        )}
      </div>
      
      {/* Analyze Button */}
      <button 
        onClick={onUpload}
        disabled={isAnalyzing}
        className={`mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all shadow-lg text-lg bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 ${
          isAnalyzing 
            ? "bg-indigo-400 cursor-not-allowed shadow-none" 
            : ""
        }`}
      >
        {isAnalyzing ? (
          <><Loader2 className="animate-spin" size={22} /> Analyzing Market Data...</>
        ) : (
          <><Zap size={22} className={file ? "text-yellow-300" : "text-gray-400"} /> Analyze My Resume</>
        )}
      </button>

      {/* Microcopy below button */}
      <p className="mt-4 text-xs font-medium text-gray-400">
        Secure & private. We do not store your data.
      </p>
    </div>
  );
};

export default UploadSection;