import re
import sys
import json
import spacy
import requests
import pdfplumber
from datetime import datetime
from collections import Counter

# Load spaCy
nlp = spacy.load("en_core_web_sm")

# ---------------------------------------------------
# OLLAMA LLM CLIENT
# ---------------------------------------------------
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3:8b"

def ollama_call(prompt, temperature=0.1):
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "temperature": 0.1,
        "stream": False,
        "options": {
            "num_ctx": 4096,
            "num_predict": 350,
            "num_thread": 8
        }
    }
    res = requests.post(OLLAMA_URL, json=payload, timeout=120)
    res.raise_for_status()
    return res.json()["response"]

def safe_json_load(raw):
    # Extract JSON object
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found")

    raw = raw[start:end + 1]

    # Normalize quotes
    raw = raw.replace("“", '"').replace("”", '"').replace("’", "'")

    # Remove invalid control characters FIRST
    raw = re.sub(r"[\x00-\x1F\x7F]", "", raw)

    # Fix trailing commas
    raw = re.sub(r",\s*([}\]])", r"\1", raw)

    # Fix unescaped backslashes
    raw = re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', raw)

    return json.loads(raw)



# ---------------------------------------------------
# LLM RESUME EXTRACTION (FORMAT-AGNOSTIC)
# ---------------------------------------------------
def llm_extract_resume(text):
    prompt = f"""
You are a resume parser.

Return ONLY valid JSON.
NO markdown.
NO explanation.
NO extra text.

STRICT SCHEMA:
{{
  "name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "experience_years": 0,
  "experience": [
  {
    "role": "",
    "duration": ""
  }
  ],
  "education": [],
  "projects": [
    {{
      "title": "",
      "description": "",
      "tech_stack": []
    }}
  ]
}}

Rules:
- Titles must NOT include words like "Title:"
- Arrays only (no objects inside skills)
- Use double quotes only
- Escape all newlines
- If missing data, return empty values

Resume Text:
\"\"\"{text[:4000]}\"\"\"
"""
    raw = ollama_call(prompt)
    match = re.search(r"\{[\s\S]*\}", raw)
    if not match:
        raise ValueError("No JSON found in LLM response")
    json_text = match.group()
    try:
        return safe_json_load(json_text)
    except Exception as e:
        raise ValueError(f"Invalid LLM JSON: {e}")

# ---------------------------------------------------
# split sections (Improved for ALL Resume Formats)
# ---------------------------------------------------
def split_sections(text):

    section_map = {}
    current = "header"
    section_map[current] = []

    # Common heading keywords (based on your resumes)
    SECTION_KEYWORDS = [
        "summary", "career objective", "objective",
        "experience", "work experience", "employment",
        "internships", "internship",
        "projects", "project",
        "skills", "technical skills", "technologies",
        "education", "certification", "certifications",
        "activities", "hobbies", "interests",
        "blogs", "challenges", "achievements"
    ]

    # Normalize text
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    for line in lines:

        clean = line.strip()

        # Remove decorative symbols
        clean_heading = re.sub(r"[^A-Za-z &/|]", "", clean).strip()
        clean = clean_heading

        # -------------------------------
        # HEADING DETECTION RULES
        # -------------------------------

        is_heading = False

        # Rule 1: Fully uppercase headings
        if clean.isupper() and len(clean.split()) <= 6:
            is_heading = True

        # Rule 2: Title Case headings (Education, Projects, etc.)
        elif re.fullmatch(r"[A-Z][A-Za-z &/|]{3,}", clean) and len(clean.split()) <= 6:
            is_heading = True

        # Rule 3: Headings with separators like "|" "&"
        elif any(sym in clean for sym in ["|", "&", "/"]):
            if len(clean.split()) <= 7:
                is_heading = True

        # Rule 4: Keyword match (Career Objective, Internships, Blogs)
        lowered = clean.lower()
        if any(keyword in lowered for keyword in SECTION_KEYWORDS):
            if len(clean.split()) <= 8:
                is_heading = True

        # Rule 5: Avoid false heading detection (names, emails)
        if re.search(r"@", clean) or re.search(r"\d{5,}", clean):
            is_heading = False

        # -------------------------------
        # SAVE SECTION
        # -------------------------------
        if is_heading:
            current = re.sub(r"[^a-z ]", "", lowered).strip()
            section_map[current] = []
        else:
            section_map[current].append(clean)

        # Prevent runaway parsing
        if len(section_map) > 50:
            break

    # Join section text properly
    return {k: "\n".join(v).strip() for k, v in section_map.items()}
# ---------------------------------------------------
# Smarter Section Mapping (Updated for ALL Resume Formats)
# ---------------------------------------------------

SECTION_ALIASES = {

    # ✅ EXPERIENCE (Sakshi + Internship heavy resumes)
    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "employment",
        "work history",
        "internship",
        "internships",
        "job experience"
    ],

    # ✅ PROJECTS (Only real projects)
    "projects": [
        "projects",
        "project work",
        "personal projects",
        "academic projects",
        "major projects",
        "key projects"
    ],

    # ✅ BLOGS / CHALLENGES (Bhavya resume format)
    "extra_sections": [
        "blogs",
        "challenges",
        "achievements",
        "hackathons"
    ],

    # ✅ SKILLS (Mangesh + Sakshi + Bhavya)
    "skills": [
        "skills",
        "technical skills",
        "core skills",
        "technologies",
        "tools",
        "frameworks",
        "programming languages",
        "software skills",
        "tech stack"
    ],

    # ✅ EDUCATION
    "education": [
        "education",
        "academic background",
        "qualification",
        "qualifications"
    ],

    # ✅ SUMMARY / OBJECTIVE
    "summary": [
        "summary",
        "career objective",
        "objective",
        "profile",
        "about me",
        "professional summary"
    ],

    # ✅ CERTIFICATIONS
    "certifications": [
        "certification",
        "certifications",
        "courses",
        "training"
    ],

    # ✅ INTERESTS / ACTIVITIES
    "interests": [
        "hobbies",
        "activities",
        "interests",
        "extra curricular",
        "other activities"
    ]
}

# ---------------------------------------------------
# Improved get_section (More Flexible + Safe)
# ---------------------------------------------------
def get_section(sections, aliases):

    for sec_name, sec_text in sections.items():
        sec_clean = sec_name.lower().strip()

        for alias in aliases:
            alias_clean = alias.lower().strip()

            # Exact match OR substring match
            if alias_clean == sec_clean or alias_clean in sec_clean:
                return sec_text

    return ""

# ---------------------------------------------------
# MERGE RULE-BASED + LLM RESULTS (Improved for ALL Resumes)
# ---------------------------------------------------
def merge_results(rule, llm):

    # -------------------------------
    # Helper: Normalize Skills
    # -------------------------------
    def normalize_skill(s):
        return s.strip().lower().replace(".", "")

    # -------------------------------
    # Merge Skills Properly
    # -------------------------------
    merged_skills = {}

    # Rule-based skills already have scores
    if isinstance(rule.get("skills"), dict):
        merged_skills.update(rule["skills"])

    # LLM skills usually come as list
    if isinstance(llm.get("skills"), list):
        for s in llm["skills"]:
            skill = normalize_skill(s)
            if skill and skill not in merged_skills:
                merged_skills[skill] = 70   # default score for LLM skills

    # Sort skills by score
    merged_skills = dict(sorted(merged_skills.items(), key=lambda x: -x[1]))

    # -------------------------------
    # Merge Education (Combine both)
    # -------------------------------
    merged_education = []

    if rule.get("education"):
        merged_education.extend(rule["education"])

    if llm.get("education"):
        for edu in llm["education"]:
            if edu not in merged_education:
                merged_education.append(edu)

    # -------------------------------
    # Merge Projects (Combine both)
    # -------------------------------
    merged_projects = []

    if rule.get("projects"):
        merged_projects.extend(rule["projects"])

    if llm.get("projects"):
        for proj in llm["projects"]:
            if proj not in merged_projects:
                merged_projects.append(proj)

    # -------------------------------
    # Summary Fallback
    # -------------------------------
    summary_text = rule.get("summary") or llm.get("summary", "")

    # -------------------------------
    # Experience Years (Max wins)
    # -------------------------------
    exp_years = max(
        rule.get("experience_years", 0),
        llm.get("experience_years", 0)
    )
    # -------------------------------
    # Merge Experience List
    # -------------------------------
    merged_experience = rule.get("experience", [])
    if llm.get("experience"):
        for ex in llm["experience"]:
            if ex not in merged_experience:
                merged_experience.append(ex)

    # -------------------------------
    # Final Clean Output
    # -------------------------------
    return {
        "name": rule.get("name") or llm.get("name", ""),
        "email": rule.get("email") or llm.get("email", ""),
        "phone": rule.get("phone") or llm.get("phone", ""),

        # Both formats supported:
        "skills": merged_skills,
        "skills_list": list(merged_skills.keys()),

        "experience_years": exp_years,
        "experience": merged_experience,

        "education": merged_education,
        "projects": merged_projects,

        "summary": summary_text.strip()
    }
# ---------------------------------------------------
# READ PDF (Improved for ALL Resume Formats)
# ---------------------------------------------------
def read_pdf(file_path):
    """
    Extracts clean text from PDF resumes.
    Handles multi-page + two-column resumes better.
    """

    full_text = ""

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:

            # Extract words instead of raw lines (better for columns)
            words = page.extract_words()

            if words:
                # Sort words top-to-bottom, left-to-right
                words_sorted = sorted(words, key=lambda w: (w["top"], w["x0"]))

                page_text = " ".join(w["text"] for w in words_sorted)

            else:
                # Fallback to normal extract_text()
                page_text = page.extract_text() or ""

            # Remove icon garbage (LinkedIn, phone symbols etc.)
            page_text = re.sub(r"[•●◆■▪️➤]", " ", page_text)

            # Remove repeated extra spaces
            page_text = re.sub(r"\s+", " ", page_text).strip()

            full_text += page_text + "\n"

    return full_text.strip()

# ---------------------------------------------------
# NAME EXTRACTION
# ---------------------------------------------------
def extract_name(text):

    if not text:
        return None

    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # Words that should NEVER be part of a name
    ROLE_WORDS = {
        "developer", "engineer", "intern", "designer",
        "android", "flutter", "software", "tester",
        "analyst", "consultant", "manager"
    }

    ignored_words = {"resume", "cv", "curriculum", "vitae", "profile"}

    # -------------------------------
    # Rule 1: Scan first 15 lines
    # -------------------------------
    for line in lines[:15]:

        # Skip emails/phones
        if "@" in line or any(char.isdigit() for char in line):
            continue

        # Clean symbols
        clean_line = re.sub(r"[^A-Za-z\s]", "", line).strip()

        if not clean_line:
            continue

        words = clean_line.split()

        # Candidate name must be 2–4 words
        if not (2 <= len(words) <= 4):
            continue

        # Reject headings like Resume/Profile
        if any(w.lower() in ignored_words for w in words):
            continue

        # ❌ Reject job titles like ANDROID DEVELOPER
        if any(w.lower() in ROLE_WORDS for w in words):
            continue

        # ❌ Reject fully uppercase job role lines
        if clean_line.isupper():
            continue

        # ✅ Accept proper name
        return " ".join(w.capitalize() for w in words)

    # -------------------------------
    # Rule 2: spaCy fallback
    # -------------------------------
    doc = nlp(text[:800])

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            candidate = ent.text.strip()
            words = candidate.split()

            if 2 <= len(words) <= 4:
                # Reject role contamination
                if any(w.lower() in ROLE_WORDS for w in words):
                    continue

                return candidate

    return None

# ---------------------------------------------------
# EMAIL & PHONE (Improved for ALL Resume Formats)
# ---------------------------------------------------

def extract_email(text):
    """
    Extracts the best email from any resume format.
    Handles punctuation, uppercase, multiple emails.
    """

    if not text:
        return None

    # Standard email regex
    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"

    emails = re.findall(pattern, text)

    if not emails:
        return None

    # Normalize emails (lowercase + strip punctuation)
    cleaned = []
    for e in emails:
        e = e.lower().strip().strip(".,;|:)")
        cleaned.append(e)

    # Prefer personal domains first
    priority_domains = [
        "gmail.com", "outlook.com",
        "yahoo.com", "hotmail.com"
    ]

    for email in cleaned:
        if any(email.endswith(d) for d in priority_domains):
            return email

    # Otherwise return first valid email
    return cleaned[0]


def extract_phone(text):
    """
    Extracts valid phone numbers across formats:
    - +91 98765 43210
    - 9876543210
    - (022) 2345 6789
    - Avoids pin codes and dates
    """

    if not text:
        return None

    clean = text.replace("\n", " ")

    # Find candidate numbers (7–15 digits, allow separators)
    candidates = re.findall(
        r"\+?\d[\d\s().-]{7,18}\d",
        clean
    )

    if not candidates:
        return None

    # Normalize: remove spaces/dashes/brackets
    def normalize(num):
        return re.sub(r"[^\d+]", "", num)

    normalized = [normalize(c) for c in candidates]

    valid_numbers = []

    for num in normalized:

        # Remove leading +
        digits_only = num.replace("+", "")

        # Reject very short/long
        if len(digits_only) < 10 or len(digits_only) > 13:
            continue

        # Reject PIN codes or year-like numbers
        if len(digits_only) == 6:   # postal codes
            continue

        # Reject dates like 20232024
        if digits_only.startswith("19") or digits_only.startswith("20"):
            continue

        valid_numbers.append(num)

    if not valid_numbers:
        return None

    # Prefer Indian +91 numbers
    for num in valid_numbers:
        if num.startswith("+91") and len(num) == 13:
            return num

    # Prefer plain 10-digit mobile numbers
    for num in valid_numbers:
        if len(num.replace("+", "")) == 10:
            return num.replace("+", "")

    # Otherwise return first valid number
    return valid_numbers[0]

# ---------------------------------------------------
# SKILLS DATABASE (Expanded for ALL Resume Formats)
# ---------------------------------------------------

TECH_SKILLS = {

    # ✅ FRONTEND
    "frontend": {
        "html": ["html5"],
        "css": ["css3"],
        "javascript": ["js", "java script"],
        "typescript": ["ts"],
        "react": ["reactjs", "react.js", "react js"],
        "angular": ["angularjs"],
        "vue": ["vuejs"],
        "bootstrap": [],
        "tailwind": ["tailwindcss"],
        "nextjs": ["next.js", "next js"]
    },

    # ✅ BACKEND
    "backend": {
        "node": ["nodejs", "node.js"],
        "express": ["expressjs", "express.js"],
        "php": [],
        "python": [],
        "django": [],
        "flask": [],
        "java": ["core java", "advanced java"],
        "spring": ["spring boot"],
        "c": [],
        "c++": ["cpp"],
        "c#": ["csharp"],
        "golang": ["go"],
        "ruby": [],
        "rest api": ["api", "restful api"]
    },

    # ✅ DATABASES
    "databases": {
        "mysql": [],
        "postgresql": ["postgres"],
        "mongodb": ["mongo", "mongo db"],
        "firebase": ["firestore", "firebase database"],
        "sql": [],
        "redis": []
    },

    # ✅ DEVOPS + CLOUD
    "devops_cloud": {
        "docker": [],
        "kubernetes": ["k8s"],
        "aws": ["amazon web services"],
        "azure": [],
        "gcp": ["google cloud"],
        "jenkins": [],
        "ci/cd": ["cicd", "pipeline"],
        "terraform": [],
        "github actions": []
    },

    # ✅ MOBILE DEVELOPMENT (Sakshi Resume)
    "mobile": {
        "android": ["android development"],
        "android studio": [],
        "flutter": [],
        "dart": [],
        "kotlin": [],
        "swift": [],
        "react native": ["react-native"]
    },

    # ✅ DATA + ML
    "data_ml": {
        "pandas": [],
        "numpy": [],
        "scikit-learn": ["sklearn"],
        "tensorflow": [],
        "pytorch": ["torch"],
        "machine learning": ["ml"],
        "artificial intelligence": ["ai"],
        "nlp": ["natural language processing"]
    },

    # ✅ UI/UX + DESIGN (Bhavya Resume)
    "design": {
        "figma": [],
        "ui/ux": ["ui ux", "user experience", "user interface"],
        "canva": [],
        "wireframing": ["wireframe"],
        "prototyping": ["prototype"],
        "graphic design": []
    },

    # ✅ TOOLS
    "tools": {
        "git": [],
        "github": [],
        "gitlab": [],
        "jira": [],
        "linux": [],
        "postman": [],
        "vs code": ["vscode", "visual studio code"]
    }
}


# ---------------------------------------------------
# SKILLS EXTRACTION (Improved for ALL Resume Formats)
# ---------------------------------------------------
def extract_skills(text):

    if not text:
        return {}

    # Normalize separators: | / • → comma
    clean_text = text.lower()
    clean_text = re.sub(r"[|/•●▪]", ",", clean_text)

    skill_counts = Counter()

    # ----------------------------
    # TECH SKILLS MATCHING
    # ----------------------------
    for category, skills in TECH_SKILLS.items():
        for skill, aliases in skills.items():

            patterns = [skill] + aliases

            for p in patterns:
                # Flexible word boundary matching
                pattern = r"(?<!\w)" + re.escape(p) + r"(?!\w)"

                matches = len(re.findall(pattern, clean_text))

                if matches:
                    skill_counts[skill] += matches

    if not skill_counts:
        return {}

    # ----------------------------
    # SCORE NORMALIZATION (0–100)
    # ----------------------------
    max_count = max(skill_counts.values(), default=1)

    skill_scores = {
        skill: int((count / max_count) * 100)
        for skill, count in skill_counts.items()
    }

    # ----------------------------
    # SOFT SKILLS (Common in resumes)
    # ----------------------------
    SOFT_SKILLS = [
        "communication", "teamwork", "leadership",
        "problem solving", "time management",
        "collaboration", "adaptability"
    ]

    for s in SOFT_SKILLS:
        if re.search(r"\b" + re.escape(s) + r"\b", clean_text):
            skill_scores.setdefault(s, 40)

    # Sort skills by score
    return dict(sorted(skill_scores.items(), key=lambda x: -x[1]))

# ---------------------------------------------------
# EXPERIENCE EXTRACTION (Role + Duration + Years)
# ---------------------------------------------------

def extract_experience_details(text):
    if not text:
        return {
            "experience_years": 0.0,
            "experience": []
        }

    # Normalize separators
    t = text.replace("–", "-").replace("—", "-")

    # Replace Present/Ongoing with current date
    t = re.sub(
        r"\b(present|current|ongoing|till date|till now)\b",
        datetime.now().strftime("%b %Y"),
        t,
        flags=re.IGNORECASE
    )

    experience_list = []
    total_months = 0
    used = set()

    # Month names pattern
    month = (
        r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|"
        r"January|February|March|April|May|June|July|August|"
        r"September|October|November|December)"
    )

    # Date formats: Apr 2024, Sept 2024, 2023
    date_pattern = rf"(?:{month}\s+\d{{4}}|\d{{4}})"

    # Pattern: Role Name + Date Range
    pattern = rf"""
        (?P<role>[A-Za-z /&]+?)      # Role title
        \s*
        (?P<start>{date_pattern})    # Start date
        \s*[-to]+\s*
        (?P<end>{date_pattern})      # End date
    """

    matches = re.finditer(pattern, t, re.IGNORECASE | re.VERBOSE)

    # Helper: parse date
    def parse_date(raw):
        raw = raw.strip().replace(",", "")
        for fmt in ("%b %Y", "%B %Y", "%Y"):
            try:
                dt = datetime.strptime(raw, fmt)
                if fmt == "%Y":
                    dt = dt.replace(month=1)
                return dt
            except ValueError:
                continue
        return None

    for m in matches:
        role = m.group("role").strip()
        start_raw = m.group("start").strip()
        end_raw = m.group("end").strip()

        # Clean role (remove unwanted words)
        role = re.sub(r"\b(at|in|as)\b", "", role, flags=re.IGNORECASE).strip()

        duration = f"{start_raw} – {end_raw}"

        key = (role.lower(), duration.lower())
        if key in used:
            continue
        used.add(key)

        # Compute months
        start_dt = parse_date(start_raw)
        end_dt = parse_date(end_raw)

        if start_dt and end_dt:
            months = (end_dt.year - start_dt.year) * 12 + (end_dt.month - start_dt.month)
            if months > 0:
                total_months += months

        experience_list.append({
            "role": role,
            "duration": duration
        })

    return {
        "experience_years": round(total_months / 12, 2),
        "experience": experience_list
    }
# ---------------------------------------------------
# EDUCATION EXTRACTION (Improved for ALL Resume Formats)
# ---------------------------------------------------

def extract_education(text): 

    if not text:
        return []

    # Normalize bullets/symbols
    t = re.sub(r"[•●◆■▪]", "-", text)
    t = re.sub(r"\r", "\n", t)
    t = re.sub(r"[ \t]+", " ", t)

    lines = [l.strip() for l in t.split("\n") if l.strip()]

    # Degree Keywords
    DEGREE_PATTERNS = [
        r"\bB\.?\s*Tech\b", r"\bM\.?\s*Tech\b",
        r"\bB\.?\s*E\b", r"\bM\.?\s*E\b",
        r"\bB\.?\s*Sc\b", r"\bM\.?\s*Sc\b",
        r"\bB\.?\s*CA\b", r"\bM\.?\s*CA\b",
        r"\bB\.?\s*A\b", r"\bM\.?\s*A\b",
        r"\bB\.?\s*Com\b", r"\bM\.?\s*Com\b",
        r"\bMBA\b", r"\bBBA\b",
        r"\bPh\.?\s*D\b",
        r"\bBachelor of [A-Za-z ]+",
        r"\bMaster of [A-Za-z ]+",
        r"\bDiploma\b"
    ]

    # School Keywords
    SCHOOL_PATTERNS = [
        r"\bHSC\b", r"\bSSC\b",
        r"\b10th\b", r"\b12th\b",
        r"\bHigh School\b",
        r"\bHigher Secondary\b"
    ]

    DEGREE_REGEX = re.compile("|".join(DEGREE_PATTERNS), re.IGNORECASE)
    SCHOOL_REGEX = re.compile("|".join(SCHOOL_PATTERNS), re.IGNORECASE)

    YEAR_REGEX = re.compile(r"(19|20)\d{2}(\s*[-–]\s*(19|20)\d{2})?")
    SCORE_REGEX = re.compile(r"(CGPA|GPA|%|percent|percentage)\s*[:\-]?\s*\d+(\.\d+)?",
                             re.IGNORECASE)

    education_entries = []
    used = set()

    i = 0
    while i < len(lines):

        line = lines[i]

        # Detect degree/school line
        if DEGREE_REGEX.search(line) or SCHOOL_REGEX.search(line):

            degree_line = line
            institution = ""
            year = ""
            score = ""

            # Extract year if present
            y_match = YEAR_REGEX.search(line)
            if y_match:
                year = y_match.group()

            # Extract score if present
            s_match = SCORE_REGEX.search(line)
            if s_match:
                score = s_match.group()

            # Institution usually comes next line
            if i + 1 < len(lines):
                next_line = lines[i + 1]

                # Avoid capturing another section heading
                if not DEGREE_REGEX.search(next_line) and len(next_line.split()) > 1:
                    institution = next_line

            # Build final entry
            entry_parts = [degree_line]

            if institution:
                entry_parts.append(institution)

            if year:
                entry_parts.append(f"({year})")

            if score:
                entry_parts.append(score)

            final_entry = " - ".join(entry_parts)

            # Avoid duplicates
            if final_entry.lower() not in used:
                used.add(final_entry.lower())
                education_entries.append(final_entry)

        i += 1

    return education_entries
# ---------------------------------------------------
# PROJECTS EXTRACTION (Improved for ALL Resume Formats)
# ---------------------------------------------------

def parse_projects(text):
    if not text:
        return []

    # -------------------------------------------------
    # STEP 1: Extract only Projects Section if full resume
    # -------------------------------------------------
    proj_match = re.search(
        r"(PROJECTS?|ACADEMIC PROJECTS?|PERSONAL PROJECTS?|KEY PROJECTS?)"
        r"(.+?)"
        r"(EXPERIENCE|INTERNSHIPS|EDUCATION|SKILLS|CERTIFICATION|BLOGS|CHALLENGES|$)",
        text,
        flags=re.IGNORECASE | re.DOTALL
    )

    proj_section = proj_match.group(2) if proj_match else text

    lines = [l.strip() for l in proj_section.split("\n") if l.strip()]

    projects = []
    current = {"title": None, "description": [], "stack": []}

    INVALID_TITLES = {
        "projects have been completed",
        "responsibilities",
        "roles and responsibilities",
        "summary",
        "profile",
        "experience",
        "education",
        "skills",
        "certifications",
        "blogs",
        "challenges"
    }

    # -------------------------------------------------
    # Helper: Save Project
    # -------------------------------------------------
    def save_project():
        if not current["title"]:
            return

        title = current["title"].strip()

        if title.lower() in INVALID_TITLES:
            return

        desc = " ".join(current["description"]).strip()

        # Reject empty projects
        if not desc and not current["stack"]:
            return

        projects.append({
            "title": title,
            "description": desc,
            "tech_stack": sorted(set(current["stack"]))
        })

    # -------------------------------------------------
    # Helper: Extract stack from inline text
    # Example: "NewslettrAI (React, Node, MongoDB)"
    # -------------------------------------------------
    def extract_inline_stack(line):
        stack = []
        m = re.search(r"\(([^)]+)\)", line)
        if m:
            raw = m.group(1)
            stack = [s.strip().lower() for s in raw.split(",") if s.strip()]
        return stack

    # -------------------------------------------------
    # STEP 2: Parse Projects
    # -------------------------------------------------
    for line in lines:
        lower = line.lower()

        # -----------------------------
        # CASE A: Numbered Project Title
        # -----------------------------
        m = re.match(r"^\d+[\).]?\s*(.+)", line)
        if m:
            save_project()
            title_line = m.group(1).strip()
            current = {
                "title": title_line,
                "description": [],
                "stack": extract_inline_stack(title_line)
            }
            continue

        # -----------------------------
        # CASE B: Explicit Title Label
        # -----------------------------
        if lower.startswith("title:"):
            save_project()
            title_line = line.split(":", 1)[1].strip()
            current = {
                "title": title_line,
                "description": [],
                "stack": extract_inline_stack(title_line)
            }
            continue

        # -----------------------------
        # CASE C: Tech Stack Line
        # -----------------------------
        if any(k in lower for k in ["tech stack", "technologies", "tools used", "language used"]):
            raw_stack = line.split(":", 1)[-1]
            current["stack"].extend(
                [s.strip().lower() for s in re.split(r"[,\|/]", raw_stack) if s.strip()]
            )
            continue

        # -----------------------------
        # CASE D: Description Bullet
        # -----------------------------
        if line.startswith(("•", "-", "–")):
            if current["title"]:
                bullet = re.sub(r"^[•\-–]\s*", "", line)
                current["description"].append(bullet)
            continue

        # -----------------------------
        # CASE E: Standalone Title (Bhavya Format)
        # -----------------------------
        if current["title"] is None:
            clean = lower.rstrip(".")

            # Reject sentences
            if len(line.split()) > 7 or "." in line:
                continue

            if clean in INVALID_TITLES:
                continue

            # Accept short title
            save_project()
            current = {
                "title": line.strip(),
                "description": [],
                "stack": extract_inline_stack(line)
            }
            continue

        # -----------------------------
        # CASE F: Plain Description Line
        # -----------------------------
        if current["title"]:
            current["description"].append(line)

    # Save last project
    save_project()

    return projects
# ---------------------------------------------------
# ATS SCORE (Improved for ALL Resume Formats)
# ---------------------------------------------------

def calculate_ats_score(resume_skills, job_description):
    if not job_description:
        return 0, [], []

    job_desc = job_description.lower()

    # -------------------------------
    # Normalize Skill Text
    # -------------------------------
    def normalize(s):
        return s.strip().lower().replace(".", "").replace("-", " ")

    # -------------------------------
    # Extract Resume Skill Set
    # Works for dict or list formats
    # -------------------------------
    resume_skill_set = set()

    if isinstance(resume_skills, dict):
        resume_skill_set = {normalize(k) for k in resume_skills.keys()}

    elif isinstance(resume_skills, list):
        resume_skill_set = {normalize(k) for k in resume_skills}

    # -------------------------------
    # Extract Job Skill Set from JD
    # -------------------------------
    job_skill_set = set()

    for category in TECH_SKILLS.values():
        for skill, aliases in category.items():

            skill_norm = normalize(skill)

            # Match main skill
            if re.search(r"\b" + re.escape(skill_norm) + r"\b", job_desc):
                job_skill_set.add(skill_norm)

            # Match aliases
            for alias in aliases:
                alias_norm = normalize(alias)

                if re.search(r"\b" + re.escape(alias_norm) + r"\b", job_desc):
                    job_skill_set.add(skill_norm)

    # If no skills found in JD
    if not job_skill_set:
        return 0, [], []

    # -------------------------------
    # Matched + Missing Skills
    # -------------------------------
    matched = resume_skill_set.intersection(job_skill_set)
    missing = job_skill_set.difference(resume_skill_set)

    # -------------------------------
    # ATS Score Calculation
    # Base Score = Match %
    # Bonus Score = Extra skills present
    # -------------------------------
    base_score = len(matched) / len(job_skill_set) * 100

    extra_skills = resume_skill_set.difference(job_skill_set)
    bonus = min(len(extra_skills) * 1.5, 10)  # max +10 bonus

    final_score = int(min(base_score + bonus, 100))

    return final_score, sorted(list(matched)), sorted(list(missing))
# ---------------------------------------------------
# MAIN PARSER (Improved for ALL Resume Formats)
# ---------------------------------------------------

def parse_resume(file_path, job_description=""):

    # -------------------------------
    # Step 1: Read Resume Text
    # -------------------------------
    raw_text = read_pdf(file_path)

    if not raw_text.strip():
        return {"error": "Empty resume text"}

    # -------------------------------
    # Step 2: Split Into Sections
    # -------------------------------
    sections = split_sections(raw_text)

    summary_text      = get_section(sections, SECTION_ALIASES["summary"])
    skill_text        = get_section(sections, SECTION_ALIASES["skills"])
    project_text      = get_section(sections, SECTION_ALIASES["projects"])
    experience_text   = get_section(sections, SECTION_ALIASES["experience"])
    education_text    = get_section(sections, SECTION_ALIASES["education"])
    cert_text         = get_section(sections, SECTION_ALIASES.get("certifications", []))
    interest_text     = get_section(sections, SECTION_ALIASES.get("interests", []))

    # -------------------------------
    # Step 3: Projects Extraction (Flexible)
    # -------------------------------
    projects = parse_projects(project_text)

    # Fallback: scan full resume if projects section missing
    if not projects:
        projects = parse_projects(raw_text)

    # -------------------------------
    # Step 4: Experience Extraction (Years + Role List)
    # -------------------------------
    exp_data = extract_experience_details(experience_text)

    # -------------------------------
    # Step 5: Rule-Based Extraction
    # -------------------------------
    rule_result = {
        "name": extract_name(raw_text),
        "email": extract_email(raw_text),
        "phone": extract_phone(raw_text),

        "skills": extract_skills(skill_text),

        "experience_years": exp_data["experience_years"],
        "experience": exp_data["experience"],

        "education": extract_education(education_text),
        "projects": projects,

        "certifications": cert_text.split("\n")[:5] if cert_text else [],
        "interests": interest_text.split("\n")[:5] if interest_text else [],

        "summary": summary_text[:500] if summary_text else ""
    }

    # -------------------------------
    # Step 6: LLM Fallback (Smart Trigger)
    # -------------------------------
    llm_result = {}

    missing_critical = (
        not rule_result["skills"]
        or not rule_result["projects"]
        or not rule_result["education"]
        or not rule_result["name"]
    )

    if missing_critical:
        try:
            llm_result = llm_extract_resume(raw_text)
        except Exception:
            llm_result = {}

    # -------------------------------
    # Step 7: Merge Rule + LLM Results
    # -------------------------------
    final = merge_results(rule_result, llm_result)

    # -------------------------------
    # Step 8: ATS Score Calculation
    # -------------------------------
    ats_score, matched, missing = calculate_ats_score(
        final["skills"], job_description
    )

    # -------------------------------
    # Step 9: Final Output Schema
    # -------------------------------
    final["file"] = file_path
    final["ats_score"] = ats_score
    final["job_match"] = {
        "matched_skills": matched,
        "missing_skills": missing
    }
    # ---------------------------------------------------
    # NORMALIZE EDUCATION (Safe for ALL Formats)
    # ---------------------------------------------------
    normalized_education = []
    seen = set()

    for e in final.get("education", []):

        degree = ""
        institution = ""
        start = ""
        end = ""
        year = ""

        # CASE 1: Dict education (LLM output)
        if isinstance(e, dict):

            degree = (
                e.get("degree") or e.get("name") or e.get("course") or
                e.get("program") or e.get("qualification")
            )

            institution = (
                e.get("institution") or e.get("university") or
                e.get("college") or e.get("school")
            )

            start = e.get("start_date") or e.get("from") or ""
            end   = e.get("end_date") or e.get("to") or ""

            year = e.get("year") or e.get("date") or ""

        # CASE 2: String education (rule output)
        else:
            raw = str(e).strip()
            raw = raw.replace("|", "-").replace("–", "-")
            raw = " ".join(raw.split())

            key = raw.lower()
            if key not in seen:
                seen.add(key)
                normalized_education.append(raw)
            continue

        # Build year text
        years_text = ""
        if year:
            years_text = f"({year})"
        elif start and end:
            years_text = f"({start} – {end})"
        elif start:
            years_text = f"({start})"
        elif end:
            years_text = f"({end})"

        parts = [p.strip() for p in [degree, institution, years_text] if p]

        if parts:
            entry = " - ".join(parts)
            key = entry.lower()

            if key not in seen:
                seen.add(key)
                normalized_education.append(entry)

    final["education"] = normalized_education
    return final

# ---------------------------------------------------
# CLI (Improved for ALL Resume Formats)
# ---------------------------------------------------

if __name__ == "__main__":
    import os
    import sys
    import json

    # -------------------------------
    # 1. Validate Arguments
    # -------------------------------
    if len(sys.argv) < 2:
        print("\n❌ ERROR: Resume PDF file path missing.")
        print("✅ Usage:")
        print("   python resume_parser.py <resume.pdf> [job_description.txt]\n")
        sys.exit(1)

    file_path = sys.argv[1]

    # -------------------------------
    # 2. Check File Exists
    # -------------------------------
    if not os.path.exists(file_path):
        print(f"\n❌ ERROR: File not found: {file_path}\n")
        sys.exit(1)

    # -------------------------------
    # 3. Load Job Description (Optional)
    # -------------------------------
    job_desc = ""

    if len(sys.argv) > 2:
        jd_input = sys.argv[2]

        # If user provides JD as a text file
        if os.path.exists(jd_input):
            with open(jd_input, "r", encoding="utf-8") as f:
                job_desc = f.read()
        else:
            # Otherwise treat argument as raw JD string
            job_desc = jd_input

    # -------------------------------
    # 4. Run Resume Parser
    # -------------------------------
    try:
        result = parse_resume(file_path, job_desc)

        # Print clean JSON output
        print(json.dumps(result, indent=2, ensure_ascii=False))

    except Exception as e:
        print("\n❌ Resume Parsing Failed!")
        print("Reason:", str(e))
        sys.exit(1)