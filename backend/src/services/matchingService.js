import { query, get } from '../config/db.js';

// Proficiency numerical mappings
export const PROFICIENCY_MAP = {
  'beginner': 1,
  'intermediate': 2,
  'advanced': 3,
  'expert': 4
};

// Default configurable weights
export const DEFAULT_WEIGHTS = {
  skillOverlap: 40,
  proficiency: 20,
  interests: 15,
  roles: 10,
  experience: 10,
  availability: 5
};

/**
 * Normalizes proficiency string to numeric score 1-4
 */
export function getProficiencyScore(level) {
  if (!level) return 1;
  const key = String(level).trim().toLowerCase();
  return PROFICIENCY_MAP[key] || 1;
}

/**
 * Calculates interest alignment between student interests and project domain/description
 */
export function calculateInterestAlignment(studentInterests = '', projectDomain = '', projectTitle = '', projectDesc = '') {
  if (!studentInterests) return 0.2; // default baseline

  const interestList = studentInterests
    .split(/[,;|]/)
    .map(i => i.trim().toLowerCase())
    .filter(Boolean);

  if (interestList.length === 0) return 0.2;

  const targetText = `${projectDomain} ${projectTitle} ${projectDesc}`.toLowerCase();
  let matches = 0;

  for (const interest of interestList) {
    if (targetText.includes(interest)) {
      matches += 1;
    } else {
      // Check partial words (e.g. "web", "ai", "cloud", "data")
      const words = interest.split(/\s+/).filter(w => w.length > 2);
      const wordMatch = words.some(w => targetText.includes(w));
      if (wordMatch) matches += 0.5;
    }
  }

  const ratio = Math.min(1.0, (matches * 1.5) / interestList.length);
  return Math.max(0.1, ratio);
}

/**
 * Calculates role compatibility between student preferred roles and project roles
 */
export function calculateRoleCompatibility(studentRoles = '', projectRoles = []) {
  if (!studentRoles) return 0.3;

  const preferred = studentRoles
    .split(/[,;|]/)
    .map(r => r.trim().toLowerCase())
    .filter(Boolean);

  if (preferred.length === 0) return 0.3;

  const projectRoleNames = (projectRoles || []).map(r => (typeof r === 'string' ? r : r.role_name || '').toLowerCase());
  if (projectRoleNames.length === 0) return 0.5;

  let bestMatch = 0.2;
  for (const pref of preferred) {
    for (const pRole of projectRoleNames) {
      if (pref === pRole || pRole.includes(pref) || pref.includes(pRole)) {
        bestMatch = 1.0;
        break;
      }
      const prefWords = pref.split(/\s+/);
      if (prefWords.some(w => w.length > 3 && pRole.includes(w))) {
        bestMatch = Math.max(bestMatch, 0.7);
      }
    }
    if (bestMatch === 1.0) break;
  }

  return bestMatch;
}

/**
 * Calculates experience compatibility
 */
export function calculateExperienceScore(studentExpLevel = 'Intermediate', projectDifficulty = 'Intermediate', studentSkills = []) {
  const levelOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
  const sLvl = levelOrder[String(studentExpLevel).toLowerCase()] || 2;
  const pLvl = levelOrder[String(projectDifficulty).toLowerCase()] || 2;

  let matchRatio = 0.7;
  if (sLvl >= pLvl) {
    matchRatio = 1.0;
  } else if (sLvl === pLvl - 1) {
    matchRatio = 0.6;
  } else {
    matchRatio = 0.3;
  }

  // Bonus for practical years of experience in student skills
  const avgYears = studentSkills.length > 0
    ? studentSkills.reduce((acc, s) => acc + (Number(s.years_experience) || 1), 0) / studentSkills.length
    : 1;

  const yearBonus = Math.min(0.2, (avgYears / 5) * 0.2);
  return Math.min(1.0, matchRatio * 0.8 + yearBonus);
}

/**
 * Calculates availability compatibility
 */
export function calculateAvailabilityScore(studentAvailability = 10, projectCommitment = 10) {
  const avail = Number(studentAvailability) || 0;
  const commit = Number(projectCommitment) || 10;

  if (avail >= commit) return 1.0;
  if (commit <= 0) return 1.0;
  return Math.max(0.1, Math.min(0.95, avail / commit));
}

/**
 * Core explainable skill-matching function for a single candidate against project requirements
 */
export function calculateStudentProjectMatch({
  student,
  studentSkills = [],
  project,
  requiredSkills = [],
  projectRoles = [],
  existingTeamMembers = [],
  weights = DEFAULT_WEIGHTS
}) {
  // If project requires no skills, baseline score
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      compatibilityScore: 50.0,
      breakdown: {
        skillOverlap: 0,
        proficiency: 0,
        interests: 15,
        roles: 10,
        experience: 15,
        availability: 10
      },
      matchingSkills: [],
      missingSkills: [],
      contributedSkills: [],
      suggestedRole: projectRoles[0]?.role_name || 'Contributor',
      rationale: 'Project has not yet configured specific technical skill requirements.',
      algorithmicEstimateNotice: 'Algorithmic estimate based on student profile and project criteria.'
    };
  }

  // Map student skills by lowercase name
  const studentSkillMap = new Map();
  studentSkills.forEach(s => {
    const name = (s.skill_name || s.name || '').trim().toLowerCase();
    if (name) {
      studentSkillMap.set(name, {
        name: s.skill_name || s.name,
        proficiency: s.proficiency || 'Beginner',
        profScore: getProficiencyScore(s.proficiency),
        yearsExperience: Number(s.years_experience) || 1
      });
    }
  });

  // Calculate skill overlap and proficiency
  let totalSkillWeight = 0;
  let matchedSkillWeight = 0;
  let totalProficiencySatisfaction = 0;

  const matchingSkills = [];
  const missingSkills = [];

  for (const req of requiredSkills) {
    const reqName = (req.skill_name || req.name || '').trim().toLowerCase();
    const reqProfScore = getProficiencyScore(req.min_proficiency);
    const importanceWeight = req.importance === 'Required' ? 1.0 : (req.importance === 'Preferred' ? 0.75 : 0.5);
    const weight = (Number(req.weight) || 1.0) * importanceWeight;

    totalSkillWeight += weight;

    if (studentSkillMap.has(reqName)) {
      const studentSkill = studentSkillMap.get(reqName);
      matchedSkillWeight += weight;

      // Proficiency satisfaction: candidate score / required score (capped at 1.0)
      const profSatisfaction = studentSkill.profScore >= reqProfScore
        ? 1.0
        : (studentSkill.profScore / reqProfScore);

      totalProficiencySatisfaction += (profSatisfaction * weight);

      matchingSkills.push({
        name: studentSkill.name,
        studentProficiency: studentSkill.proficiency,
        requiredProficiency: req.min_proficiency || 'Intermediate',
        satisfaction: Math.round(profSatisfaction * 100),
        yearsExperience: studentSkill.yearsExperience,
        importance: req.importance || 'Required'
      });
    } else {
      missingSkills.push({
        name: req.skill_name || req.name,
        requiredProficiency: req.min_proficiency || 'Intermediate',
        importance: req.importance || 'Required'
      });
    }
  }

  // Overlap ratio (0 to 1)
  const skillOverlapRatio = totalSkillWeight > 0 ? (matchedSkillWeight / totalSkillWeight) : 0;

  // Proficiency ratio (0 to 1)
  const proficiencyRatio = matchedSkillWeight > 0 ? (totalProficiencySatisfaction / matchedSkillWeight) : 0;

  // Interests alignment (0 to 1)
  const interestRatio = calculateInterestAlignment(
    student.interests || student.bio,
    project.domain,
    project.title,
    project.description
  );

  // Role compatibility (0 to 1)
  const roleRatio = calculateRoleCompatibility(student.preferred_roles, projectRoles);

  // Experience score (0 to 1)
  const experienceRatio = calculateExperienceScore(
    student.experience_level,
    project.difficulty_level,
    studentSkills
  );

  // Availability compatibility (0 to 1)
  const availabilityRatio = calculateAvailabilityScore(
    student.weekly_availability,
    project.weekly_commitment_hours
  );

  // Weighted score calculation
  const scoreOverlap = skillOverlapRatio * (weights.skillOverlap || 40);
  const scoreProf = proficiencyRatio * (weights.proficiency || 20);
  const scoreInterests = interestRatio * (weights.interests || 15);
  const scoreRole = roleRatio * (weights.roles || 10);
  const scoreExp = experienceRatio * (weights.experience || 10);
  const scoreAvail = availabilityRatio * (weights.availability || 5);

  const rawScore = scoreOverlap + scoreProf + scoreInterests + scoreRole + scoreExp + scoreAvail;
  const compatibilityScore = Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10));

  // Determine complementary skills that candidate brings to the existing team
  // Check which required skills are NOT yet covered by existing team members
  const existingTeamSkills = new Set();
  (existingTeamMembers || []).forEach(member => {
    (member.skills || []).forEach(ms => {
      const msName = (ms.skill_name || ms.name || '').trim().toLowerCase();
      if (msName) existingTeamSkills.add(msName);
    });
  });

  const contributedSkills = matchingSkills.filter(m => !existingTeamSkills.has(m.name.toLowerCase()));

  // Suggested role based on matching skills and student preferences
  let suggestedRole = 'Developer';
  const prefRoles = (student.preferred_roles || '').split(/[,;|]/).map(r => r.trim()).filter(Boolean);
  if (prefRoles.length > 0) {
    suggestedRole = prefRoles[0];
  } else if (matchingSkills.some(m => ['react', 'vue.js', 'figma', 'ui/ux design'].includes(m.name.toLowerCase()))) {
    suggestedRole = 'Frontend Developer / UI Specialist';
  } else if (matchingSkills.some(m => ['node.js', 'express.js', 'mysql', 'postgresql', 'python'].includes(m.name.toLowerCase()))) {
    suggestedRole = 'Backend Engineer';
  } else if (matchingSkills.some(m => ['machine learning', 'pytorch', 'tensorflow', 'computer vision'].includes(m.name.toLowerCase()))) {
    suggestedRole = 'AI / ML Specialist';
  }

  // Generate explainable rationale
  const rationaleParts = [];
  if (matchingSkills.length > 0) {
    const topSkills = matchingSkills.slice(0, 3).map(s => `${s.name} (${s.studentProficiency})`).join(', ');
    rationaleParts.push(`Matches ${matchingSkills.length} of ${requiredSkills.length} required skills: ${topSkills}.`);
  } else {
    rationaleParts.push(`No exact matches for required technical skills.`);
  }

  if (contributedSkills.length > 0) {
    const uncovers = contributedSkills.map(s => s.name).join(', ');
    rationaleParts.push(`Brings currently uncovered team skills: ${uncovers}.`);
  }

  if (missingSkills.length > 0) {
    const missNames = missingSkills.slice(0, 3).map(s => s.name).join(', ');
    rationaleParts.push(`Lacks: ${missNames}.`);
  }

  if (availabilityRatio >= 1.0) {
    rationaleParts.push(`Meets weekly availability requirement (${student.weekly_availability || 10}h/wk available vs ${project.weekly_commitment_hours || 10}h/wk needed).`);
  } else {
    rationaleParts.push(`Weekly availability is below commitment (${student.weekly_availability || 0}h/wk available vs ${project.weekly_commitment_hours || 10}h/wk commitment).`);
  }

  const rationale = rationaleParts.join(' ');

  return {
    compatibilityScore,
    breakdown: {
      skillOverlap: Math.round(scoreOverlap * 10) / 10,
      proficiency: Math.round(scoreProf * 10) / 10,
      interests: Math.round(scoreInterests * 10) / 10,
      roles: Math.round(scoreRole * 10) / 10,
      experience: Math.round(scoreExp * 10) / 10,
      availability: Math.round(scoreAvail * 10) / 10
    },
    matchingSkills,
    missingSkills,
    contributedSkills,
    suggestedRole,
    availabilityCompatibility: {
      studentAvailableHours: Number(student.weekly_availability) || 0,
      projectRequiredHours: Number(project.weekly_commitment_hours) || 10,
      ratio: Math.round(availabilityRatio * 100)
    },
    rationale,
    algorithmicEstimateNotice: 'Note: Compatibility scores are algorithmic estimates based on profile match, not absolute guarantees of team synergy.'
  };
}

/**
 * Skill Gap Analysis for a project and its current members
 */
export function analyzeProjectSkillGaps({ project, requiredSkills = [], teamMembers = [], allCandidates = [] }) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      skillCoveragePercentage: 100,
      totalRequiredSkills: 0,
      coveredSkills: [],
      partiallyCoveredSkills: [],
      missingSkills: [],
      coverageSummary: 'No specific technical skills are required for this project.',
      recommendedCandidatesForMissingSkills: []
    };
  }

  // Aggregate team skills: map skillName -> highest proficiency score & members who have it
  const teamSkillsMap = new Map();

  for (const member of teamMembers) {
    for (const skill of member.skills || []) {
      const sName = (skill.skill_name || skill.name || '').trim().toLowerCase();
      if (!sName) continue;
      const profScore = getProficiencyScore(skill.proficiency);

      if (!teamSkillsMap.has(sName)) {
        teamSkillsMap.set(sName, {
          highestProfScore: profScore,
          highestProfLevel: skill.proficiency,
          members: [{ name: member.name, proficiency: skill.proficiency }]
        });
      } else {
        const existing = teamSkillsMap.get(sName);
        if (profScore > existing.highestProfScore) {
          existing.highestProfScore = profScore;
          existing.highestProfLevel = skill.proficiency;
        }
        existing.members.push({ name: member.name, proficiency: skill.proficiency });
      }
    }
  }

  const coveredSkills = [];
  const partiallyCoveredSkills = [];
  const missingSkills = [];

  let totalWeightedRequirement = 0;
  let satisfiedWeight = 0;

  for (const req of requiredSkills) {
    const reqName = (req.skill_name || req.name || '').trim().toLowerCase();
    const reqProfScore = getProficiencyScore(req.min_proficiency);
    const weight = Number(req.weight) || 1.0;
    totalWeightedRequirement += weight;

    if (teamSkillsMap.has(reqName)) {
      const covered = teamSkillsMap.get(reqName);
      if (covered.highestProfScore >= reqProfScore) {
        coveredSkills.push({
          name: req.skill_name || req.name,
          category: req.category || 'General',
          requiredProficiency: req.min_proficiency || 'Intermediate',
          currentHighestProficiency: covered.highestProfLevel,
          coveredBy: covered.members
        });
        satisfiedWeight += weight;
      } else {
        // Partially covered: team has it but below required proficiency
        partiallyCoveredSkills.push({
          name: req.skill_name || req.name,
          category: req.category || 'General',
          requiredProficiency: req.min_proficiency || 'Intermediate',
          currentHighestProficiency: covered.highestProfLevel,
          coveredBy: covered.members,
          gapNote: `Current highest level is ${covered.highestProfLevel}, but ${req.min_proficiency} is required.`
        });
        satisfiedWeight += (weight * (covered.highestProfScore / reqProfScore));
      }
    } else {
      missingSkills.push({
        name: req.skill_name || req.name,
        category: req.category || 'General',
        requiredProficiency: req.min_proficiency || 'Intermediate',
        importance: req.importance || 'Required'
      });
    }
  }

  const skillCoveragePercentage = totalWeightedRequirement > 0
    ? Math.round((satisfiedWeight / totalWeightedRequirement) * 100)
    : 100;

  // Find candidate recommendations specifically for missing skills
  const missingSkillNames = new Set(missingSkills.map(m => m.name.toLowerCase()));
  const candidatesForMissing = [];

  for (const cand of allCandidates) {
    // Check if candidate has any of the missing skills
    const matchingMissing = (cand.skills || []).filter(s =>
      missingSkillNames.has((s.skill_name || s.name || '').toLowerCase())
    );

    if (matchingMissing.length > 0) {
      candidatesForMissing.push({
        userId: cand.user_id || cand.id,
        name: cand.name,
        department: cand.department,
        skillsProvided: matchingMissing.map(m => ({
          name: m.skill_name || m.name,
          proficiency: m.proficiency
        })),
        missingSkillsCoveredCount: matchingMissing.length
      });
    }
  }

  // Sort candidates by count of missing skills covered
  candidatesForMissing.sort((a, b) => b.missingSkillsCoveredCount - a.missingSkillsCoveredCount);

  return {
    skillCoveragePercentage,
    totalRequiredSkills: requiredSkills.length,
    coveredSkillsCount: coveredSkills.length,
    partiallyCoveredSkillsCount: partiallyCoveredSkills.length,
    missingSkillsCount: missingSkills.length,
    coveredSkills,
    partiallyCoveredSkills,
    missingSkills,
    coverageSummary: `${coveredSkills.length} covered, ${partiallyCoveredSkills.length} partial, ${missingSkills.length} missing (${skillCoveragePercentage}% coverage)`,
    recommendedCandidatesForMissingSkills: candidatesForMissing.slice(0, 5)
  };
}

/**
 * Greedy Team Formation Recommendation Algorithm
 * Optimizes complementary skill coverage while maximizing overall candidate compatibility
 */
export function recommendBalancedTeamComposition({
  project,
  requiredSkills = [],
  existingMembers = [],
  eligibleCandidates = [],
  targetTeamSize = 4
}) {
  const openPositions = Math.max(0, targetTeamSize - (existingMembers?.length || 0));

  if (openPositions <= 0) {
    return {
      status: 'full',
      message: `Project has already reached its team size limit (${existingMembers?.length || 0}/${targetTeamSize}).`,
      recommendedTeam: [],
      projectedCoveragePercentage: 100
    };
  }

  if (!eligibleCandidates || eligibleCandidates.length === 0) {
    return {
      status: 'no_candidates',
      message: 'No eligible candidates found for recommendation.',
      recommendedTeam: [],
      projectedCoveragePercentage: 0
    };
  }

  // Working set of simulated members starting with existing members
  const currentTeam = [...(existingMembers || [])];
  const remainingCandidates = [...eligibleCandidates];
  const selectedRecommendations = [];

  for (let step = 0; step < openPositions; step++) {
    if (remainingCandidates.length === 0) break;

    // Evaluate each remaining candidate against the evolving team state
    let bestCandidateIndex = -1;
    let bestCandidateScore = -1;
    let bestCandidateMatchData = null;

    for (let i = 0; i < remainingCandidates.length; i++) {
      const candidate = remainingCandidates[i];

      const matchData = calculateStudentProjectMatch({
        student: candidate,
        studentSkills: candidate.skills || [],
        project,
        requiredSkills,
        projectRoles: project.roles || [],
        existingTeamMembers: currentTeam
      });

      // Greedy heuristic: Base compatibility score + complementary skills bonus
      // Each newly contributed skill adds a bonus of 15 points to prioritize coverage
      const complementaryBonus = (matchData.contributedSkills?.length || 0) * 15;
      const compositeHeuristicScore = matchData.compatibilityScore + complementaryBonus;

      if (compositeHeuristicScore > bestCandidateScore) {
        bestCandidateScore = compositeHeuristicScore;
        bestCandidateIndex = i;
        bestCandidateMatchData = matchData;
      }
    }

    if (bestCandidateIndex !== -1) {
      const chosen = remainingCandidates.splice(bestCandidateIndex, 1)[0];
      selectedRecommendations.push({
        candidate: {
          id: chosen.id || chosen.user_id,
          name: chosen.name,
          email: chosen.email,
          department: chosen.department,
          year: chosen.year_of_study,
          weeklyAvailability: chosen.weekly_availability,
          experienceLevel: chosen.experience_level,
          skills: chosen.skills || []
        },
        selectionRank: step + 1,
        matchDetails: bestCandidateMatchData,
        rationale: `Selected for rank #${step + 1}: ${bestCandidateMatchData.rationale}`
      });

      // Add chosen candidate to the simulated team for the next iteration
      currentTeam.push(chosen);
    }
  }

  // Calculate projected final coverage after adding recommendations
  const projectedGapAnalysis = analyzeProjectSkillGaps({
    project,
    requiredSkills,
    teamMembers: currentTeam
  });

  return {
    status: 'success',
    openPositions,
    recommendedTeam: selectedRecommendations,
    projectedCoveragePercentage: projectedGapAnalysis.skillCoveragePercentage,
    projectedGapAnalysis
  };
}

/**
 * Service function: Fetch all required data from DB and calculate teammate recommendations for a project
 */
export async function getProjectTeammateRecommendations(projectId, currentUserId, options = {}) {
  // 1. Fetch project
  const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);
  if (!project) throw new Error('Project not found');

  // 2. Fetch project required skills
  const requiredSkills = await query(`
    SELECT prs.*, s.name as skill_name, s.category
    FROM project_required_skills prs
    JOIN skills s ON prs.skill_id = s.id
    WHERE prs.project_id = ?
  `, [projectId]);

  // 3. Fetch project roles
  const projectRoles = await query('SELECT * FROM project_roles WHERE project_id = ?', [projectId]);

  // 4. Fetch existing members
  const memberRows = await query(`
    SELECT pm.user_id, pm.assigned_role, u.name, u.email, sp.department, sp.weekly_availability
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    WHERE pm.project_id = ?
  `, [projectId]);

  const existingMemberIds = new Set(memberRows.map(m => m.user_id));

  // Populate skills for existing members
  const existingMembers = [];
  for (const m of memberRows) {
    const memberSkills = await query(`
      SELECT ss.*, s.name as skill_name, s.category
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.user_id = ?
    `, [m.user_id]);
    existingMembers.push({ ...m, skills: memberSkills });
  }

  // Check if team is already full
  const expectedSize = project.expected_team_size || 4;
  const isFull = existingMembers.length >= expectedSize;

  // 5. Fetch all eligible candidate students (excluding current members and requesting user)
  const candidateUsers = await query(`
    SELECT u.id, u.name, u.email, sp.department, sp.college, sp.year_of_study, sp.bio,
           sp.interests, sp.experience_summary, sp.experience_level, sp.preferred_roles,
           sp.weekly_availability, sp.github_url, sp.portfolio_url
    FROM users u
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    WHERE u.id NOT IN (${Array.from(existingMemberIds).join(',') || 0})
      AND u.id != ?
  `, [currentUserId || 0]);

  // Populate skills for candidates
  const eligibleCandidates = [];
  for (const cand of candidateUsers) {
    const candSkills = await query(`
      SELECT ss.*, s.name as skill_name, s.category
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.user_id = ?
    `, [cand.id]);
    eligibleCandidates.push({ ...cand, skills: candSkills });
  }

  // Calculate individual recommendations for all eligible candidates
  const individualRecommendations = [];
  for (const candidate of eligibleCandidates) {
    const match = calculateStudentProjectMatch({
      student: candidate,
      studentSkills: candidate.skills || [],
      project,
      requiredSkills,
      projectRoles,
      existingTeamMembers: existingMembers
    });

    individualRecommendations.push({
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        department: candidate.department,
        college: candidate.college,
        year: candidate.year_of_study,
        bio: candidate.bio,
        interests: candidate.interests,
        preferredRoles: candidate.preferred_roles,
        weeklyAvailability: candidate.weekly_availability,
        experienceLevel: candidate.experience_level,
        github: candidate.github_url,
        portfolio: candidate.portfolio_url,
        skills: candidate.skills
      },
      ...match
    });
  }

  // Sort descending by compatibility score
  individualRecommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // Calculate greedy team formation recommendation
  const teamFormation = recommendBalancedTeamComposition({
    project,
    requiredSkills,
    existingMembers,
    eligibleCandidates,
    targetTeamSize: expectedSize
  });

  // Calculate current team skill gap analysis
  const skillGapAnalysis = analyzeProjectSkillGaps({
    project,
    requiredSkills,
    teamMembers: existingMembers,
    allCandidates: eligibleCandidates
  });

  return {
    project: {
      id: project.id,
      title: project.title,
      domain: project.domain,
      expectedTeamSize: expectedSize,
      currentMemberCount: existingMembers.length,
      openPositions: Math.max(0, expectedSize - existingMembers.length),
      status: project.status,
      isFull
    },
    skillGapAnalysis,
    teamFormation,
    individualRecommendations
  };
}

/**
 * Service function: Recommend projects for a student based on their profile
 */
export async function getStudentProjectRecommendations(userId) {
  const student = await get(`
    SELECT u.id, u.name, u.email, sp.*
    FROM users u
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    WHERE u.id = ?
  `, [userId]);
  if (!student) throw new Error('Student not found');

  const studentSkills = await query(`
    SELECT ss.*, s.name as skill_name, s.category
    FROM student_skills ss
    JOIN skills s ON ss.skill_id = s.id
    WHERE ss.user_id = ?
  `, [userId]);

  // Fetch open projects where user is not yet a member
  const projects = await query(`
    SELECT p.*, u.name as owner_name
    FROM projects p
    JOIN users u ON p.owner_id = u.id
    WHERE p.status = 'Open'
      AND p.id NOT IN (
        SELECT project_id FROM project_members WHERE user_id = ?
      )
  `, [userId]);

  const recommendations = [];

  for (const project of projects) {
    const requiredSkills = await query(`
      SELECT prs.*, s.name as skill_name, s.category
      FROM project_required_skills prs
      JOIN skills s ON prs.skill_id = s.id
      WHERE prs.project_id = ?
    `, [project.id]);

    const projectRoles = await query('SELECT * FROM project_roles WHERE project_id = ?', [project.id]);

    const memberCountRow = await get('SELECT COUNT(*) as count FROM project_members WHERE project_id = ?', [project.id]);
    const currentMemberCount = memberCountRow?.count || 0;
    const isFull = currentMemberCount >= (project.expected_team_size || 4);

    if (isFull) continue; // Exclude full projects from recommendations

    const match = calculateStudentProjectMatch({
      student,
      studentSkills,
      project,
      requiredSkills,
      projectRoles,
      existingTeamMembers: []
    });

    recommendations.push({
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        domain: project.domain,
        difficultyLevel: project.difficulty_level,
        expectedTeamSize: project.expected_team_size,
        currentMemberCount,
        openPositions: (project.expected_team_size || 4) - currentMemberCount,
        durationWeeks: project.duration_weeks,
        weeklyCommitmentHours: project.weekly_commitment_hours,
        ownerName: project.owner_name,
        requiredSkills
      },
      ...match
    });
  }

  recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  return recommendations;
}

export default {
  calculateStudentProjectMatch,
  analyzeProjectSkillGaps,
  recommendBalancedTeamComposition,
  getProjectTeammateRecommendations,
  getStudentProjectRecommendations
};
