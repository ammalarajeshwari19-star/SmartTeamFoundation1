import express from 'express';
import {
  getProjectTeammateRecommendations,
  getStudentProjectRecommendations,
  analyzeProjectSkillGaps,
  recommendBalancedTeamComposition
} from '../services/matchingService.js';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';
import { get, query } from '../config/db.js';

const router = express.Router();

/**
 * GET /api/matching/projects/:id/recommendations
 * Candidate recommendations for a project
 */
router.get('/projects/:id/recommendations', optionalAuth, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const currentUserId = req.user?.id || 0;

    const data = await getProjectTeammateRecommendations(projectId, currentUserId);

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/matching/projects/:id/skill-gap
 * Skill gap analysis for a project
 */
router.get('/projects/:id/skill-gap', optionalAuth, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);

    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const requiredSkills = await query(`
      SELECT prs.*, s.name as skill_name, s.category
      FROM project_required_skills prs
      JOIN skills s ON prs.skill_id = s.id
      WHERE prs.project_id = ?
    `, [projectId]);

    const memberRows = await query(`
      SELECT pm.user_id, u.name, u.email
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
    `, [projectId]);

    const teamMembers = [];
    const memberIdSet = new Set(memberRows.map(m => m.user_id));

    for (const m of memberRows) {
      const skills = await query(`
        SELECT ss.*, s.name as skill_name, s.category
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.user_id = ?
      `, [m.user_id]);
      teamMembers.push({ ...m, skills });
    }

    // Fetch candidate students outside the team for recommendations
    const candidateUsers = await query(`
      SELECT u.id, u.name, u.email, sp.department
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id NOT IN (${Array.from(memberIdSet).join(',') || 0})
    `);

    const allCandidates = [];
    for (const c of candidateUsers) {
      const skills = await query(`
        SELECT ss.*, s.name as skill_name, s.category
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.user_id = ?
      `, [c.id]);
      allCandidates.push({ ...c, skills });
    }

    const gapAnalysis = analyzeProjectSkillGaps({
      project,
      requiredSkills,
      teamMembers,
      allCandidates
    });

    res.json({
      success: true,
      data: {
        project: {
          id: project.id,
          title: project.title,
          domain: project.domain,
          expectedTeamSize: project.expected_team_size,
          currentMemberCount: teamMembers.length
        },
        ...gapAnalysis
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/matching/projects/:id/team-formation
 * Greedy team formation recommendation
 */
router.get('/projects/:id/team-formation', optionalAuth, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const data = await getProjectTeammateRecommendations(projectId, req.user?.id || 0);

    res.json({
      success: true,
      data: data.teamFormation
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/matching/my-recommended-projects
 * Projects recommended for current student
 */
router.get('/my-recommended-projects', authenticateToken, async (req, res, next) => {
  try {
    const recommendations = await getStudentProjectRecommendations(req.user.id);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (err) {
    next(err);
  }
});

export default router;
