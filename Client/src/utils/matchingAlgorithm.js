// Helper to safely extract number from "2 Years", "3", or undefined
const parseExperience = (exp) => {
  if (!exp) return 0;
  const match = String(exp).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

export const rankCandidates = (jdSkills, profiles) => {
  if (!jdSkills || !Array.isArray(jdSkills) || jdSkills.length === 0) {
    return [];
  }

  const scoredProfiles = profiles.map((profile) => {
    const candidateSkills = new Set();

    if (profile.domains && Array.isArray(profile.domains)) {
      profile.domains.forEach((domain) => {
        if (domain.sections) {
          (domain.sections.languages || []).forEach((s) => {
            if (s && String(s).trim()) candidateSkills.add(String(s).trim().toLowerCase());
          });
          (domain.sections.frameworks || []).forEach((s) => {
            if (s && String(s).trim()) {
              let clean = String(s).trim().toLowerCase();
              if (clean === "eact") clean = "react";
              candidateSkills.add(clean);
            }
          });
          (domain.sections.certifications || []).forEach((s) => {
            if (s && String(s).trim()) candidateSkills.add(String(s).trim().toLowerCase());
          });
        }
      });
    }

    const candidateSkillsArray = Array.from(candidateSkills);
    const matched = [];
    const missing = [];

    jdSkills.forEach((reqSkill) => {
      if (typeof reqSkill !== "string" || !reqSkill.trim()) return;

      const reqLower = reqSkill.trim().toLowerCase();

      const isMatch = candidateSkillsArray.some((us) => {
        if (us === reqLower) return true;
        if (us.replace(/\s+/g, "") === reqLower.replace(/\s+/g, "")) return true;
        if ((us === "js" && reqLower === "javascript") || (us === "javascript" && reqLower === "js")) return true;
        if ((us === "node" && reqLower === "node.js") || (us === "node.js" && reqLower === "node")) return true;

        const reqTokens = reqLower.split(/[\s\.\-\/]+/);
        const usTokens = us.split(/[\s\.\-\/]+/);

        if (reqTokens.includes(us)) return true;
        if (usTokens.includes(reqLower)) return true;

        return false;
      });

      if (isMatch) {
        if (!matched.includes(reqSkill)) matched.push(reqSkill);
      } else {
        if (!missing.includes(reqSkill)) missing.push(reqSkill);
      }
    });

    const matchScore = jdSkills.length > 0 ? Math.floor((matched.length / jdSkills.length) * 100) : 0;
    const experienceInYears = parseExperience(profile.totalExperience);

    return { ...profile, matchScore, experienceInYears, matchedSkills: matched, missingSkills: missing };
  });

  return scoredProfiles
    .filter((profile) => profile.matchScore > 0)
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return b.experienceInYears - a.experienceInYears;
    })
    .slice(0, 10);
};