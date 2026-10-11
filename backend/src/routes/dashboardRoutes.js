import express from 'express';
import { get, query } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getStudentProjectRecommendations, getProjectTeammateRecommendations } from '../services/matchingService.js';

const router = express.Router();

/**
 * GET /api/dashboard
 * Aggregates all live statistics from the database for the user dashboard
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user & student profile
    const user = await get('SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?', [userId]);
    const profile = await get('SELECT * FROM student_profiles WHERE user_id = ?', [userId]);

    // 2. Fetch user skills
    const userSkills = await query(`
      SELECT ss.id, ss.skill_id, ss.proficiency, ss.years_experience, s.name, s.category
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.user_id = ?
    `, [userId]);

    // 3. Calculate profile completion percentage
    let completionScore = 0;
    if (user.name) completionScore += 15;
    if (profile?.department) completionScore += 15;
    if (profile?.bio && profile.bio.length > 20) completionScore += 15;
    if (profile?.interests) completionScore += 15;
    if (profile?.preferred_roles) completionScore += 10;
    if (profile?.weekly_availability) completionScore += 10;
    if (userSkills.length >= 3) completionScore += 20;
    else if (userSkills.length > 0) completionScore += 10;

    const profileCompletionPercentage = Math.min(100, completionScore);

    // 4. Projects owned by user
    const ownedProjects = await query(`
      SELECT p.*,
        (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as current_member_count,
        (SELECT COUNT(*) FROM join_requests jr WHERE jr.project_id = p.id AND jr.status = 'pending') as pending_requests_count
      FROM projects p
      WHERE p.owner_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    // 5. Projects joined by user (excluding owned)
    const joinedProjects = await query(`
      SELECT p.*, pm.assigned_role, pm.joined_at, u.name as owner_name,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as current_member_count
      FROM project_members pm
      JOIN projects p ON pm.project_id = p.id
      JOIN users u ON p.owner_id = u.id
      WHERE pm.user_id = ? AND p.owner_id != ?
      ORDER BY pm.joined_at DESC
    `, [userId, userId]);

    // 6. Pending join requests & invitations count
    const pendingOutgoing = await get(`
      SELECT COUNT(*) as count FROM join_requests WHERE user_id = ? AND type = 'request' AND status = 'pending'
    `, [userId]);

    const pendingIncoming = await get(`
      SELECT COUNT(*) as count FROM join_requests WHERE user_id = ? AND type = 'invitation' AND status = 'pending'
    `, [userId]);

    // 7. Get recommended projects for this student
    let recommendedProjects = [];
    try {
      recommendedProjects = await getStudentProjectRecommendations(userId);
    } catch {
      recommendedProjects = [];
    }

    // 8. If the user owns projects, compute project-owner summary for the most active project
    let primaryOwnedProjectSummary = null;
    if (ownedProjects.length > 0) {
      const mainProj = ownedProjects[0];
      try {
        const recoData = await getProjectTeammateRecommendations(mainProj.id, userId);
        primaryOwnedProjectSummary = {
          project: mainProj,
          skillGapAnalysis: recoData.skillGapAnalysis,
          teamFormation: recoData.teamFormation,
          topRecommendedCandidates: recoData.individualRecommendations.slice(0, 4)
        };
      } catch (e) {
        console.error('Error generating project owner summary:', e);
      }
    }

    // 9. Skill development suggestions (find high-demand skills in open projects that this user lacks)
    const inDemandSkills = await query(`
      SELECT s.name, s.category, COUNT(prs.project_id) as demand_count
      FROM project_required_skills prs
      JOIN skills s ON prs.skill_id = s.id
      WHERE s.id NOT IN (SELECT skill_id FROM student_skills WHERE user_id = ?)
      GROUP BY s.id
      ORDER BY demand_count DESC
      LIMIT 4
    `, [userId]);

    // 10. Recent activity feed
    const recentActivity = await query(`
      SELECT pa.*, p.title as project_title
      FROM project_activity pa
      JOIN projects p ON pa.project_id = p.id
      WHERE p.id IN (
        SELECT project_id FROM project_members WHERE user_id = ?
      )
      ORDER BY pa.created_at DESC
      LIMIT 6
    `, [userId]);

    res.json({
      success: true,
      data: {
        user,
        profile: profile || {},
        skills: userSkills,
        metrics: {
          profileCompletionPercentage,
          totalProjectsCreated: ownedProjects.length,
          totalProjectsJoined: joinedProjects.length,
          pendingRequestsCount: (pendingOutgoing?.count || 0) + (pendingIncoming?.count || 0),
          recommendedProjectsCount: recommendedProjects.length
        },
        ownedProjects,
        joinedProjects,
        recommendedProjects: recommendedProjects.slice(0, 4),
        primaryOwnedProjectSummary,
        skillDevelopmentSuggestions: inDemandSkills,
        recentActivity
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
