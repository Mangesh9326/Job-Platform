import React from "react";
import { motion } from "framer-motion";
import { Zap, Loader2 } from "lucide-react";

const UploadButton = ({ uploading, startUpload }) => {
  return (
    <motion.button
      onClick={startUpload}
      disabled={uploading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full group relative flex items-center justify-center gap-2 px-6 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-blue-200 hover:shadow-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {uploading ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Zap size={20} className="fill-white" />
          Analyze Now
        </>
      )}
    </motion.button>
  );
};

export default UploadButton;