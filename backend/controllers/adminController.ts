import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../config/prismaClient';

// --- User Management ---
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'approved' },
      select: { id: true, name: true, email: true, status: true }
    });
    res.json({ message: 'User approved', user });
  } catch (error: any) {
    res.status(500).json({ message: 'Error approving user or user not found' });
  }
};

export const blockUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'blocked' },
      select: { id: true, name: true, email: true, status: true }
    });
    res.json({ message: 'User blocked', user });
  } catch (error: any) {
    res.status(500).json({ message: 'Error blocking user or user not found' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.booking.deleteMany({ where: { userId: req.params.id }}); // cascade delete bookings
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting user or user not found' });
  }
};

// --- Movie Management ---
export const createMovie = async (req: AuthRequest, res: Response) => {
  try {
    const { title, price, seatsAvailable } = req.body;
    const movie = await prisma.movie.create({
      data: { title, price: Number(price), seatsAvailable: Number(seatsAvailable) }
    });
    res.status(201).json({ message: 'Movie created', movie });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminMovies = async (req: AuthRequest, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(movies);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMovie = async (req: AuthRequest, res: Response) => {
  try {
    const { title, price, seatsAvailable } = req.body;
    const movie = await prisma.movie.update({
      where: { id: req.params.id },
      data: { title, price: Number(price), seatsAvailable: Number(seatsAvailable) }
    });
    res.json({ message: 'Movie updated', movie });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating movie' });
  }
};

export const deleteMovie = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.booking.deleteMany({ where: { movieId: req.params.id }}); // cascade delete
    await prisma.movie.delete({ where: { id: req.params.id } });
    res.json({ message: 'Movie deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting movie' });
  }
};

// --- Booking Management ---
export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        movie: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
