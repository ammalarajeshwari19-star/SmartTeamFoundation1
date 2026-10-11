import express from 'express';
import { run, get, query } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

/**
 * GET /api/projects/:id/members
 */
router.get('/', async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);

    const members = await query(`
      SELECT pm.id as membership_id, pm.project_id, pm.user_id, pm.assigned_role, pm.joined_at,
             u.name, u.email, sp.department, sp.college, sp.year_of_study, sp.bio,
             sp.experience_level, sp.weekly_availability, sp.github_url, sp.portfolio_url
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE pm.project_id = ?
      ORDER BY pm.joined_at ASC
    `, [projectId]);

    for (const mem of members) {
      mem.skills = await query(`
        SELECT ss.proficiency, ss.years_experience, s.name, s.category
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.user_id = ?
      `, [mem.user_id]);
    }

    res.json({
      success: true,
      data: members
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/projects/:id/members/:userId
 * Assign role (owner only)
 */
router.put('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const targetUserId = parseInt(req.params.userId, 10);
    const { assigned_role } = req.body;

    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only project owner can assign roles.' });
    }

    const member = await get('SELECT * FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, targetUserId]);
    if (!member) {
      return res.status(404).json({ success: false, message: 'User is not a member of this project.' });
    }

    await run('UPDATE project_members SET assigned_role = ? WHERE project_id = ? AND user_id = ?', [assigned_role || 'Team Member', projectId, targetUserId]);

    // Notify member
    await run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        targetUserId,
        'Role Updated in Project',
        `Your role in "${project.title}" has been updated to "${assigned_role || 'Team Member'}".`,
        'info',
        `/projects/${projectId}`
      ]
    );

    res.json({
      success: true,
      message: 'Member role updated successfully.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/projects/:id/members/:userId
 * Remove a member from the project (owner only)
 */
router.delete('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const targetUserId = parseInt(req.params.userId, 10);

    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only project owner can remove team members.' });
    }

    if (targetUserId === project.owner_id) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project owner from the team.' });
    }

    const member = await get('SELECT * FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, targetUserId]);
    if (!member) {
      return res.status(404).json({ success: false, message: 'User is not a member of this project.' });
    }

    const targetUser = await get('SELECT name FROM users WHERE id = ?', [targetUserId]);

    await run('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, targetUserId]);

    await run(
      'INSERT INTO project_activity (project_id, user_id, action_type, description) VALUES (?, ?, ?, ?)',
      [projectId, req.user.id, 'member_removed', `${req.user.name} removed ${targetUser?.name || 'a member'} from the team.`]
    );

    await run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        targetUserId,
        'Removed from Project',
        `You have been removed from the team for project "${project.title}".`,
        'warning',
        '/projects'
      ]
    );

    res.json({
      success: true,
      message: 'Member removed from project.'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
