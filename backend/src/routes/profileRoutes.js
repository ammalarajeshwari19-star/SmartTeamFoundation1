import express from 'express';
import { run, get, query } from '../config/db.js';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/profiles/me
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const profile = await get('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    const skills = await query(`
      SELECT ss.id, ss.skill_id, ss.proficiency, ss.years_experience, s.name, s.category
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.user_id = ?
      ORDER BY s.name ASC
    `, [req.user.id]);

    res.json({
      success: true,
      data: {
        user: req.user,
        profile: profile || {},
        skills: skills || []
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/profiles/me
 */
router.put('/me', authenticateToken, async (req, res, next) => {
  try {
    const {
      name,
      department,
      college,
      year_of_study,
      bio,
      interests,
      experience_summary,
      experience_level,
      preferred_roles,
      weekly_availability,
      github_url,
      portfolio_url,
      linkedin_url
    } = req.body;

    // Update user display name if provided
    if (name && name.trim()) {
      await run('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name.trim(), req.user.id]);
    }

    // Check if profile exists
    const existing = await get('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);

    if (existing) {
      await run(`
        UPDATE student_profiles SET
          department = ?,
          college = ?,
          year_of_study = ?,
          bio = ?,
          interests = ?,
          experience_summary = ?,
          experience_level = ?,
          preferred_roles = ?,
          weekly_availability = ?,
          github_url = ?,
          portfolio_url = ?,
          linkedin_url = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [
        department || '',
        college || '',
        parseInt(year_of_study || '3', 10),
        bio || '',
        interests || '',
        experience_summary || '',
        experience_level || 'Intermediate',
        preferred_roles || '',
        parseInt(weekly_availability || '10', 10),
        github_url || '',
        portfolio_url || '',
        linkedin_url || '',
        req.user.id
      ]);
    } else {
      await run(`
        INSERT INTO student_profiles (
          user_id, department, college, year_of_study, bio, interests,
          experience_summary, experience_level, preferred_roles,
          weekly_availability, github_url, portfolio_url, linkedin_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        req.user.id,
        department || '',
        college || '',
        parseInt(year_of_study || '3', 10),
        bio || '',
        interests || '',
        experience_summary || '',
        experience_level || 'Intermediate',
        preferred_roles || '',
        parseInt(weekly_availability || '10', 10),
        github_url || '',
        portfolio_url || '',
        linkedin_url || ''
      ]);
    }

    const updatedProfile = await get('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedProfile
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/profiles
 * Teammate Discovery with filters (skill, proficiency, role, availability, search)
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { search, skill, proficiency, role, min_availability, page = 1, limit = 12 } = req.query;
    const currentUserId = req.user?.id || 0;

    let baseSql = `
      SELECT u.id, u.name, u.email, u.avatar_url,
             sp.department, sp.college, sp.year_of_study, sp.bio, sp.interests,
             sp.experience_summary, sp.experience_level, sp.preferred_roles,
             sp.weekly_availability, sp.github_url, sp.portfolio_url
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id != ?
    `;
    const params = [currentUserId];

    if (search && search.trim()) {
      baseSql += ` AND (u.name LIKE ? OR sp.department LIKE ? OR sp.interests LIKE ? OR sp.preferred_roles LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (role && role.trim()) {
      baseSql += ` AND sp.preferred_roles LIKE ?`;
      params.push(`%${role.trim()}%`);
    }

    if (min_availability) {
      baseSql += ` AND sp.weekly_availability >= ?`;
      params.push(parseInt(min_availability, 10));
    }

    const allMatches = await query(baseSql, params);

    // Filter by skill & proficiency if requested
    const enrichedList = [];
    for (const student of allMatches) {
      const skills = await query(`
        SELECT ss.proficiency, ss.years_experience, s.name, s.category
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.user_id = ?
      `, [student.id]);

      let matchesSkillFilter = true;
      if (skill && skill.trim()) {
        const found = skills.find(s => s.name.toLowerCase() === skill.toLowerCase().trim());
        if (!found) {
          matchesSkillFilter = false;
        } else if (proficiency && proficiency.trim()) {
          if (found.proficiency.toLowerCase() !== proficiency.toLowerCase().trim()) {
            matchesSkillFilter = false;
          }
        }
      }

      if (matchesSkillFilter) {
        enrichedList.push({
          ...student,
          skills
        });
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const total = enrichedList.length;
    const paginated = enrichedList.slice((pageNum - 1) * limitNum, pageNum * limitNum);

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
 * GET /api/profiles/:id
 * Public Student Profile
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = await get('SELECT id, name, email, avatar_url FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const profile = await get('SELECT * FROM student_profiles WHERE user_id = ?', [userId]);
    const skills = await query(`
      SELECT ss.id, ss.skill_id, ss.proficiency, ss.years_experience, s.name, s.category
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.user_id = ?
    `, [userId]);

    // Fetch projects user is participating in
    const projects = await query(`
      SELECT p.id, p.title, p.domain, p.status, pm.assigned_role, pm.joined_at
      FROM project_members pm
      JOIN projects p ON pm.project_id = p.id
      WHERE pm.user_id = ?
    `, [userId]);

    res.json({
      success: true,
      data: {
        user,
        profile: profile || {},
        skills: skills || [],
        projects: projects || []
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
