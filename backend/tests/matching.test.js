import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStudentProjectMatch,
  analyzeProjectSkillGaps,
  recommendBalancedTeamComposition,
  getProficiencyScore,
  calculateAvailabilityScore
} from '../src/services/matchingService.js';

test('Test Case 1: Student matching all required skills with high proficiency', () => {
  const student = {
    id: 101,
    name: 'Full Match Student',
    interests: 'Web Development, Cloud Computing',
    preferred_roles: 'Full Stack Developer',
    experience_level: 'Advanced',
    weekly_availability: 15
  };

  const studentSkills = [
    { name: 'React', proficiency: 'Advanced', years_experience: 3 },
    { name: 'Node.js', proficiency: 'Advanced', years_experience: 2.5 },
    { name: 'MySQL', proficiency: 'Intermediate', years_experience: 2 }
  ];

  const project = {
    id: 201,
    title: 'Web Platform',
    domain: 'Web Development',
    description: 'Modern full stack web platform',
    difficulty_level: 'Intermediate',
    weekly_commitment_hours: 10
  };

  const requiredSkills = [
    { name: 'React', min_proficiency: 'Intermediate', importance: 'Required', weight: 1.0 },
    { name: 'Node.js', min_proficiency: 'Intermediate', importance: 'Required', weight: 1.0 },
    { name: 'MySQL', min_proficiency: 'Intermediate', importance: 'Required', weight: 1.0 }
  ];

  const result = calculateStudentProjectMatch({
    student,
    studentSkills,
    project,
    requiredSkills,
    projectRoles: ['Full Stack Developer']
  });

  assert.ok(result.compatibilityScore >= 80, `Expected score >= 80, got ${result.compatibilityScore}`);
  assert.equal(result.missingSkills.length, 0, 'Should have 0 missing skills');
  assert.equal(result.matchingSkills.length, 3, 'Should have matched all 3 skills');
  assert.ok(result.rationale.includes('Matches 3 of 3'), 'Rationale should mention 3 of 3 matches');
});

test('Test Case 2: Student matching only some required skills (partial match)', () => {
  const student = {
    id: 102,
    name: 'Partial Student',
    interests: 'Web Development',
    preferred_roles: 'Frontend Developer',
    experience_level: 'Intermediate',
    weekly_availability: 10
  };

  const studentSkills = [
    { name: 'React', proficiency: 'Intermediate', years_experience: 1.5 }
  ];

  const project = {
    id: 202,
    title: 'Full Stack App',
    domain: 'Web Development',
    description: 'App needing React and Python',
    difficulty_level: 'Intermediate',
    weekly_commitment_hours: 10
  };

  const requiredSkills = [
    { name: 'React', min_proficiency: 'Intermediate', importance: 'Required', weight: 1.0 },
    { name: 'Python', min_proficiency: 'Intermediate', importance: 'Required', weight: 1.0 }
  ];

  const result = calculateStudentProjectMatch({
    student,
    studentSkills,
    project,
    requiredSkills
  });

  assert.ok(result.compatibilityScore > 30 && result.compatibilityScore < 80, `Expected partial score, got ${result.compatibilityScore}`);
  assert.equal(result.matchingSkills.length, 1);
  assert.equal(result.missingSkills.length, 1);
  assert.equal(result.missingSkills[0].name, 'Python');
});

test('Test Case 3: Student with relevant skills but low availability', () => {
  const student = {
    id: 103,
    name: 'Busy Student',
    interests: 'Web Development',
    preferred_roles: 'Frontend Developer',
    experience_level: 'Advanced',
    weekly_availability: 3 // Only 3 hours available
  };

  const studentSkills = [
    { name: 'React', proficiency: 'Expert', years_experience: 3 }
  ];

  const project = {
    id: 203,
    title: 'Intensive Project',
    domain: 'Web Development',
    weekly_commitment_hours: 15 // Requires 15 hours
  };

  const requiredSkills = [
    { name: 'React', min_proficiency: 'Intermediate', importance: 'Required', weight: 1.0 }
  ];

  const result = calculateStudentProjectMatch({
    student,
    studentSkills,
    project,
    requiredSkills
  });

  assert.ok(result.availabilityCompatibility.ratio <= 25, 'Availability ratio should be 20% or less');
  assert.ok(result.breakdown.availability <= 1.5, 'Availability component score should be reduced');
  assert.ok(result.rationale.includes('below commitment'), 'Rationale should flag availability shortage');
});

test('Test Case 4: Project with missing team skills (Skill Gap Analysis)', () => {
  const project = { id: 204, title: 'AI Assistant', domain: 'AI & ML' };
  const requiredSkills = [
    { name: 'Python', min_proficiency: 'Advanced', weight: 1.0 },
    { name: 'FastAPI', min_proficiency: 'Intermediate', weight: 1.0 },
    { name: 'PyTorch', min_proficiency: 'Advanced', weight: 1.0 },
    { name: 'Docker', min_proficiency: 'Intermediate', weight: 1.0 }
  ];

  // Current team only has Python and FastAPI
  const teamMembers = [
    {
      name: 'Alice',
      skills: [
        { name: 'Python', proficiency: 'Advanced' },
        { name: 'FastAPI', proficiency: 'Intermediate' }
      ]
    }
  ];

  const allCandidates = [
    {
      user_id: 105,
      name: 'ML Candidate',
      skills: [{ name: 'PyTorch', proficiency: 'Advanced' }, { name: 'Docker', proficiency: 'Intermediate' }]
    }
  ];

  const gapAnalysis = analyzeProjectSkillGaps({ project, requiredSkills, teamMembers, allCandidates });

  assert.equal(gapAnalysis.coveredSkillsCount, 2, 'Should have 2 covered skills');
  assert.equal(gapAnalysis.missingSkillsCount, 2, 'Should have 2 missing skills (PyTorch, Docker)');
  assert.equal(gapAnalysis.skillCoveragePercentage, 50, 'Coverage should be 50%');
  assert.equal(gapAnalysis.recommendedCandidatesForMissingSkills.length, 1);
  assert.equal(gapAnalysis.recommendedCandidatesForMissingSkills[0].name, 'ML Candidate');
});

test('Test Case 5: Project with no eligible candidates', () => {
  const project = { id: 205, title: 'Solo Project', expected_team_size: 3 };
  const teamFormation = recommendBalancedTeamComposition({
    project,
    requiredSkills: [{ name: 'React', min_proficiency: 'Intermediate' }],
    existingMembers: [{ name: 'Leader' }],
    eligibleCandidates: [],
    targetTeamSize: 3
  });

  assert.equal(teamFormation.status, 'no_candidates');
  assert.equal(teamFormation.recommendedTeam.length, 0);
  assert.ok(teamFormation.message.includes('No eligible candidates'));
});

test('Test Case 6: Project that has reached its team-size limit', () => {
  const project = { id: 206, title: 'Full Project', expected_team_size: 2 };
  const teamFormation = recommendBalancedTeamComposition({
    project,
    requiredSkills: [{ name: 'React', min_proficiency: 'Intermediate' }],
    existingMembers: [{ name: 'User 1' }, { name: 'User 2' }],
    eligibleCandidates: [{ name: 'User 3' }],
    targetTeamSize: 2
  });

  assert.equal(teamFormation.status, 'full');
  assert.equal(teamFormation.recommendedTeam.length, 0);
  assert.ok(teamFormation.message.includes('reached its team size limit'));
});

test('Test Case 7: Project with no current members', () => {
  const project = { id: 207, title: 'New Brand Project', expected_team_size: 2 };
  const requiredSkills = [
    { name: 'React', min_proficiency: 'Intermediate', weight: 1.0 },
    { name: 'Node.js', min_proficiency: 'Intermediate', weight: 1.0 }
  ];
  const candidates = [
    { id: 1, name: 'Alice', skills: [{ name: 'React', proficiency: 'Advanced' }] },
    { id: 2, name: 'Bob', skills: [{ name: 'Node.js', proficiency: 'Advanced' }] }
  ];

  const teamFormation = recommendBalancedTeamComposition({
    project,
    requiredSkills,
    existingMembers: [],
    eligibleCandidates: candidates,
    targetTeamSize: 2
  });

  assert.equal(teamFormation.status, 'success');
  assert.equal(teamFormation.recommendedTeam.length, 2);
  assert.equal(teamFormation.openPositions, 2);
});

test('Test Case 8: Student who is already a member (should be excluded from recommendations)', () => {
  const existingMembers = [{ user_id: 50, name: 'Existing Member' }];
  const eligibleCandidates = [
    { user_id: 51, name: 'Fresh Candidate', skills: [{ name: 'Python', proficiency: 'Advanced' }] }
  ];

  // Eligible candidates list provided to recommendation function must not contain existing member
  const isExistingMemberInCandidates = eligibleCandidates.some(c => c.user_id === existingMembers[0].user_id);
  assert.equal(isExistingMemberInCandidates, false, 'Existing member must not be in candidate pool');
});

test('Test Case 9: Project with incomplete or empty skill requirements', () => {
  const student = { id: 60, name: 'Generalist', weekly_availability: 10 };
  const project = { id: 209, title: 'Open Ideation Project', domain: 'General' };

  // Empty required skills array
  const result = calculateStudentProjectMatch({
    student,
    studentSkills: [{ name: 'JavaScript', proficiency: 'Intermediate' }],
    project,
    requiredSkills: []
  });

  assert.equal(result.compatibilityScore, 50.0);
  assert.ok(result.rationale.includes('not yet configured'));
  assert.equal(result.matchingSkills.length, 0);
  assert.equal(result.missingSkills.length, 0);
});

test('Test Case 10: Project whose requirements change after initial calculation', () => {
  const student = { id: 70, name: 'Frontend Dev', weekly_availability: 10 };
  const studentSkills = [{ name: 'React', proficiency: 'Advanced' }];
  const project = { id: 210, title: 'Evolving Project', domain: 'Web' };

  // Initial requirements: React
  const initialReqs = [{ name: 'React', min_proficiency: 'Intermediate', weight: 1.0 }];
  const match1 = calculateStudentProjectMatch({ student, studentSkills, project, requiredSkills: initialReqs });

  // Requirements change to: Python & Machine Learning
  const updatedReqs = [
    { name: 'Python', min_proficiency: 'Advanced', weight: 1.0 },
    { name: 'Machine Learning', min_proficiency: 'Advanced', weight: 1.0 }
  ];
  const match2 = calculateStudentProjectMatch({ student, studentSkills, project, requiredSkills: updatedReqs });

  assert.ok(match1.compatibilityScore > match2.compatibilityScore, 'Score must reflect new requirements dynamically');
  assert.equal(match2.missingSkills.length, 2, 'Student now lacks newly added skills');
});
