import express from 'express';
import { run, get, query } from '../config/db.js';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/projects/user/my-projects
 * Projects owned or joined by authenticated user
 */
router.get('/user/my-projects', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Owned projects
    const owned = await query(`
      SELECT p.*,
        (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as current_member_count,
        (SELECT COUNT(*) FROM join_requests jr WHERE jr.project_id = p.id AND jr.status = 'pending') as pending_requests_count
      FROM projects p
      WHERE p.owner_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    // Joined projects (excluding owned)
    const joined = await query(`
      SELECT p.*, pm.assigned_role, pm.joined_at, u.name as owner_name,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as current_member_count
      FROM project_members pm
      JOIN projects p ON pm.project_id = p.id
      JOIN users u ON p.owner_id = u.id
      WHERE pm.user_id = ? AND p.owner_id != ?
      ORDER BY pm.joined_at DESC
    `, [userId, userId]);

    res.json({
      success: true,
      data: {
        owned,
        joined
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/projects
 * Browse projects with search and filters
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { search, domain, skill, status, difficulty, page = 1, limit = 9 } = req.query;

    let sql = `
      SELECT p.*, u.name as owner_name, u.email as owner_email,
        (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as current_member_count
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      sql += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.domain LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (domain && domain.trim()) {
      sql += ` AND p.domain = ?`;
      params.push(domain.trim());
    }

    if (status && status.trim()) {
      sql += ` AND p.status = ?`;
      params.push(status.trim());
    }

    if (difficulty && difficulty.trim()) {
      sql += ` AND p.difficulty_level = ?`;
      params.push(difficulty.trim());
    }

    sql += ' ORDER BY p.created_at DESC';

    const allProjects = await query(sql, params);

    // Enrich with required skills and filter by skill if requested
    const enriched = [];
    for (const proj of allProjects) {
      const skills = await query(`
        SELECT prs.*, s.name as skill_name, s.category
        FROM project_required_skills prs
        JOIN skills s ON prs.skill_id = s.id
        WHERE prs.project_id = ?
      `, [proj.id]);

      const openPositions = Math.max(0, (proj.expected_team_size || 4) - proj.current_member_count);

      let matchesSkillFilter = true;
      if (skill && skill.trim()) {
        const found = skills.some(s => s.skill_name.toLowerCase() === skill.toLowerCase().trim());
        if (!found) matchesSkillFilter = false;
      }

      if (matchesSkillFilter) {
        enriched.push({
          ...proj,
          required_skills: skills,
          open_positions: openPositions,
          is_full: openPositions === 0
        });
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const total = enriched.length;
    const paginated = enriched.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: paginated
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/projects/:id
 * Project details
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const currentUserId = req.user?.id || 0;

    const project = await get(`
      SELECT p.*, u.name as owner_name, u.email as owner_email
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `, [projectId]);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    // Required skills
    const requiredSkills = await query(`
      SELECT prs.*, s.name as skill_name, s.category
      FROM project_required_skills prs
      JOIN skills s ON prs.skill_id = s.id
      WHERE prs.project_id = ?
    `, [projectId]);

    // Roles
    const roles = await query('SELECT * FROM project_roles WHERE project_id = ?', [projectId]);

    // Current members
    const memberRows = await query(`
      SELECT pm.id as membership_id, pm.user_id, pm.assigned_role, pm.joined_at,
             u.name, u.email, sp.department, sp.college, sp.year_of_study, sp.avatar_url
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE pm.project_id = ?
      ORDER BY pm.joined_at ASC
    `, [projectId]);

    const members = [];
    for (const m of memberRows) {
      const memSkills = await query(`
        SELECT ss.proficiency, s.name, s.category
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.user_id = ?
      `, [m.user_id]);
      members.push({ ...m, skills: memSkills });
    }

    // User relationship status
    const isOwner = currentUserId === project.owner_id;
    const isMember = members.some(m => m.user_id === currentUserId);

    let pendingRequest = null;
    if (currentUserId && !isMember) {
      pendingRequest = await get(
        'SELECT * FROM join_requests WHERE project_id = ? AND user_id = ? AND status = "pending"',
        [projectId, currentUserId]
      );
    }

    const openPositions = Math.max(0, (project.expected_team_size || 4) - members.length);

    res.json({
      success: true,
      data: {
        ...project,
        required_skills: requiredSkills,
        roles,
        members,
        open_positions: openPositions,
        is_full: openPositions === 0,
        user_status: {
          is_owner: isOwner,
          is_member: isMember,
          pending_request: pendingRequest
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const {
      title,
      description,
      domain,
      difficulty_level = 'Intermediate',
      expected_team_size = 4,
      duration_weeks = 8,
      weekly_commitment_hours = 10,
      required_skills = [],
      roles = []
    } = req.body;

    if (!title || !description || !domain) {
      return res.status(400).json({
        success: false,
        message: 'Project title, description, and domain are required.'
      });
    }

    const teamSize = Math.max(1, parseInt(expected_team_size, 10) || 4);

    const projRes = await run(`
      INSERT INTO projects (
        owner_id, title, description, domain, difficulty_level,
        expected_team_size, duration_weeks, weekly_commitment_hours, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Open')
    `, [
      req.user.id,
      title.trim(),
      description.trim(),
      domain.trim(),
      difficulty_level,
      teamSize,
      parseInt(duration_weeks, 10) || 8,
      parseInt(weekly_commitment_hours, 10) || 10
    ]);

    const projectId = projRes.lastInsertRowid;

    // Automatically add owner as project leader
    await run(
      'INSERT INTO project_members (project_id, user_id, assigned_role) VALUES (?, ?, ?)',
      [projectId, req.user.id, 'Project Lead']
    );

    // Insert required skills
    for (const reqSkill of required_skills) {
      let skillId = reqSkill.skill_id;
      if (!skillId && reqSkill.name) {
        const found = await get('SELECT id FROM skills WHERE LOWER(name) = ?', [reqSkill.name.trim().toLowerCase()]);
        if (found) {
          skillId = found.id;
        } else {
          const newSkill = await run('INSERT INTO skills (name, category) VALUES (?, ?)', [reqSkill.name.trim(), reqSkill.category || 'General']);
          skillId = newSkill.lastInsertRowid;
        }
      }

      if (skillId) {
        await run(`
          INSERT INTO project_required_skills (project_id, skill_id, min_proficiency, importance, weight)
          VALUES (?, ?, ?, ?, ?)
        `, [
          projectId,
          skillId,
          reqSkill.min_proficiency || 'Intermediate',
          reqSkill.importance || 'Required',
          parseFloat(reqSkill.weight) || 1.0
        ]);
      }
    }

    // Insert roles
    for (const role of roles) {
      const roleName = typeof role === 'string' ? role : role.role_name;
      if (roleName && roleName.trim()) {
        await run(
          'INSERT INTO project_roles (project_id, role_name, count_needed, description) VALUES (?, ?, ?, ?)',
          [projectId, roleName.trim(), parseInt(role.count_needed || '1', 10), role.description || '']
        );
      }
    }

    // Record activity
    await run(
      'INSERT INTO project_activity (project_id, user_id, action_type, description) VALUES (?, ?, ?, ?)',
      [projectId, req.user.id, 'project_created', `${req.user.name} created the project "${title.trim()}".`]
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully!',
      data: { id: projectId, title }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/projects/:id
 * Update project details (owner only)
 */
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized. Only project owner can edit project.' });
    }

    const {
      title,
      description,
      domain,
      difficulty_level,
      expected_team_size,
      duration_weeks,
      weekly_commitment_hours,
      status,
      required_skills,
      roles
    } = req.body;

    await run(`
      UPDATE projects SET
        title = ?,
        description = ?,
        domain = ?,
        difficulty_level = ?,
        expected_team_size = ?,
        duration_weeks = ?,
        weekly_commitment_hours = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title || project.title,
      description || project.description,
      domain || project.domain,
      difficulty_level || project.difficulty_level,
      parseInt(expected_team_size || project.expected_team_size, 10),
      parseInt(duration_weeks || project.duration_weeks, 10),
      parseInt(weekly_commitment_hours || project.weekly_commitment_hours, 10),
      status || project.status,
      projectId
    ]);

    // Update required skills if passed
    if (Array.isArray(required_skills)) {
      await run('DELETE FROM project_required_skills WHERE project_id = ?', [projectId]);
      for (const reqSkill of required_skills) {
        let skillId = reqSkill.skill_id;
        if (!skillId && reqSkill.name) {
          const found = await get('SELECT id FROM skills WHERE LOWER(name) = ?', [reqSkill.name.trim().toLowerCase()]);
          if (found) skillId = found.id;
          else {
            const newSkill = await run('INSERT INTO skills (name, category) VALUES (?, ?)', [reqSkill.name.trim(), reqSkill.category || 'General']);
            skillId = newSkill.lastInsertRowid;
          }
        }
        if (skillId) {
          await run(`
            INSERT INTO project_required_skills (project_id, skill_id, min_proficiency, importance, weight)
            VALUES (?, ?, ?, ?, ?)
          `, [
            projectId,
            skillId,
            reqSkill.min_proficiency || 'Intermediate',
            reqSkill.importance || 'Required',
            parseFloat(reqSkill.weight) || 1.0
          ]);
        }
      }
    }

    // Update roles if passed
    if (Array.isArray(roles)) {
      await run('DELETE FROM project_roles WHERE project_id = ?', [projectId]);
      for (const role of roles) {
        const roleName = typeof role === 'string' ? role : role.role_name;
        if (roleName && roleName.trim()) {
          await run(
            'INSERT INTO project_roles (project_id, role_name, count_needed, description) VALUES (?, ?, ?, ?)',
            [projectId, roleName.trim(), parseInt(role.count_needed || '1', 10), role.description || '']
          );
        }
      }
    }

    await run(
      'INSERT INTO project_activity (project_id, user_id, action_type, description) VALUES (?, ?, ?, ?)',
      [projectId, req.user.id, 'project_updated', `${req.user.name} updated the project details.`]
    );

    res.json({
      success: true,
      message: 'Project updated successfully.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/projects/:id
 * Delete or archive project (owner only)
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized. Only project owner can delete project.' });
    }

    await run('DELETE FROM projects WHERE id = ?', [projectId]);

    res.json({
      success: true,
      message: 'Project deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects/:id/leave
 * Leave project (members only, owner cannot leave without transferring or archiving)
 */
router.post('/:id/leave', authenticateToken, async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.owner_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Project owners cannot leave their own project. You may archive or delete the project instead.'
      });
    }

    const membership = await get('SELECT * FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, req.user.id]);
    if (!membership) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this project.'
      });
    }

    await run('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, req.user.id]);

    await run(
      'INSERT INTO project_activity (project_id, user_id, action_type, description) VALUES (?, ?, ?, ?)',
      [projectId, req.user.id, 'member_left', `${req.user.name} left the project team.`]
    );

    // Notify project owner
    await run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        project.owner_id,
        'Member Left Project',
        `${req.user.name} left your project "${project.title}".`,
        'warning',
        `/projects/${projectId}`
      ]
    );

    res.json({
      success: true,
      message: 'You have successfully left the project.'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
