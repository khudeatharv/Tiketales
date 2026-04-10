import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../config/prismaClient';

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    });
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const bookTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { movieId, seats } = req.body;
    
    if (!movieId || !seats || seats <= 0) {
      return res.status(400).json({ message: 'Invalid booking data' });
    }

    // Use Prisma transaction to ensure atomicity and prevent overbooking
    const booking = await prisma.$transaction(async (tx) => {
      const movie = await tx.movie.findUnique({ where: { id: movieId } });

      if (!movie) {
        throw new Error('Movie not found');
      }
      
      if (movie.seatsAvailable < seats) {
        throw new Error(`Only ${movie.seatsAvailable} seats available`);
      }

      // Deduct seats
      await tx.movie.update({
        where: { id: movieId },
        data: { seatsAvailable: { decrement: seats } }
      });

      // Create booking record
      const newBooking = await tx.booking.create({
        data: {
          userId: req.user.id,
          movieId,
          seats
        },
        include: { movie: true }
      });

      return newBooking;
    });

    res.status(201).json({ message: 'Booking successful', booking });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { movie: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllMovies = async (req: AuthRequest, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(movies);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
