import express from 'express';
import { run, query, get } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/notifications
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const notifications = await query(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id]);

    const unreadCountRow = await get(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND is_read = 0
    `, [req.user.id]);

    res.json({
      success: true,
      unreadCount: unreadCountRow?.count || 0,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', authenticateToken, async (req, res, next) => {
  try {
    const notifId = parseInt(req.params.id, 10);
    await run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notifId, req.user.id]);

    res.json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/notifications/read-all
 */
router.put('/read-all', authenticateToken, async (req, res, next) => {
  try {
    await run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
