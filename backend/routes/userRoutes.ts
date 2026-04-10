import express from 'express';
import { getUserProfile, bookTicket, getUserBookings, getAllMovies } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', getUserProfile);
router.post('/book', bookTicket);
router.get('/bookings', getUserBookings);
router.get('/movies', getAllMovies); // Allow users to see movies

export default router;
