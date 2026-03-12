// server/routes/profileRoutes.js
import express from "express";
import UserProfile from "../models/UserProfile.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";



const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get all jobs (Mimicking a DB)
const getAllJobs = () => {
  try {
    // 1. Construct Path (Adjust if your folder structure is different)
    // Assuming structure: /server/routes/profileRoutes.js -> needs to go to /client/public/data/jobs.json
    const jsonPath = path.join(__dirname, "../../Client/public/data/jobs.json"); 
    

    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, "utf-8");
      const jobs = JSON.parse(data);

      // 2. ✅ CRITICAL FIX: Ensure every job has an ID
      // If job.id is missing, use (index + 1) as the ID (as string)
      return jobs.map((job, index) => ({
        ...job,
        id: job.id ? String(job.id) : String(index + 1)
      }));
    } else {
      console.error("❌ jobs.json file not found at path");
      return [];
    }
  } catch (err) {
    console.error("❌ Error reading jobs file:", err);
    return [];
  }
};

// GET ALL PROFILES FOR RECRUITER DASHBOARD
router.get('/all', async (req, res) => {
    try {
        // Find all profiles. Adjust 'Profile' if your mongoose model has a different name
        const profiles = await UserProfile.find({}); 
        res.json(profiles);
    } catch (error) {
        console.error("Error fetching all profiles:", error);
        res.status(500).json({ error: "Failed to fetch profiles" });
    }
});


// 1. GET Profile by User ID
router.get("/:userId", async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.params.userId });
    
    if (!profile) {
      // If no profile exists yet, send null (Frontend will show empty state)
      return res.status(200).json(null);
    }
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 2. SAVE or UPDATE Profile
router.post("/save", async (req, res) => {
  const { userId, ...data } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // findOneAndUpdate with upsert: true
    // This creates the profile if it doesn't exist, or updates it if it does.
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: userId },
      { $set: data },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: "Profile saved!", profile: updatedProfile });
  } catch (err) {
    console.error("Save Error:", err);
    res.status(500).json({ message: "Failed to save", error: err.message });
  }
});

// 3. TOGGLE SAVED JOB (Add or Remove)
router.post("/toggle-saved-job", async (req, res) => {
  const { userId, jobId } = req.body;

  if (!userId || !jobId) {
    return res.status(400).json({ message: "User ID and Job ID are required" });
  }

  try {
    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Convert jobId to string to ensure consistent comparison
    const idStr = String(jobId);
    
    // Check if job is already saved
    const index = profile.savedJobs.indexOf(idStr);

    let isSaved = false;

    if (index === -1) {
      // Not found -> Add it
      profile.savedJobs.push(idStr);
      isSaved = true;
    } else {
      // Found -> Remove it
      profile.savedJobs.splice(index, 1);
      isSaved = false;
    }

    await profile.save();

    res.json({ 
      success: true, 
      isSaved: isSaved, 
      message: isSaved ? "Job saved" : "Job removed" 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 4. Get Populated Saved Jobs
router.get("/:userId/saved-jobs", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 1. Get User's Saved IDs from DB
    const profile = await UserProfile.findOne({ userId });

    if (!profile || !profile.savedJobs || profile.savedJobs.length === 0) {
      return res.json([]); 
    }

    // 2. Get All Jobs Data (with IDs fixed)
    const allJobs = getAllJobs();

    // 3. Filter to find matching jobs
    const savedJobDetails = allJobs.filter(job => 
      profile.savedJobs.includes(String(job.id))
    );
    
    res.json(savedJobDetails);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;