import express from 'express';
import bcrypt from 'bcryptjs';
import { run, get, query } from '../config/db.js';
import { generateToken, authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, department, college, year_of_study } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation does not match password.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const userRes = await run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), passwordHash, 'student']
    );

    const userId = userRes.lastInsertRowid;

    // Create initial student profile
    await run(
      `INSERT INTO student_profiles (user_id, department, college, year_of_study, weekly_availability)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        department?.trim() || 'Computer Science',
        college?.trim() || 'Institute of Technology',
        parseInt(year_of_study || '3', 10),
        10
      ]
    );

    // Insert welcome notification
    await run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        userId,
        'Welcome to SmartTeamFoundation!',
        'Your profile has been created. Add your technical skills and project interests to get matched.',
        'info',
        '/profile/edit'
      ]
    );

    const user = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'student'
    };

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to SmartTeamFoundation.',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url
    };

    const token = generateToken(safeUser);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = req.user;
    const profile = await get('SELECT * FROM student_profiles WHERE user_id = ?', [user.id]);
    const skills = await query(`
      SELECT ss.id, ss.skill_id, ss.proficiency, ss.years_experience, s.name, s.category
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.user_id = ?
    `, [user.id]);

    return res.json({
      success: true,
      user: {
        ...user,
        profile: profile || {},
        skills: skills || []
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
