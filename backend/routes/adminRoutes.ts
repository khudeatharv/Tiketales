import express from 'express';
import { 
  getAllUsers, approveUser, blockUser, deleteUser,
  createMovie, getAdminMovies, updateMovie, deleteMovie,
  getAllBookings
} from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

// Users
router.get('/users', getAllUsers);
router.put('/approve/:id', approveUser);
router.put('/block/:id', blockUser);
router.delete('/user/:id', deleteUser);

// Movies
router.post('/movie', createMovie);
router.get('/movies', getAdminMovies);
router.put('/movie/:id', updateMovie);
router.delete('/movie/:id', deleteMovie);

// Bookings
router.get('/bookings', getAllBookings);

export default router;
