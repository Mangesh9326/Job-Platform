// server/routes/profileRoutes.js
import express from "express";
import UserProfile from "../models/UserProfile.js";

const router = express.Router();

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

export default router;