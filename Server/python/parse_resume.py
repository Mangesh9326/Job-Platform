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
# split sections
# ---------------------------------------------------
def split_sections(text):
    
    section_map = {}
    current = "header"
    section_map[current] = []

    for line in text.split("\n"):
        clean = line.strip()
        if not clean:
            continue
        

        # Detect section headings (uppercase or title-case)
        if (
            clean.isupper()
            or re.fullmatch(r"[A-Z][A-Za-z /&-]{3,}", clean)
        ) and len(clean.split()) <= 6:
            current = clean.lower()
            section_map[current] = []
        else:
            section_map[current].append(clean)
        if len(section_map) > 40:
            break


    # Join lines
    return {k: "\n".join(v) for k, v in section_map.items()}
# ---------------------------------------------------
# Smarter Section Mapping
# ---------------------------------------------------
SECTION_ALIASES = {
    "experience": ["experience", "internships", "work experience"],
    "projects": ["projects", "challenges", "blogs"],
    "skills": ["skills", "technologies", "tools"],
    "education": ["education"],
    "summary": ["summary", "career objective", "objective"],
}
def get_section(sections, keys):
    for k in sections:
        for alias in keys:
            if alias in k:
                return sections[k]
    return ""

# ---------------------------------------------------
# MERGE RULE-BASED + LLM RESULTS
# ---------------------------------------------------
def merge_results(rule, llm):
    return {
        "name": rule["name"] or llm.get("name"),
        "email": rule["email"] or llm.get("email"),
        "phone": rule["phone"] or llm.get("phone"),
        "skills": {
            **({s: 100 for s in llm.get("skills", [])}
               if isinstance(llm.get("skills"), list) else {}),
            **rule["skills"]
        },
        "experience_years": (
            rule["experience_years"]
            if rule["experience_years"] > 0
            else llm.get("experience_years", 0)
        ),

        "education": rule["education"] or llm.get("education", []),
        "projects": rule["projects"] or llm.get("projects", []),
        "summary": rule["summary"]
    }

# ---------------------------------------------------
# READ PDF
# ---------------------------------------------------
def read_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
    return text

# ---------------------------------------------------
# NAME EXTRACTION (Improved for all formats)
# ---------------------------------------------------
def extract_name(text):
    # Preprocess text: remove extra spaces
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    ignored_words = {"resume", "curriculum", "vitae", "cv", "profile"}

    for line in lines[:10]:  # check first 10 lines
        # Remove digits, special chars
        line_clean = re.sub(r"[\d+().@\-]", "", line).strip()
        words = [w for w in line_clean.split() if w.isalpha()]
        if len(words) >= 2 and len(words) <= 5:
            # Skip lines with headings
            if not any(word.lower() in ignored_words for word in words):
                # Capitalize first letters for consistency
                return " ".join(w.capitalize() for w in words)

    # SpaCy fallback (first 500 chars)
    doc = nlp(text[:500])
    for ent in doc.ents:
        if ent.label_ == "PERSON" and 2 <= len(ent.text.split()) <= 5:
            return ent.text.strip()

    return None


# ---------------------------------------------------
# EMAIL & PHONE (Robust patterns)
# ---------------------------------------------------
def extract_email(text):
    # More reliable industry-grade regex
    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"

    emails = re.findall(pattern, text)
    if not emails:
        return None

    # If multiple, prefer personal email (gmail/outlook)
    priority_domains = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"]
    
    for email in emails:
        if any(email.endswith(d) for d in priority_domains):
            return email

    return emails[0]  # fallback to first


def extract_phone(text):
    # Clean text for easier matching
    clean = text.replace("\n", " ")

    # Universal pattern: allows +country, spaces, dashes, parentheses
    pattern = r"""
        (?:
            (\+\d{1,3}[-.\s]?)?         # country code
            \(?\d{2,4}\)?[-.\s]?        # area code
            \d{3,4}[-.\s]?\d{3,4}       # main number
        )
    """

    matches = re.findall(pattern, clean, re.VERBOSE)

    if not matches:
        return None

    # Normalize: combine tuple into actual string
    possible_numbers = re.findall(r"\+?\d[\d\s().-]{7,16}\d", clean)

    if not possible_numbers:
        return None

    # Clean formatting: remove spaces, dashes, parentheses
    def normalize(num):
        return re.sub(r"[^\d+]", "", num)

    normalized = [normalize(n) for n in possible_numbers]

    # Prefer Indian mobile if present (common case)
    for num in normalized:
        if len(num) == 12 and num.startswith("+91"):
            return num

    # Prefer 10-digit mobile numbers
    for num in normalized:
        if len(num) == 10:
            return num
    
    # Otherwise return first clean number
    return normalized[0]


# ---------------------------------------------------
# SKILLS & RATINGS (Expanded IT skills)
# ---------------------------------------------------
TECH_SKILLS = {
    "frontend": {
        "html": ["html5"],
        "css": ["css3"],
        "javascript": ["js"],
        "typescript": ["ts"],
        "react": ["reactjs", "react.js"],
        "angular": [],
        "vue": ["vuejs"],
        "bootstrap": [],
        "tailwind": ["tailwindcss"],
        "jquery": []
    },

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
        "rails": ["ruby on rails"]
    },

    "databases": {
        "mysql": [],
        "postgresql": ["postgres"],
        "mongodb": ["mongo"],
        "sqlserver": ["mssql"],
        "sql": [],
        "oracle": [],
        "redis": []
    },

    "devops_cloud": {
        "docker": [],
        "kubernetes": ["k8s"],
        "aws": ["amazon web service"],
        "azure": [],
        "gcp": ["google cloud"],
        "jenkins": [],
        "ci/cd": ["cicd"],
        "terraform": [],
        "ansible": [],
        "prometheus": []
    },

    "mobile": {
        "react native": ["react-native"],
        "flutter": [],
        "swift": [],
        "kotlin": []
    },

    "data_ml": {
        "pandas": [],
        "numpy": [],
        "scikit-learn": ["sklearn"],
        "tensorflow": [],
        "pytorch": ["torch"],
        "spark": ["pyspark"],
        "hadoop": [],
        "ml": ["machine learning"],
        "ai": ["artificial intelligence"],
        "nlp": ["natural language processing"]
    },

    "tools": {
        "git": [],
        "github": [],
        "gitlab": [],
        "jira": [],
        "confluence": [],
        "linux": []
    }
}

def extract_skills(text):
    text = (text or "").lower()
    skill_counts = Counter()

    # --- TECH SKILLS ---
    for category, skills in TECH_SKILLS.items():
        for skill, aliases in skills.items():
            patterns = [skill] + aliases
            for p in patterns:
                pattern = r"\b" + re.escape(p) + r"\b"
                matches = len(re.findall(pattern, text))
                if matches:
                    skill_counts[skill] += matches

    max_count = max(skill_counts.values(), default=1)

    skill_scores = {
        skill: int((count / max_count) * 100)
        for skill, count in skill_counts.items()
    }

    # --- SOFT SKILLS ---
    SOFT_SKILLS = [
        "leadership", "communication", "problem solving",
        "quick learner", "collaboration", "time management",
        "project management", "email marketing"
    ]

    for s in SOFT_SKILLS:
        if re.search(r"\b" + re.escape(s) + r"\b", text):
            skill_scores.setdefault(s, 40)

    return dict(sorted(skill_scores.items(), key=lambda x: -x[1]))

# ---------------------------------------------------
# EXPERIENCE EXTRACTION (Years & Months)
# ---------------------------------------------------

def extract_experience(text):
    import re
    from datetime import datetime

    if not text:
        return 0.0

    # ----------------------------
    # Normalize text
    # ----------------------------
    t = text.replace("–", "-").replace("—", "-")

    # Replace Present / Current
    t = re.sub(
        r"\b(present|current)\b",
        datetime.now().strftime("%b %Y"),
        t,
        flags=re.IGNORECASE
    )

    total_months = 0
    used = set()

    # ----------------------------
    # YEAR-ONLY RANGES (2020 - 2023)
    # ----------------------------
    year_pairs = re.findall(
        r"\b((?:19|20)\d{2})\s*[-to]+\s*((?:19|20)\d{2})\b",
        t,
        flags=re.IGNORECASE
    )

    for y1, y2 in year_pairs:
        key = (y1, y2)
        if key in used:
            continue
        used.add(key)

        diff = int(y2) - int(y1)
        if 0 < diff <= 10:
            total_months += diff * 12

    # ----------------------------
    # MONTH + YEAR RANGES
    # ----------------------------
    month = (
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|"
        r"January|February|March|April|May|June|July|August|"
        r"September|October|November|December)"
    )

    date = rf"(?:\d{{1,2}}\s+{month}\s+\d{{4}}|{month}\s+\d{{4}})"

    pairs = re.findall(
        rf"({date})\s*[-to]+\s*({date})",
        t,
        flags=re.IGNORECASE
    )

    def parse(d):
        d = d.replace(",", "").strip()
        for fmt in ("%d %b %Y", "%d %B %Y", "%b %Y", "%B %Y"):
            try:
                return datetime.strptime(d, fmt)
            except ValueError:
                pass
        return None

    for s_raw, e_raw in pairs:
        key = (s_raw, e_raw)
        if key in used:
            continue
        used.add(key)

        s = parse(s_raw)
        e = parse(e_raw)
        if not s or not e:
            continue

        months = (e.year - s.year) * 12 + (e.month - s.month)
        if 1 <= months <= 120:
            total_months += months

    return round(total_months / 12, 2)

# ---------------------------------------------------
# EDUCATION
# ---------------------------------------------------
def extract_education(text):
    if not text:
        return []
    # Normalize bullets and spacing
    t = re.sub(r"[•●◆■]", "-", text)
    t = re.sub(r"\r", "\n", t)
    t = re.sub(r"[ \t]+", " ", t)

    lines = t.split("\n")

    # Degree + school keywords with whole-word boundaries
    degree_patterns = [
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
    ]

    school_patterns = [
        r"\bHSC\b", r"\bSSC\b", r"\b12th\b", r"\b10th\b",
        r"\bIntermediate\b",
        r"\bHigher Secondary\b",
        r"\bHigh School\b",
        r"\bJunior College\b",
    ]

    # Combine patterns
    all_patterns = degree_patterns + school_patterns
    regex = re.compile("|".join(all_patterns), flags=re.IGNORECASE)

    extracted = []

    # Process each line individually (avoids multi-line false captures)
    for line in lines:
        clean = line.strip()

        if not clean:
            continue

        # Skip if line contains random headers or garbage
        if len(clean) < 4:
            continue
        if clean.lower() in ["education", "profile", "summary", "projects", "skills"]:
            continue

        # Match only if pattern exists in the line
        if regex.search(clean):
            # Filter out wrong lines like:
            # "Backend", "Base", "Mary", "B EDUCATION"
            if re.fullmatch(r"[A-Za-z ]+", clean, flags=re.IGNORECASE):
                # pure letters only (danger zone)
                continue

            # Final cleanup
            clean = re.sub(r"\s+", " ", clean).strip()

            if clean not in extracted:
                extracted.append(clean)

    education = []

    for e in extracted:
        if isinstance(e, dict):
            education.append(
                f"{e.get('name','')} - {e.get('university','')} ({e.get('date','')})".  strip()
            )
        else:
            education.append(str(e))

    return education


# ---------------------------------------------------
# PROJECTS
# ---------------------------------------------------
def parse_projects(text):
    if not text:
        return []

    # ------------------------------------------
    # STEP 1: Detect whether text is full resume
    # or already a project-like section
    # ------------------------------------------
    if re.search(r"PROJECTS?|PROJECT SECTION", text, re.IGNORECASE):
        # Full resume text → extract project section
        proj_match = re.search(
            r"(PROJECTS?|PROJECT SECTION)(.+?)(EXPERIENCE|INTERNSHIPS|WORK EXPERIENCE|EDUCATION|SKILLS|CERTIFICATION|$)",
            text,
            flags=re.IGNORECASE | re.DOTALL
        )
        if not proj_match:
            return []
        proj_section = proj_match.group(2)
    else:
        # Already a section (blogs / challenges / projects)
        proj_section = text

    lines = [l.strip() for l in proj_section.split("\n") if l.strip()]

    projects = []
    current = {
        "title": None,
        "description": [],
        "stack_text": "",
        "stack": []
    }

    # ------------------------------------------
    # Helper: save current project
    # ------------------------------------------
    def save_project():
        title_raw = current.get("title")
        if not title_raw:
            return

        # ----------------------------
        # Clean & normalize title
        # ----------------------------
        title = title_raw.strip()
        title = re.sub(r"^title:\s*", "", title, flags=re.I)
        title = re.sub(r"\s{2,}", " ", title)

        INVALID_PROJECT_TITLES = {
            "projects have been completed",
            "responsibilities",
            "roles and responsibilities",
            "summary",
            "profile",
            "experience",
            "education",
            "skills",
            "certifications",
        }

        if title.lower().rstrip(".") in INVALID_PROJECT_TITLES:
            return

        # ----------------------------
        # Clean description
        # ----------------------------
        desc = " ".join(current["description"]).strip()

        # ❌ Reject empty garbage projects
        if not desc and not current["stack_text"]:
            return

        # ----------------------------
        # Clean & normalize tech stack
        # ----------------------------
        stack = []
        if current["stack_text"]:
            stack = sorted({
                s.strip().lower()
                for s in re.split(r"[,\|/]", current["stack_text"])
                if s.strip()
            })

        # ----------------------------
        # Save project
        # ----------------------------
        projects.append({
            "title": title,
            "description": desc,
            "language_used": current["stack_text"].strip(),
            "stack": stack
        })

    # ------------------------------------------
    # STEP 2: Parse lines flexibly
    # ------------------------------------------
    for line in lines:
        lower = line.lower()

        # CASE A: Numbered title
        # "1) Food Ordering System"
        m = re.match(r"\d+[\).]?\s*(.+)", line)
        if m and len(m.group(1).split()) <= 6:
            save_project()
            current = {
                "title": m.group(1).strip(),
                "description": [],
                "stack_text": "",
                "stack": []
            }
            continue

        # CASE B: Explicit title label
        if lower.startswith("title:"):
            save_project()
            current = {
                "title": line.split(":", 1)[1].strip(),
                "description": [],
                "stack_text": "",
                "stack": []
            }
            continue

        # CASE C: Tech / language used
        if any(k in lower for k in ["language used", "languages used", "tech stack", "technologies"]):
            current["stack_text"] = line.split(":", 1)[-1].strip()
            continue

        # CASE D: Description label
        if lower.startswith("description:"):
            current["description"].append(line.split(":", 1)[1].strip())
            continue

        # CASE E: Standalone title (creative resumes)
        # e.g. "NewslettrAI", "Timezone Bot"
        INVALID_PROJECT_TITLES = {
            "projects have been completed",
            "responsibilities",
            "roles and responsibilities",
            "summary",
            "profile",
            "experience",
            "education",
            "skills",
            "certifications",
        }

        if current["title"] is None:
            clean_title = line.strip().lower().rstrip(".")

            # ❌ Reject sentences & generic phrases
            if (
                "." in line
                or " have " in clean_title
                or " has " in clean_title
                or " been " in clean_title
                or clean_title in INVALID_PROJECT_TITLES
            ):
                continue

            # ✔ Accept real project titles only
            if 1 <= len(line.split()) <= 5:
                save_project()
                current = {
                    "title": line.strip(),
                    "description": [],
                    "stack_text": "",
                    "stack": []
                }
                continue


        # CASE F: Bullet or paragraph description
        if current["title"]:
            current["description"].append(
                re.sub(r"^[•\-–]\s*", "", line)
            )

    # ------------------------------------------
    # Save last project
    # ------------------------------------------
    save_project()

    return projects


# ---------------------------------------------------
# ATS SCORE
# ---------------------------------------------------
def calculate_ats_score(resume_skills, job_description):
    job_desc = job_description.lower()

    job_skill_set = set()
    for category in TECH_SKILLS.values():
        for skill, aliases in category.items():
            if re.search(r"\b" + re.escape(skill) + r"\b", job_desc):
                job_skill_set.add(skill)
            for a in aliases:
                if re.search(r"\b" + re.escape(a) + r"\b", job_desc):
                    job_skill_set.add(skill)

    if not job_skill_set:
        return 0, [], []

    resume_skill_set = set(resume_skills.keys())
    matched = resume_skill_set & job_skill_set
    missing = job_skill_set - resume_skill_set

    score = int(len(matched) / len(job_skill_set) * 100)
    return score, list(matched), list(missing)

# ---------------------------------------------------
# MAIN PARSER
# ---------------------------------------------------
def parse_resume(file_path, job_description=""):
    raw_text = read_pdf(file_path)
    sections = split_sections(raw_text)

    summary_text = get_section(sections, SECTION_ALIASES["summary"])
    skill_text = get_section(sections, SECTION_ALIASES["skills"])
    project_text = get_section(sections, SECTION_ALIASES["projects"])
    experience_text = get_section(sections, SECTION_ALIASES["experience"])
    education_text = get_section(sections, SECTION_ALIASES["education"])
    projects = parse_projects(project_text)
    if not projects:
        projects = parse_projects(raw_text)

    # Rule-based extraction
    rule_result = {
        "name": extract_name(raw_text),
        "email": extract_email(raw_text),
        "phone": extract_phone(raw_text),
        "skills": extract_skills(skill_text),
        "experience_years": extract_experience(experience_text),
        "education": extract_education(education_text),
        "projects": projects,
        "summary": summary_text[:500]
    }

    # LLM fallback ONLY if skills missing
    llm_result = {}
    if not rule_result["skills"] or not rule_result["projects"]:
        try:
            llm_result = llm_extract_resume(raw_text)
        except Exception:
            llm_result = {}

    final = merge_results(rule_result, llm_result)

    ats_score, matched, missing = calculate_ats_score(
        final["skills"], job_description
    )

    final["file"] = file_path
    final["ats_score"] = ats_score
    final["job_match"] = {
        "matched_skills": matched,
        "missing_skills": missing
    }
    # ---------------------------------------------------
    # NORMALIZE EDUCATION (LLM + RULE SAFE)
    # ---------------------------------------------------
    normalized_education = []
    
    for e in final.get("education", []):
        if isinstance(e, dict):
            degree = e.get("name") or e.get("degree")
            institution = e.get("institution") or e.get("university")
            start = e.get("start_date")
            end = e.get("end_date")
    
            years = ""
            if start or end:
                years = f"({start or ''} – {end or ''})".replace("  ", " ").strip(" –()")
    
            parts = [p for p in [degree, institution, years] if p]
    
            if parts:
                normalized_education.append(" - ".join(parts))
        else:
            normalized_education.append(str(e))
    
    final["education"] = normalized_education


    return final

# ---------------------------------------------------
# CLI
# ---------------------------------------------------
if __name__ == "__main__":
    file_path = sys.argv[1]
    job_desc = sys.argv[2] if len(sys.argv) > 2 else ""
    result = parse_resume(file_path, job_desc)
    print(json.dumps(result, indent=2))