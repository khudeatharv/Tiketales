import express from 'express';
import { getShowsByMovie, getShowById } from '../controllers/showController';

const router = express.Router();

router.get('/movie/:movieId', getShowsByMovie);
router.get('/:id', getShowById);

export default router;
