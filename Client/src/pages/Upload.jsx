import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Components
import UploadBox from "../components/Upload/UploadBox";
import FilePreview from "../components/Upload/FilePreview";
import UploadButton from "../components/Upload/UploadButton";
import ProgressBar from "../components/Upload/ProgressBar";
import ProcessSteps from "../components/Upload/ProcessSteps";
import UploadBenefits from "../components/Upload/UploadBenefits";

// --- 1. CONFIGURATION & VALIDATION ---
const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const validateFile = (file) => {
  if (!file) return { ok: false, msg: "No file selected" };
  if (!allowedTypes.includes(file.type))
    return { ok: false, msg: "Only PDF / DOC / DOCX allowed" };
  if (file.size > MAX_SIZE) return { ok: false, msg: "Max size 10MB" };
  return { ok: true };
};

// --- 2. BACKEND UPLOAD LOGIC (Restored) ---
const uploadResume = ({
  file,
  setUploading,
  setProgress,
  setVisualProgress,
  setServerDone,
  navigate,
  toast,
}) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    setProgress(0);
    setVisualProgress(0);
    setServerDone(false);

    const xhr = new XMLHttpRequest();

    // Track progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
        setVisualProgress(Math.min(percent, 90)); // stop UI at 90% until server responds
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);

        if (!xhr.status.toString().startsWith("2")) {
          toast.error(data.message || "Upload error");
          setUploading(false);
          reject();
          return;
        }

        setServerDone(true);

        // Smooth fill to 100%
        const smooth = setInterval(() => {
          setVisualProgress((previous) => {
            if (previous >= 100) {
              clearInterval(smooth);
              setUploading(false);

              setTimeout(() => {
                navigate("/analysis", { state: { parsedData: data.parsedData } });
              }, 500);

              resolve();
              return 100;
            }
            return previous + 5;
          });
        }, 50);
      } catch (err) {
        toast.error("Invalid server response");
        setUploading(false);
        reject();
      }
    };

    xhr.onerror = () => {
      toast.error("Network error");
      setUploading(false);
      reject();
    };

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  });
};

const Upload = () => {
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // backend progress
  const [visualProgress, setVisualProgress] = useState(0); // smooth UI progress
  const [serverDone, setServerDone] = useState(false);

  const inputRef = useRef();
  const navigate = useNavigate();

  // Generate preview
  useEffect(() => {
    if (!file) {
      setPreviewURL(null);
      return;
    }
    if (file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewURL(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Handle File Selection
  const handleFile = (f) => {
    const result = validateFile(f);
    if (!result.ok) return toast.error(result.msg);
    setFile(f);
    toast.success("File attached successfully");
  };

  // Trigger Upload
  const startUpload = () =>
    uploadResume({
      file,
      setUploading,
      setProgress,
      setVisualProgress,
      setServerDone,
      navigate,
      toast,
    });

  return (
    <div className="min-h-screen pt-14 md:pt-24 pb-20 bg-[#f8fafc] overflow-x-hidden relative">
      <Toaster position="top-right" />

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-blue-50 to-transparent -z-10" />
      <div className="absolute top-40 right-[-100px] w-96 h-96 bg-purple-200/30 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-40 left-[-100px] w-96 h-96 bg-blue-200/30 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left Column: Context & Benefits */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
              <img src="./img/activity.svg" className="w-4 h-4" alt="" />AI Engine v2.0 Active
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              Unlock Your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                Career Potential
              </span>
            </h1>

            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Our advanced AI analyzes your resume against millions of job descriptions to give you a competitive edge.
            </p>

            <div className="flex items-center gap-6 text-sm font-medium text-gray-500 border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2">
                {/* <ShieldCheck className="text-green-500" size={18} /> */}
                <img src="./img/shield-check.svg" className="w-4 h-4" alt="" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                {/* <Users className="text-blue-500" size={18} /> */}
                <img src="./img/people.svg" className="w-4 h-4" alt="" />
                <span>10k+ Users</span>
              </div>
            </div>
          </motion.div>

          <UploadBenefits />
        </div>

        {/* Right Column: Interaction Zone */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white/50 backdrop-blur-xl p-8 md:p-10 relative"
          >
            {/* Steps Visualizer */}
            <ProcessSteps currentStep={uploading ? 2 : file ? 1 : 0} />

            <div className="mt-10 min-h-fit">
              {!uploading ? (
                <div className="grid grid-cols-1 gap-8">
                  <AnimatePresence mode="wait">
                    {!file ? (
                      <motion.div
                        key="upload-box"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <UploadBox
                          file={file}
                          dragActive={dragActive}
                          setDragActive={setDragActive}
                          handleFile={handleFile}
                          inputRef={inputRef}
                          setFile={setFile}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="preview-box"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-8" // 1. Main container is now a column
                      >

                        {/* Top Row: Sidebar & Preview */}
                        <div className="flex flex-col md:flex-row gap-6">

                          {/* Mini Upload Box (Change File) */}
                          <div className="w-full md:w-1/5 order-2 md:order-1">
                            <UploadBox
                              file={file}
                              dragActive={dragActive}
                              setDragActive={setDragActive}
                              handleFile={handleFile}
                              inputRef={inputRef}
                              setFile={setFile}
                            />
                          </div>

                          {/* Preview */}
                          <div className="w-full md:w-4/5 order-1 md:order-2">
                            <FilePreview previewURL={previewURL} fileName={file.name} />
                          </div>
                        </div>

                        {/* Bottom Row: Centered Button */}
                        <div className="flex justify-center w-full">
                          <div className="w-full max-w-sm"> {/* max-w-sm keeps the button from being too wide */}
                            <UploadButton uploading={uploading} startUpload={startUpload} />
                          </div>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <ProgressBar visualProgress={visualProgress} />
              )}
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
};
export default Upload;