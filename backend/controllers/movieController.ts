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

export const getMovieRecommendations = async (req: Request, res: Response) => {
  const genre = typeof req.body?.genre === 'string' ? req.body.genre.trim().toLowerCase() : '';

  try {
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    const rankedMovies = movies
      .map((movie) => {
        const title = movie.title.toLowerCase();
        const score = genre.length > 0 && title.includes(genre) ? 2 : 1;
        return { movie, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ movie }) => movie.title);

    if (rankedMovies.length === 0) {
      res.json({
        recommendations: 'No movies are available yet. Please add movies from the admin dashboard first.',
      });
      return;
    }

    const recommendations = rankedMovies
      .map((title, index) => `${index + 1}. ${title}`)
      .join('\n');

    res.json({ recommendations });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
