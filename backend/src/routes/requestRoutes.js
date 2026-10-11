import express from 'express';
import { run, get, query } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/requests/my-requests
 * Returns current user's outgoing requests and incoming invitations
 */
router.get('/my-requests', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Outgoing requests sent by user
    const outgoing = await query(`
      SELECT jr.*, p.title as project_title, p.domain as project_domain, u.name as owner_name
      FROM join_requests jr
      JOIN projects p ON jr.project_id = p.id
      JOIN users u ON p.owner_id = u.id
      WHERE jr.user_id = ? AND jr.type = 'request'
      ORDER BY jr.created_at DESC
    `, [userId]);

    // Incoming invitations received by user
    const incomingInvitations = await query(`
      SELECT jr.*, p.title as project_title, p.domain as project_domain, u.name as invited_by_name
      FROM join_requests jr
      JOIN projects p ON jr.project_id = p.id
      JOIN users u ON p.owner_id = u.id
      WHERE jr.user_id = ? AND jr.type = 'invitation'
      ORDER BY jr.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: {
        outgoingRequests: outgoing,
        incomingInvitations
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/projects/:id/requests
 * Get all requests for a project (owner only)
 */
router.get('/project/:id', authenticateToken, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);

    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    if (project.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only project owner can view team join requests.' });
    }

    const requests = await query(`
      SELECT jr.*, u.name, u.email, sp.department, sp.college, sp.year_of_study,
             sp.experience_level, sp.weekly_availability, sp.bio
      FROM join_requests jr
      JOIN users u ON jr.user_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE jr.project_id = ?
      ORDER BY jr.created_at DESC
    `, [projectId]);

    for (const reqItem of requests) {
      reqItem.skills = await query(`
        SELECT ss.proficiency, s.name, s.category
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.user_id = ?
      `, [reqItem.user_id]);
    }

    res.json({
      success: true,
      data: requests
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/join
 * Student applies to join a project
 */
router.post('/project/:id/join', authenticateToken, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const { proposed_role, message } = req.body;
    const userId = req.user.id;

    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Check project status
    if (project.status !== 'Open') {
      return res.status(400).json({ success: false, message: 'This project is not currently accepting new members.' });
    }

    // Check if user is already a member
    const existingMember = await get('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, userId]);
    if (existingMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this project.' });
    }

    // Enforce team size limit
    const memberCountRow = await get('SELECT COUNT(*) as count FROM project_members WHERE project_id = ?', [projectId]);
    if ((memberCountRow?.count || 0) >= (project.expected_team_size || 4)) {
      return res.status(400).json({ success: false, message: 'This project has already reached its team size limit.' });
    }

    // Check if pending request exists
    const existingReq = await get(
      'SELECT id FROM join_requests WHERE project_id = ? AND user_id = ? AND status = "pending"',
      [projectId, userId]
    );
    if (existingReq) {
      return res.status(400).json({ success: false, message: 'You already have a pending join request for this project.' });
    }

    const insertRes = await run(`
      INSERT INTO join_requests (project_id, user_id, type, status, proposed_role, message)
      VALUES (?, ?, 'request', 'pending', ?, ?)
    `, [projectId, userId, proposed_role || 'Contributor', message || '']);

    // Notify project owner
    await run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        project.owner_id,
        'New Project Join Request',
        `${req.user.name} requested to join "${project.title}" as ${proposed_role || 'Contributor'}.`,
        'join_request',
        `/projects/${projectId}/manage`
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Join request submitted successfully. The project owner will review your application.',
      data: { id: insertRes.lastInsertRowid }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/invite
 * Project owner invites a student
 */
router.post('/project/:id/invite', authenticateToken, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const { candidate_user_id, proposed_role, message } = req.body;

    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (project.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only project owner can invite candidates.' });
    }

    const targetUser = await get('SELECT id, name FROM users WHERE id = ?', [candidate_user_id]);
    if (!targetUser) return res.status(404).json({ success: false, message: 'Candidate user not found.' });

    // Check if candidate is already a member
    const existingMember = await get('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, candidate_user_id]);
    if (existingMember) {
      return res.status(400).json({ success: false, message: 'Candidate is already a team member.' });
    }

    // Check team size
    const memberCountRow = await get('SELECT COUNT(*) as count FROM project_members WHERE project_id = ?', [projectId]);
    if ((memberCountRow?.count || 0) >= (project.expected_team_size || 4)) {
      return res.status(400).json({ success: false, message: 'Project has reached its team size limit.' });
    }

    // Check existing pending invitation
    const existingInv = await get(
      'SELECT id FROM join_requests WHERE project_id = ? AND user_id = ? AND status = "pending"',
      [projectId, candidate_user_id]
    );
    if (existingInv) {
      return res.status(400).json({ success: false, message: 'An active request or invitation already exists for this candidate.' });
    }

    const insertRes = await run(`
      INSERT INTO join_requests (project_id, user_id, type, status, proposed_role, message)
      VALUES (?, ?, 'invitation', 'pending', ?, ?)
    `, [projectId, candidate_user_id, proposed_role || 'Team Member', message || '']);

    // Notify candidate
    await run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        candidate_user_id,
        'Project Team Invitation',
        `${req.user.name} invited you to join "${project.title}" as ${proposed_role || 'Team Member'}.`,
        'invitation',
        '/notifications'
      ]
    );

    res.status(201).json({
      success: true,
      message: `Invitation successfully sent to ${targetUser.name}!`,
      data: { id: insertRes.lastInsertRowid }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/requests/:id/respond
 * Accept or reject join request or invitation
 */
router.post('/:id/respond', authenticateToken, async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { action } = req.body; // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be accept or reject.' });
    }

    const requestItem = await get('SELECT * FROM join_requests WHERE id = ?', [requestId]);
    if (!requestItem) return res.status(404).json({ success: false, message: 'Request not found.' });

    if (requestItem.status !== 'pending') {
      return res.status(400).json({ success: false, message: `This request has already been ${requestItem.status}.` });
    }

    const project = await get('SELECT * FROM projects WHERE id = ?', [requestItem.project_id]);
    if (!project) return res.status(404).json({ success: false, message: 'Associated project not found.' });

    // Authorization checks:
    // If type === 'request' (student applied), project owner must respond.
    // If type === 'invitation' (owner invited student), the invited student must respond.
    if (requestItem.type === 'request') {
      if (project.owner_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only project owner can respond to student join requests.' });
      }
    } else if (requestItem.type === 'invitation') {
      if (requestItem.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Only the invited student can respond to this invitation.' });
      }
    }

    if (action === 'accept') {
      // Check team capacity
      const memberCountRow = await get('SELECT COUNT(*) as count FROM project_members WHERE project_id = ?', [project.id]);
      if ((memberCountRow?.count || 0) >= (project.expected_team_size || 4)) {
        return res.status(400).json({
          success: false,
          message: `Cannot accept: Team has already reached maximum capacity of ${project.expected_team_size} members.`
        });
      }

      // Add to project_members
      await run(
        'INSERT INTO project_members (project_id, user_id, assigned_role) VALUES (?, ?, ?)',
        [project.id, requestItem.user_id, requestItem.proposed_role || 'Team Member']
      );

      // Update request status
      await run('UPDATE join_requests SET status = "accepted", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [requestId]);

      // Record activity
      const student = await get('SELECT name FROM users WHERE id = ?', [requestItem.user_id]);
      await run(
        'INSERT INTO project_activity (project_id, user_id, action_type, description) VALUES (?, ?, ?, ?)',
        [project.id, requestItem.user_id, 'member_joined', `${student?.name || 'A new member'} joined the team as ${requestItem.proposed_role || 'Team Member'}.`]
      );

      // Send reciprocal notification
      const notifyUserId = requestItem.type === 'request' ? requestItem.user_id : project.owner_id;
      const notifyMsg = requestItem.type === 'request'
        ? `Your join request for "${project.title}" was accepted! Welcome to the team.`
        : `${req.user.name} accepted your invitation to join "${project.title}"!`;

      await run(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
        [notifyUserId, 'Team Request Accepted', notifyMsg, 'success', `/projects/${project.id}`]
      );

      return res.json({
        success: true,
        message: 'Request accepted and new team member added successfully!'
      });
    } else {
      // Reject
      await run('UPDATE join_requests SET status = "rejected", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [requestId]);

      const notifyUserId = requestItem.type === 'request' ? requestItem.user_id : project.owner_id;
      const notifyMsg = requestItem.type === 'request'
        ? `Your join request for "${project.title}" was declined.`
        : `${req.user.name} declined the invitation to join "${project.title}".`;

      await run(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
        [notifyUserId, 'Request Update', notifyMsg, 'info', `/projects/${project.id}`]
      );

      return res.json({
        success: true,
        message: 'Request has been rejected.'
      });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
