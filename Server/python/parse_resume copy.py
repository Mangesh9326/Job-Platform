import sys
import re
import json
import spacy
import pdfplumber
from collections import Counter
from datetime import datetime

# Load spaCy
nlp = spacy.load("en_core_web_sm")

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
    text = text.lower()
    skill_counts = Counter()

    for category, skills in TECH_SKILLS.items():
        for skill, aliases in skills.items():

            # Build regex patterns for main skill + its aliases
            patterns = [skill] + aliases
            for p in patterns:
                # Word-boundary-safe multi-word detection
                pattern = r"\b" + re.escape(p) + r"\b"
                matches = len(re.findall(pattern, text))
                
                if matches:
                    skill_counts[skill] += matches  # always map to main normalized skill
    
    # Prevent divide-by-zero
    max_count = max(skill_counts.values(), default=1)

    # Convert raw counts -> percentage 1–100 ATS score
    skill_scores = {
        skill: int((count / max_count) * 100)
        for skill, count in skill_counts.items()
    }

    return dict(sorted(skill_scores.items(), key=lambda x: -x[1]))

# ---------------------------------------------------
# EXPERIENCE EXTRACTION (Years & Months)
# ---------------------------------------------------

def extract_experience(text):
    import re
    from datetime import datetime

    t = text.replace("–", "-").replace("—", "-")

    # Allowed month names
    month = r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|" \
            r"January|February|March|April|May|June|July|August|" \
            r"September|October|November|December)"

    # Matches:
    # April 2024 - September 2024
    # Nov 2024 - Jun 2025
    # 8 Jun 2025 - 10 Aug 2025
    date = rf"(?:\d{{1,2}}\s+{month}\s+\d{{4}}|{month}\s+\d{{1,2}},?\s+\d{{4}}|{month}\s+\d{{4}})"

    pattern = rf"({date})\s*[-to]+\s*({date})"
    pairs = re.findall(pattern, t, flags=re.IGNORECASE)

    def parse(d):
        d = d.replace(",", "").strip()
        for fmt in [
            "%d %b %Y", "%d %B %Y",
            "%b %d %Y", "%B %d %Y",
            "%b %Y", "%B %Y"
        ]:
            try:
                return datetime.strptime(d, fmt)
            except:
                pass
        # Year only
        if re.fullmatch(r"\d{4}", d):
            return datetime(int(d), 1, 1)
        return None

    total_months = 0
    used = set()

    for s_raw, e_raw in pairs:
        key = (s_raw, e_raw)
        if key in used:
            continue
        used.add(key)

        s = parse(s_raw)
        e = parse(e_raw)
        if not s or not e:
            continue

        # Compute duration
        months = (e.year - s.year) * 12 + (e.month - s.month)
        if 1 <= months <= 120:   # Limit to 10 years max (prevent noise)
            total_months += months

    return round(total_months / 12, 2)

# ---------------------------------------------------
# EDUCATION
# ---------------------------------------------------
def extract_education(text):
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

    return extracted

# ---------------------------------------------------
# PROJECTS
# ---------------------------------------------------
def parse_projects(text):
    # -----------------------------
    # STEP 1: Locate project section
    # -----------------------------
    proj_match = re.search(
        r"(PROJECTS?|PROJECT SECTION)(.+?)(EXPERIENCE|WORK EXPERIENCE|EDUCATION|SKILLS|CERTIFICATION|$)",
        text,
        flags=re.IGNORECASE | re.DOTALL
    )

    if not proj_match:
        return []

    proj_section = proj_match.group(2).strip()
    lines = [l.strip() for l in proj_section.split("\n") if l.strip()]

    projects = []
    current = {
        "title": None,
        "description": [],
        "stack_text": "",
        "stack": []
    }

    # Helper to save a project
    def save_project():
        if current["title"]:
            desc = " ".join(current["description"]).strip()
            stack_text = current["stack_text"]

            # Extract stack list from text
            stack = []
            if stack_text:
                stack = [s.strip().lower() for s in re.split(r"[,\|/]", stack_text) if s.strip()]

            projects.append({
                "title": current["title"],
                "description": desc,
                "language_used": current["stack_text"],
                "stack": stack
            })

    # ------------------------------------------
    # STEP 2: Loop through lines & detect formats
    # ------------------------------------------
    for line in lines:
        lower = line.lower()

        # CASE A: Numbered + Title format
        # ex: "1) Title: Food Ordering System"
        m = re.match(r"\d+\)?\s*title[:\-]?\s*(.+)", lower, flags=re.IGNORECASE)
        if m:
            save_project()
            current = {"title": m.group(1).strip(), "description": [], "stack_text": "", "stack": []}
            continue

        # CASE B: Title: Food Ordering System
        if lower.startswith("title:"):
            save_project()
            current = {"title": line.split(":",1)[1].strip(), "description": [], "stack_text": "", "stack": []}
            continue

        # CASE C: Language used
        if "language used" in lower or "languages used" in lower:
            current["stack_text"] = line.split(":",1)[1].strip()
            continue

        # CASE D: Description line
        if lower.startswith("description:"):
            current["description"].append(line.split(":",1)[1].strip())
            continue

        # CASE E: Uppercase or Title-like project headings
        # Example: "Attendance Management System"
        if line.isupper() or line.istitle():
            # Avoid false positives like "Skills", "Education"
            if line.lower() not in ["skills", "experience", "education", "projects"]:
                save_project()
                current = {"title": line.strip(), "description": [], "stack_text": "", "stack": []}
                continue

        # CASE F: Description text fallback
        if current["title"]:
            current["description"].append(line)

    # Save the final project
    save_project()

    return projects

# ---------------------------------------------------
# ATS SCORE
# ---------------------------------------------------
def calculate_ats_score(resume_skills, job_description):
    job_desc = job_description.lower()
    job_skills = [s for s in TECH_SKILLS if s in job_desc]
    if not job_skills: return 0, [], []
    resume_skill_set = set(resume_skills.keys())
    job_skill_set = set(job_skills)
    match = resume_skill_set & job_skill_set
    missing = job_skill_set - resume_skill_set
    score = int(len(match)/len(job_skill_set)*100)
    return score, list(match), list(missing)

# ---------------------------------------------------
# MAIN PARSER
# ---------------------------------------------------
def parse_resume(file_path, job_description=""):
    text = read_pdf(file_path)
    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    education = extract_education(text)
    
    # Projects
    proj_block = re.search(r"PROJECTS[\s\S]+?(?=EXPERIENCE|HOBBIES|$)", text, re.IGNORECASE)
    projects = parse_projects(proj_block.group()) if proj_block else []
    
    skills = extract_skills(text)
    experience_years = extract_experience(text)
    
    ats_score, matched_skills, missing_skills = calculate_ats_score(skills, job_description)
    
    summary = "\n".join(text.strip().split("\n")[:8])
    
    return {
        "file": file_path,
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "experience_years": experience_years,
        "education": education,
        "projects": projects,
        "summary": summary,
        "ats_score": ats_score,
        "job_match": {
            "matched_skills": matched_skills,
            "missing_skills": missing_skills
        }
    }

# ---------------------------------------------------
# CLI
# ---------------------------------------------------
if __name__ == "__main__":
    file_path = sys.argv[1]
    job_desc = sys.argv[2] if len(sys.argv) > 2 else ""
    result = parse_resume(file_path, job_desc)
    print(json.dumps(result, indent=2))