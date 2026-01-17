import React from "react";
import { FileText, Eye } from "lucide-react";

const FilePreview = ({ previewURL, fileName }) => {
  return (
    <div className="w-full h-full min-h-[350px] bg-gray-50 rounded-2xl border border-gray-200 relative overflow-hidden group">
      
      {/* Header Bar */}
      <div className="absolute top-0 left-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 p-3 flex justify-between items-center z-10">
         <div className="flex items-center gap-2">
            <FileText size={14} className="text-blue-500"/>
            <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{fileName}</span>
         </div>
         <div className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">PREVIEW</div>
      </div>

      {/* The Iframe / Image */}
      {previewURL ? (
        <iframe 
          src={previewURL} 
          className="w-full h-full object-cover pt-10" 
          title="Resume Preview"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
           <Eye size={40} className="mb-2 opacity-50"/>
           <span className="text-sm">Preview Unavailable</span>
        </div>
      )}

      {/* The Scanning Animation Overlay */}
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-20 animate-[scan_3s_linear_infinite]" />
      <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 to-transparent z-10 pointer-events-none" />

    </div>
  );
};

export default FilePreview;