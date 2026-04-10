import { Request, Response } from 'express';
import prisma from '../config/prismaClient';

export const getMovies = async (req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(movies);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const movie = await prisma.movie.findUnique({ where: { id: req.params.id } });
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
