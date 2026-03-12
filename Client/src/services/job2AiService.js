/**
 * Handles communication with the local Ollama instance (Llama 3).
 * Parses natural language into structured JSON filters.
 */
export const fetchFiltersFromLLM = async (userText, currentFilters) => {
  const prompt = `
    System: You are a Strict Job Filter Parser.
    OBJECTIVE: Update "Current Filters" based on "User Input".

    DATA:
    - Current State: ${JSON.stringify(currentFilters)}
    - User Input: "${userText}"

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
    console.log("[LLM] Sending Request...");
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt: prompt,
        stream: false,
        format: "json",
        options: { temperature: 0.1 }
      }),
    });

    const data = await response.json();
    console.log("[LLM] Raw Response:", data.response);
    
    let jsonStr = data.response;
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1) jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);

    let result = JSON.parse(jsonStr);

    // --- JAVASCRIPT SANITIZATION ---
    const ALLOWED_TYPES = ["full-time", "part-time", "contract", "internship", "remote", "freelance"];

    // A. Fix Misclassified Types
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

    // B. Fix Misclassified Locations
    if (result.locations) {
      result.locations = result.locations.filter(loc => {
          const lower = loc.toLowerCase();
          return !lower.match(/\d/) && !lower.includes('lpa') && !lower.includes('salary');
      });
    }

    // C. Deduplicate
    result.locations = [...new Set(result.locations)];
    result.domains = [...new Set(result.domains)];
    result.types = [...new Set(result.types)];
    result.seniority = [...new Set(result.seniority)];
    
    console.log("[LLM] Sanitized Result:", result);
    return result;

  } catch (error) {
    console.warn("[LLM] Error:", error);
    return null;
  }
};


/**
 * Extracts a clean array of required skills from a raw Job Description text.
 */
export const extractSkillsFromJD = async (jobDescription) => {
  const prompt = `
    Analyze this Job Description and extract individual technical skills (languages, frameworks, tools, databases).

    JD: "${jobDescription}"

    STRICT RULES:
    1. Output ONLY a plain JSON array of strings.
    2. SEPARATE compound skills. If the text says "JavaScript and TypeScript" or "SQL or PostgreSQL", split them into separate array items.
    3. Example Output: ["javascript", "typescript", "react", "next.js", "node.js", "express", "sql", "postgresql", "tailwind css", "mongodb"]
    4. Do NOT wrap it in an object like {"skills": [...]}.
    5. Do NOT include counts, explanations, or soft skills.
  `;

  try {
    console.log("[LLM] Analyzing JD...");
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt: prompt,
        stream: false,
        format: "json", 
        options: { temperature: 0.1 }
      }),
    });

    const data = await response.json();
    let jsonStr = data.response.trim();

    // Strip markdown formatting if the LLM hallucinated it
    jsonStr = jsonStr.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Isolate the JSON array or object
    const startIdx = Math.min(
      jsonStr.indexOf("[") === -1 ? Infinity : jsonStr.indexOf("["),
      jsonStr.indexOf("{") === -1 ? Infinity : jsonStr.indexOf("{")
    );
    const endIdx = Math.max(jsonStr.lastIndexOf("]"), jsonStr.lastIndexOf("}"));

    if (startIdx !== Infinity && endIdx !== -1) {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);
    }

    const parsedData = JSON.parse(jsonStr);
    const finalSkills = [];
    
    // ✅ NEW FIX: The Recursive Splitter
    // This searches deep inside the JSON and forces "node and express" to become ["node", "express"]
    const extractStrings = (input) => {
      if (typeof input === 'string' && input.length > 1 && !input.includes('{')) {
        // Regex splits the string on words like "and", "or", "&", "/", or commas
        const splitSkills = input.split(/(?:,|\s+and\s+|\s+or\s+|\s*&\s*|\s*\/\s*)/i);
        
        splitSkills.forEach(s => {
            const cleanSkill = s.trim().toLowerCase();
            if (cleanSkill.length > 1) {
                finalSkills.push(cleanSkill);
            }
        });
      } else if (Array.isArray(input)) {
        input.forEach(extractStrings);
      } else if (typeof input === 'object' && input !== null) {
        Object.values(input).forEach(extractStrings);
      }
    };

    extractStrings(parsedData);

    // Filter out common LLM hallucinated words
    const trashWords = ["technical skills", "required", "skills", "true", "false"];
    const filteredSkills = [...new Set(finalSkills)].filter(
      (s) => s.length > 1 && !trashWords.includes(s)
    );

    console.log("[LLM] Final Extracted Skills:", filteredSkills);
    return filteredSkills;

  } catch (error) {
    console.error("[LLM Extraction Error]:", error);
    return [];
  }
};