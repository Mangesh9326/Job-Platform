// server.js (Optimized & Clean)
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import parseResume from "./utils/parseResume.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/user", authRoutes);
app.use("/api/profile", profileRoutes);
console.log("JWT SECRET:", process.env.JWT_SECRET);

// ------------------------------
// File Upload Config
// ------------------------------
const uploadsDir = path.join(__dirname, "uploads");

// Auto-create folder
import fs from "fs";
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer Storage
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ------------------------------
// Upload Route
// ------------------------------
app.post("/api/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = path.join(uploadsDir, req.file.filename);

    // Parse via Python utility
    const parsed = await parseResume(filePath);

    if (!parsed) {
      return res.status(500).json({ message: "Parsing failed" });
    }

    // Convert skills object → array
    const skillsArray = parsed.skills
      ? Object.entries(parsed.skills).map(([n, relevance]) => ({
          name: n.charAt(0).toUpperCase() + n.slice(1),
          relevance,
        }))
      : [];

    const finalData = {
      file: parsed.file || req.file.filename,
      resumeText: parsed.resumeText || "",
      name: parsed.name || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      skills: skillsArray,
      education: parsed.education || [],
      experience_years: parsed.experience_years || 0,
      projects: parsed.projects || [],
      summary: parsed.summary || "",
      ats_score: parsed.ats_score || 0,
      job_match: parsed.job_match || { matched_skills: [], missing_skills: [] },
    };

    return res.json({
      message: "Uploaded & parsed successfully",
      filePath: `/uploads/${req.file.filename}`,
      parsedData: finalData,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({ message: "Server error", detail: String(err) });
  }
});

// Serve static files
app.use("/uploads", express.static(uploadsDir));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));