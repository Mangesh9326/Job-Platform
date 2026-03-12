import os
import re
import sys
import json
import pdfplumber
import spacy
from collections import Counter
from datetime import datetime
from dotenv import load_dotenv
from google import genai




load_dotenv()
client = genai.Client()

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
    return text.strip()

# ---------------------------------------------------
# NAME
# ---------------------------------------------------
def extract_name(text):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    blacklist = {"resume", "cv", "profile", "summary"}

    for line in lines[:10]:
        clean = re.sub(r"[^\w\s]", "", line)
        words = clean.split()
        if 2 <= len(words) <= 5 and all(w.isalpha() for w in words):
            if not any(w.lower() in blacklist for w in words):
                return " ".join(w.capitalize() for w in words)

    doc = nlp(text[:500])
    for ent in doc.ents:
        if ent.label_ == "PERSON" and 2 <= len(ent.text.split()) <= 5:
            return ent.text.strip()

    return None

# ---------------------------------------------------
# EMAIL
# ---------------------------------------------------
def extract_email(text):
    matches = re.findall(
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
        text
    )
    if not matches:
        return None

    priority = ["gmail.com", "outlook.com", "yahoo.com"]
    for e in matches:
        if any(e.endswith(p) for p in priority):
            return e
    return matches[0]

# ---------------------------------------------------
# PHONE
# ---------------------------------------------------
def extract_phone(text):
    nums = re.findall(r"\+?\d[\d\s().-]{7,16}\d", text)
    cleaned = [re.sub(r"[^\d+]", "", n) for n in nums]

    for n in cleaned:
        if n.startswith("+91") and len(n) == 12:
            return n
    for n in cleaned:
        if len(n) == 10:
            return n
    return cleaned[0] if cleaned else None

# ---------------------------------------------------
# EXPERIENCE (DATES ONLY – AI NOT USED)
# ---------------------------------------------------
def extract_experience(text):
    t = text.replace("–", "-").replace("—", "-")

    month = r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|" \
        r"January|February|March|April|June|July|August|" \
        r"September|October|November|December)"
    date = rf"(?:\d{{1,2}}\s+{month}\s+\d{{4}}|{month}\s+\d{{4}})"

    pattern = rf"({date})\s*[-to]+\s*({date})"
    matches = re.findall(pattern, t, flags=re.IGNORECASE)

    def parse(d):
        d = d.replace(",", "")
        for f in ("%d %b %Y","%d %B %Y","%b %Y","%B %Y"):
            try:
                return datetime.strptime(d, f)
            except:
                pass
        return None

    total_months = 0
    seen = set()

    for s,e in matches:
        key = s+"-"+e
        if key in seen:
            continue
        seen.add(key)

        ds, de = parse(s), parse(e)
        if not ds or not de:
            continue

        m = (de.year - ds.year)*12 + (de.month - ds.month)
        if 1 <= m <= 120:
            total_months += m

    return round(total_months / 12, 2)

# ---------------------------------------------------
# EDUCATION (STRICT FILTERING)
# ---------------------------------------------------
def extract_education(text):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    patterns = [
        r"\bBachelor\b", r"\bMaster\b", r"\bB\.?\s*Tech\b", r"\bM\.?\s*Tech\b",
        r"\bB\.?\s*Sc\b", r"\bM\.?\s*Sc\b", r"\bBCA\b", r"\bMCA\b",
        r"\bMBA\b", r"\bHSC\b", r"\bSSC\b", r"\bPh\.?D\b"
    ]

    regex = re.compile("|".join(patterns), re.IGNORECASE)
    edu = []

    for l in lines:
        if regex.search(l) and len(l) > 8:
            if not re.fullmatch(r"[A-Za-z ]+", l):
                edu.append(re.sub(r"\s+", " ", l))

    return list(dict.fromkeys(edu))

# ---------------------------------------------------
# RULE-BASED SKILLS (FAST)
# ---------------------------------------------------
from collections import Counter
import re

def extract_skills_rule(text):
    text = text.lower()

    # ---------------------------------
    # Skill dictionary with aliases
    # ---------------------------------
    SKILL_MAP = {

        # Frontend
        "html": ["html5"],
        "css": ["css3"],
        "javascript": ["js", "ecmascript"],
        "typescript": ["ts"],
        "react": ["reactjs", "react.js"],
        "angular": ["angularjs"],
        "vue": ["vuejs"],
        "bootstrap": [],
        "tailwind": ["tailwindcss"],
        "jquery": [],
        "next.js": ["nextjs"],
        "vite": [],

        # Backend
        "node": ["nodejs", "node.js"],
        "express": ["expressjs", "express.js"],
        "python": [],
        "django": [],
        "flask": [],
        "fastapi": [],
        "java": ["core java", "advanced java"],
        "spring": ["spring boot"],
        "php": [],
        "laravel": [],
        "c": [],
        "c++": ["cpp"],
        "c#": ["csharp", ".net"],
        "golang": ["go"],
        "ruby": [],
        "rails": ["ruby on rails"],

        # Databases
        "sql": [],
        "mysql": [],
        "postgresql": ["postgres"],
        "mongodb": ["mongo"],
        "sqlite": [],
        "oracle": [],
        "redis": [],
        "firebase": ["firestore"],

        # Mobile
        "android": ["android development"],
        "flutter": [],
        "dart": [],
        "react native": ["react-native"],
        "swift": [],
        "kotlin": [],

        # DevOps / Cloud
        "aws": ["amazon web services"],
        "azure": [],
        "gcp": ["google cloud"],
        "docker": [],
        "kubernetes": ["k8s"],
        "jenkins": [],
        "ci/cd": ["cicd"],
        "nginx": [],
        "linux": [],

        # Data / AI
        "machine learning": ["ml"],
        "artificial intelligence": ["ai"],
        "nlp": ["natural language processing"],
        "data analysis": [],
        "pandas": [],
        "numpy": [],
        "tensorflow": [],
        "pytorch": ["torch"],

        # Tools
        "git": [],
        "github": [],
        "gitlab": [],
        "jira": [],
        "postman": [],
        "swagger": [],
    }

    counts = Counter()

    # ---------------------------------
    # Count skills safely
    # ---------------------------------
    for skill, aliases in SKILL_MAP.items():
        patterns = [skill] + aliases

        for p in patterns:
            pattern = r"\b" + re.escape(p) + r"\b"
            matches = len(re.findall(pattern, text))
            if matches:
                counts[skill] += matches

    if not counts:
        return {}

    # ---------------------------------
    # Normalize relevance score (1–100)
    # ---------------------------------
    max_count = max(counts.values())

    skill_scores = {
        skill: int((count / max_count) * 100)
        for skill, count in counts.items()
    }

    # Sort by relevance (highest first)
    return dict(sorted(skill_scores.items(), key=lambda x: -x[1]))

# ---------------------------------------------------
# GEMINI: SKILLS NORMALIZATION
# ---------------------------------------------------
def gemini_skills(text, rule_skills):
    prompt = f"""
Extract only TECHNICAL skills from the resume.
Normalize names (React.js → React).
Return JSON only.

Resume:
{text[:3000]}

Existing skills:
{list(rule_skills.keys())}

Format:
{{"skills":[{{"name":"React","score":90}}]}}
"""
    r = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
def safe_json_load(text):
    try:
        text = re.sub(r"```json|```", "", text).strip()
        return json.loads(text)
    except:
        return None

# ---------------------------------------------------
# GEMINI: PROJECTS (ALL FORMATS)
# ---------------------------------------------------
def gemini_projects(text):
    prompt = f"""
Extract ONLY projects (not internships/jobs).

Rules:
- Each project must have title + description
- Stack optional or languages or tools or technologies
- Ignore experience

Resume:
{text[:4000]}

Return JSON ONLY in this format:
{{"projects":[{{"title":"","description":"","stack":[]}}]}}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return safe_json_load(response.text)


# ---------------------------------------------------
# GEMINI: SUMMARY
# ---------------------------------------------------
def gemini_summary(text):
    r = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Summarize resume in 4 professional bullet points:\n{text[:2000]}"
    )
    return r.text.strip()

# ---------------------------------------------------
# MAIN PARSER
# ---------------------------------------------------
def parse_resume(file_path):
    text = read_pdf(file_path)

    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    education = extract_education(text)
    experience_years = extract_experience(text)

    skills_rule = extract_skills_rule(text)
    skills_ai = gemini_skills(text, skills_rule)

    projects = gemini_projects(text)
    summary = gemini_summary(text)

    return {
        "file": file_path,
        "name": name,
        "email": email,
        "phone": phone,
        "experience_years": experience_years,
        "education": education,
        "skills": skills_ai if skills_ai else skills_rule,
        "projects": projects,
        "summary": summary
    }

# ---------------------------------------------------
# CLI
# ---------------------------------------------------
if __name__ == "__main__":
    result = parse_resume(sys.argv[1])
    print(json.dumps(result, indent=2))