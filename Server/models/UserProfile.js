// server/models/UserProfile.js
import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // One profile per user
  },
  fullName: { type: String, default: "" },
  username: { type: String, default: "" },
  email: { type: String, default: "" }, // Primary email
  emails: [{ type: String }], // Additional emails
  phones: [{ type: String }],
  gender: { type: String, default: "Male" },
  location: { type: String, default: "" },
  profilePic: { type: String, default: "" },

  // Education Section
  education: [
    {
      degree: String,
      score: String,
      scoreType: String, // CGPA, Percentage, etc.
      year: String,
    },
  ],

  // Experience Section
  totalExperience: { type: String, default: "" },
  experiences: [
    {
      company: String,
      role: String,
      duration: String,
      location: String,
    },
  ],

  // Domains (Nested Complex Data)
  domains: [
    {
      id: Number,
      name: String,
      sections: {
        languages: [String],
        frameworks: [String],
        projects: [
          {
            id: Number,
            title: String,
            description: String,
            stack: String,
          },
        ],
        experience: [String],
        certifications: [String],
      },
    },
  ],
}, { timestamps: true });

export default mongoose.model("UserProfile", UserProfileSchema);