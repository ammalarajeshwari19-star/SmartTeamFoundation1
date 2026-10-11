import express from 'express';
import { run, get, query } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/skills
 * List all available master skills
 */
router.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let sql = 'SELECT * FROM skills WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      sql += ' AND name LIKE ?';
      params.push(`%${search.trim()}%`);
    }

    if (category && category.trim()) {
      sql += ' AND category = ?';
      params.push(category.trim());
    }

    sql += ' ORDER BY category ASC, name ASC';
    const skills = await query(sql, params);

    res.json({
      success: true,
      data: skills
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/skills/my-skills
 * Add skill to student profile
 */
router.post('/my-skills', authenticateToken, async (req, res, next) => {
  try {
    const { skill_id, skill_name, category, proficiency = 'Intermediate', years_experience = 1.0 } = req.body;

    let targetSkillId = skill_id;

    // If new skill name provided, find or create
    if (!targetSkillId && skill_name && skill_name.trim()) {
      const existing = await get('SELECT id FROM skills WHERE LOWER(name) = ?', [skill_name.trim().toLowerCase()]);
      if (existing) {
        targetSkillId = existing.id;
      } else {
        const createRes = await run(
          'INSERT INTO skills (name, category) VALUES (?, ?)',
          [skill_name.trim(), category?.trim() || 'General']
        );
        targetSkillId = createRes.lastInsertRowid;
      }
    }

    if (!targetSkillId) {
      return res.status(400).json({
        success: false,
        message: 'A valid skill must be selected or provided.'
      });
    }

    // Check for duplicate skill assignment
    const alreadyAssigned = await get(
      'SELECT id FROM student_skills WHERE user_id = ? AND skill_id = ?',
      [req.user.id, targetSkillId]
    );

    if (alreadyAssigned) {
      return res.status(409).json({
        success: false,
        message: 'You have already added this skill to your profile. Please edit its proficiency instead.'
      });
    }

    const validProficiencies = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const safeProficiency = validProficiencies.includes(proficiency) ? proficiency : 'Intermediate';

    const insertRes = await run(
      'INSERT INTO student_skills (user_id, skill_id, proficiency, years_experience) VALUES (?, ?, ?, ?)',
      [req.user.id, targetSkillId, safeProficiency, parseFloat(years_experience) || 1.0]
    );

    const createdRecord = await get(`
      SELECT ss.id, ss.skill_id, ss.proficiency, ss.years_experience, s.name, s.category
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.id = ?
    `, [insertRes.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Skill added to profile.',
      data: createdRecord
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/skills/my-skills/:id
 * Update proficiency or years of experience
 */
router.put('/my-skills/:id', authenticateToken, async (req, res, next) => {
  try {
    const studentSkillId = parseInt(req.params.id, 10);
    const { proficiency, years_experience } = req.body;

    const existing = await get(
      'SELECT id FROM student_skills WHERE id = ? AND user_id = ?',
      [studentSkillId, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Skill record not found on your profile.'
      });
    }

    const validProficiencies = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const safeProficiency = validProficiencies.includes(proficiency) ? proficiency : 'Intermediate';

    await run(
      'UPDATE student_skills SET proficiency = ?, years_experience = ? WHERE id = ?',
      [safeProficiency, parseFloat(years_experience) || 1.0, studentSkillId]
    );

    const updated = await get(`
      SELECT ss.id, ss.skill_id, ss.proficiency, ss.years_experience, s.name, s.category
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.id = ?
    `, [studentSkillId]);

    res.json({
      success: true,
      message: 'Skill updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/skills/my-skills/:id
 * Remove skill from profile
 */
router.delete('/my-skills/:id', authenticateToken, async (req, res, next) => {
  try {
    const studentSkillId = parseInt(req.params.id, 10);

    const existing = await get(
      'SELECT id FROM student_skills WHERE id = ? AND user_id = ?',
      [studentSkillId, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Skill record not found on your profile.'
      });
    }

    await run('DELETE FROM student_skills WHERE id = ?', [studentSkillId]);

    res.json({
      success: true,
      message: 'Skill removed from your profile.'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
