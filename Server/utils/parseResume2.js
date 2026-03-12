import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import crypto from "crypto"; // 🚀 Added for generating a unique fingerprint of the text

// Safely import the CommonJS pdf-parse module into our ES Module environment
const require = createRequire(import.meta.url);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GROQ_API_KEY = process.env.GROQ_API_KEY; 
const GROQ_API_URL = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"; 

// ==========================================
// 🧠 SERVER-SIDE IN-MEMORY CACHE
// ==========================================
// This will survive frontend browser refreshes!
const resumeCache = new Map();

// 1. Helper to extract text via Python's pdfplumber
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
          console.error("❌ Python pdfplumber Execution Failed:", err);
          return resolve(null);
        }
        if (stderr) {
          console.warn("⚠️ Python Warning:", stderr);
        }
        resolve(stdout.trim());
      });
    } else {
      console.error("❌ Unsupported file format.");
      resolve(null);
    }
  });
};

export default async function parseResume(filePath) {
  // 1. Extract text from the physical file
  const resumeText = await extractTextFromFile(filePath);
  
  if (!resumeText) {
    console.error("❌ Could not read text from the resume file.");
    return null;
  }

  // 🚀 2. CREATE FINGERPRINT & CHECK CACHE
  // We hash the text so that even if the filename changes, if the text is identical, it hits the cache!
  const textFingerprint = crypto.createHash('sha256').update(resumeText).digest('hex');

  if (resumeCache.has(textFingerprint)) {
    console.log("⚡ [CACHE HIT] Resume already parsed! Returning instant results from Node Cache.");
    return resumeCache.get(textFingerprint);
  }

  // 3. Hyper-Specific Prompt matching your exact schema
  const prompt = `
    You are an expert ATS (Applicant Tracking System) AI. 
    Analyze the following resume text and extract the details into a STRICT JSON object.

    Resume Text:
    """${resumeText}"""

    CRITICAL RULES:
    1. Output ONLY a valid JSON object. Do not include markdown tags like \`\`\`json.
    2. Format the output EXACTLY matching this structure:
    {
      "name": "Full Name or null",
      "email": "email address or null",
      "phone": "phone number or null",
      "skills": [
        { "name": "SkillName1", "relevance": 100 },
        { "name": "SkillName2", "relevance": 90 }
      ],
      "education": [
        "- (Degree Name) College or University Name, Percentage (Year)",
        "- Another Degree Details"
      ],
      "experience_years": 0, // Extract or estimate total years of experience as an integer
      "projects": [
        {
          "title": "Project Title",
          "description": "A detailed sentence explaining what the project does.",
          "language_used": "Comma, separated, string, of, technologies, used",
          "stack": ["lowercase_tech1", "lowercase_tech2"] // An array of the technologies used
        }
      ],
      "summary": "A professional summary of the candidate.",
      "ats_score": 85, // Estimate a general ATS score out of 100 based on detail and skills
      "job_match": { "matched_skills": [], "missing_skills": [] }
    }
  `;

  try {
    console.log("🚀 [GROQ MISS] Sending Resume Text for Parsing...");
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" } 
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("❌ Groq API Error:", data.error);
      return null;
    }

    let jsonStr = data.choices[0].message.content.trim();
    
    // Parse the Groq output
    const parsedData = JSON.parse(jsonStr);
    
    // Attach the raw text in case your frontend needs it
    parsedData.resumeText = resumeText;
    
    console.log("✅ [GROQ] Resume Parsed Successfully!");

    // 🚀 4. SAVE TO CACHE BEFORE RETURNING
    resumeCache.set(textFingerprint, parsedData);

    return parsedData;

  } catch (error) {
    console.error("❌ [GROQ Parse Error]:", error);
    return null;
  }
}