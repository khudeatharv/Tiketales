import express from 'express';
import { getMovies, getMovieById, getMovieRecommendations } from '../controllers/movieController';

const router = express.Router();

router.get('/', getMovies);
router.post('/recommendations', getMovieRecommendations);
router.get('/:id', getMovieById);

export default router;
