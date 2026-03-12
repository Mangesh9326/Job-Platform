import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { execFile } from "child_process";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GROQ_API_KEY = process.env.GROQ_API_KEY; 
const GROQ_API_URL = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"; 

// 1. Helper to extract text via Python's pdfplumber (Same as your parser)
const extractTextFromFile = (filePath) => {
  return new Promise((resolve) => {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === ".txt") {
      try {
        resolve(fs.readFileSync(filePath, "utf8"));
      } catch (err) {
        console.error("❌ TXT Read Error:", err);
        resolve(null);
      }
    } else if (ext === ".pdf") {
      const pythonScriptPath = path.join(__dirname, "../python/extract_text.py");
      
      execFile("python", [pythonScriptPath, filePath], { 
        maxBuffer: 1024 * 1024 * 10,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" } 
      }, (err, stdout, stderr) => {
        if (err) {
          console.error("❌ Python Execution Failed:", err);
          return resolve(null);
        }
        resolve(stdout.trim());
      });
    } else {
      resolve(null);
    }
  });
};

export default async function analyzeMarket(filePath) {
  const resumeText = await extractTextFromFile(filePath);
  
  if (!resumeText) {
    console.error("❌ Could not read text from the resume file.");
    return null;
  }

  // 2. Career Coach Prompt
  const prompt = `
    You are an Expert Tech Recruiter, Career Coach, and ATS Algorithm.
    Analyze the following resume text and provide a market analysis for the candidate.

    Resume Text:
    """${resumeText}"""

    CRITICAL RULES:
    1. Output ONLY a valid JSON object. Do not include markdown tags like \`\`\`json.
    2. Estimate the salary strictly in Indian Rupees (INR) using "LPA" (e.g., "₹8 LPA - ₹12 LPA"). Base this on their tech stack and estimated years of experience.
    3. Generate 3 highly specific, actionable improvements based on the EXACT projects or formatting in their resume.
    4. Provide 5 missing high-value keywords/technologies they should learn based on their current trajectory (e.g., if they know React, suggest Next.js or TypeScript).
    5. Format the output EXACTLY matching this structure:
    {
      "ats_score": 78,
      "market_value": "₹X LPA - ₹Y LPA",
      "seniority": "Entry-Level / Mid-Level / Senior",
      "market_demand": "High / Moderate / Very High",
      "best_roles": [
        { "title": "Exact Job Title 1", "match": 95 },
        { "title": "Exact Job Title 2", "match": 85 }
      ],
      "strong_skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
      "missing_keywords": ["Keyword1", "Keyword2", "Keyword3", "Keyword4", "Keyword5"],
      "soft_skills": ["SoftSkill1", "SoftSkill2", "SoftSkill3"],
      "recommended_certifications": ["Cert 1", "Cert 2"],
      "format_ats_suggestions": [
        "Use a single-column layout to ensure ATS parsers can read your experience chronologically.",
        "Remove graphics or icons that might confuse the ATS."
      ],
      "improvements": [
        "Actionable tip 1 mentioning specific resume content",
        "Actionable tip 2 mentioning specific resume content"
      ],
    }
  `;

  try {
    console.log("🚀 [GROQ] Generating Market Analysis...");
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2, // Slightly higher temperature for more creative feedback
        response_format: { type: "json_object" } 
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("❌ Groq API Error:", data.error);
      return null;
    }

    let jsonStr = data.choices[0].message.content.trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("❌ [GROQ Market Analysis Error]:", error);
    return null;
  }
}