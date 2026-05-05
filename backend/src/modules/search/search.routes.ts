import express from 'express';
import { globalSearch } from './search.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/v1/search:
 *   get:
 *     summary: Global platform search
 *     description: Searches across campaigns and creators matching a query string.
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (min 2 chars)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Search results returned
 */
router.get('/', protect, globalSearch);

export default router;
