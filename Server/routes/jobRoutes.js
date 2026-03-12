import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read jobs (If using JSON file)
const getJobs = () => {
  try {
    // Adjust path to where your jobs.json is located
    const data = fs.readFileSync(path.join(__dirname, "../../client/public/data/jobs.json"), "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// GET Single Job by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const jobs = getJobs();
  
  // Find job (Handle both string/number ID mismatch)
  // Adjust logic if you are using MongoDB (e.g., await Job.findById(id))
  const job = jobs.find((j, index) => (index + 1).toString() === id || j.id === id);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  // Simulate a delay for loading effect (Optional, remove in production)
  setTimeout(() => {
    res.json({
      ...job,
      // Add mock detail fields if they don't exist in JSON
      description: job.description || "We are seeking a talented individual to join our team...",
      responsibilities: job.responsibilities || [
        "Collaborate with cross-functional teams to define, design, and ship new features.",
        "Work on bug fixing and improving application performance.",
        "Continuously discover, evaluate, and implement new technologies."
      ],
      requirements: job.requirements || [
        "BS/MS degree in Computer Science, Engineering or a related subject.",
        "Proven software development experience and Android skills development.",
        "Experience with third-party libraries and APIs."
      ],
      benefits: ["Health Insurance", "Remote Options", "401k Matching", "Stock Options"]
    });
  }, 500); 
});

export default router;