const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = import.meta.env.VITE_API_BASE_URL;
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL;

/**
 * Parses natural language into structured JSON filters using Groq.
 */
export const fetchFiltersFromLLM = async (userText, currentFilters) => {
  const systemPrompt = `
    You are a Strict Job Filter Parser.
    OBJECTIVE: Update "Current Filters" based on "User Input".

    DATA:
    - Current State: ${JSON.stringify(currentFilters)}

    CLASSIFICATION RULES (CRITICAL):
    1. **TYPES:** ONLY allow these exact strings: "full-time", "part-time", "contract", "internship", "remote", "freelance".
       - ⛔ "Frontend", "Developer", "React" are NOT types. Put them in DOMAINS.
    2. **LOCATIONS:** Cities/Countries only (e.g., "Mumbai", "Pune").
       - ⛔ NEVER put numbers or "LPA" in locations.
    3. **DOMAINS:** Job Roles (Frontend, Backend) & Skills (Java, Python).
    4. **SALARY:** Extract numeric value (LPA). "12 LPA" -> 12. "50k" -> 0.5.

    MEMORY & FORMATTING:
    - **Retention:** Start with "Current State". Copy existing values unless changed.
    - **Merging:** If user says "also/and", append values.
    - **Strings:** Lowercase everything.

    REPLY RULES:
    - Natural, conversational summary of the FINAL state.
    - Use **bold** for keywords.
    - Example: "Updated. Showing **Full-time** **Frontend** roles in **Mumbai**."

    OUTPUT JSON ONLY:
    {
      "locations": ["string"],
      "domains": ["string"],
      "salary": number,
      "types": ["string"],
      "seniority": ["string"],
      "reply": "string"
    }
  `;

  try {
    console.log("🚀 [GROQ] Sending Filter Request...");
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `User Input: "${userText}"` }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" } // Forces pure JSON
      }),
    });

    const data = await response.json();
    let jsonStr = data.choices[0].message.content; // Groq specific response path
    
    let result = JSON.parse(jsonStr);

    // --- JAVASCRIPT SANITIZATION ---
    const ALLOWED_TYPES = ["full-time", "part-time", "contract", "internship", "remote", "freelance"];

    if (result.types && result.types.length > 0) {
      const validTypes = [];
      const invalidTypes = [];
      result.types.forEach(t => {
        const lowerT = t.toLowerCase();
        if (ALLOWED_TYPES.includes(lowerT)) validTypes.push(lowerT);
        else invalidTypes.push(lowerT);
      });
      result.types = validTypes;
      if (invalidTypes.length > 0) result.domains = [...(result.domains || []), ...invalidTypes];
    }

    if (result.locations) {
      result.locations = result.locations.filter(loc => {
          const lower = loc.toLowerCase();
          return !lower.match(/\d/) && !lower.includes('lpa') && !lower.includes('salary');
      });
    }

    result.locations = [...new Set(result.locations)];
    result.domains = [...new Set(result.domains)];
    result.types = [...new Set(result.types)];
    result.seniority = [...new Set(result.seniority)];
    
    console.log("✅ [GROQ] Sanitized Result:", result);
    return result;

  } catch (error) {
    console.warn("❌ [GROQ] Error:", error);
    return null;
  }
};
// ==========================================
// 🧠 PERSISTENT LOCAL STORAGE CACHE
// ==========================================

// Helper function to turn a massive JD into a tiny, unique ID (e.g., "jd_cache_148392")
const generateHashKey = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `jd_cache_${hash}`;
};

/**
 * Extracts a clean array of required skills from a raw Job Description text using Groq.
 */
export const extractSkillsFromJD = async (jobDescription) => {
  // 1. Normalize text and generate a unique hash key
  const normalizedJD = jobDescription.trim().toLowerCase();
  const cacheKey = generateHashKey(normalizedJD);

  // 2. Check LOCAL STORAGE before calling the API
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    console.log("⚡CACHE HIT");
    return JSON.parse(cachedData); // Convert the string back into an array
  }

  const prompt = `
    You are a strict data extraction AI.
    Analyze this Job Description and extract ONLY technical skills (languages, frameworks, tools, databases).

    JD: """${jobDescription}"""

    CRITICAL RULES:
    1. Output ONLY a plain JSON array of strings. NO objects.
    2. Example: ["javascript", "react", "node.js", "mongodb"]
    3. DO NOT repeat the job description.
    4. DO NOT write explanations, notes, or introductory text.
    5. SEPARATE compound skills (e.g., "Node and Express" -> ["node", "express"]).
  `;

  try {
    console.log("🚀 [GROQ MISS] Analyzing new JD...");
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
        temperature: 0.1
      }),
    });

    const data = await response.json();
    let jsonStr = data.choices[0].message.content.trim();

    jsonStr = jsonStr.replace(/```json/gi, "").replace(/```/g, "").trim();

    const startIdx = Math.min(
      jsonStr.indexOf("[") === -1 ? Infinity : jsonStr.indexOf("["),
      jsonStr.indexOf("{") === -1 ? Infinity : jsonStr.indexOf("{")
    );
    const endIdx = Math.max(jsonStr.lastIndexOf("]"), jsonStr.lastIndexOf("}"));

    if (startIdx !== Infinity && endIdx !== -1) {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);
    }

    let parsedData;
    
    try {
      parsedData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.warn("⚠️ [GROQ] JSON Parse failed. Attempting Regex Recovery...");
      const stringMatches = jsonStr.match(/"([^"]+)"/g);
      if (stringMatches) {
        parsedData = stringMatches.map(match => match.replace(/"/g, ""));
      } else {
        parsedData = [];
      }
    }

    let rawArray = [];

    if (Array.isArray(parsedData)) {
        rawArray = parsedData;
    } else if (typeof parsedData === 'object' && parsedData !== null) {
        const foundArray = Object.values(parsedData).find(val => Array.isArray(val));
        if (foundArray) {
            rawArray = foundArray;
        } else {
            rawArray = Object.keys(parsedData);
        }
    }

    const finalSkills = [];
    
    rawArray.forEach(item => {
        let textToProcess = "";
        
        if (typeof item === 'string') {
            textToProcess = item;
        } else if (typeof item === 'object' && item !== null) {
            textToProcess = Object.values(item).find(val => typeof val === 'string') || "";
        }

        if (textToProcess) {
            const splitSkills = textToProcess.split(/(?:,|\s+and\s+|\s+or\s+|\s*&\s*)/i);
            
            splitSkills.forEach(s => {
                const cleanSkill = s.trim().toLowerCase();
                
                if (
                    cleanSkill.length > 1 && 
                    cleanSkill.length <= 30 && 
                    !cleanSkill.includes('note:') &&
                    !cleanSkill.includes('(') &&
                    !cleanSkill.includes('}')
                ) {
                    finalSkills.push(cleanSkill);
                }
            });
        }
    });

    const trashWords = ["technical skills", "required", "skills", "true", "false", "none", "null"];
    const filteredSkills = [...new Set(finalSkills)].filter(
      (s) => !trashWords.includes(s)
    );

    // console.log("✅ [GROQ] Final Extracted Skills:", filteredSkills);
    
    // 3. Save the result to LOCAL STORAGE so it survives a refresh!
    localStorage.setItem(cacheKey, JSON.stringify(filteredSkills));

    return filteredSkills;

  } catch (error) {
    console.error("❌ [GROQ Extraction Error]:", error);
    return [];
  }
};