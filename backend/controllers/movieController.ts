import { Request, Response } from 'express';
import { query } from '../config/db';

const mapMovie = (row: any) => ({
  id: row.id,
  title: row.title,
  language: row.language,
  genre: row.genre,
  duration: row.duration,
  price: Number(row.price),
  seatsAvailable: row.seats_available,
  createdAt: row.created_at,
});

export const getMovies = async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM movies ORDER BY created_at DESC');
    res.json(result.rows.map(mapMovie));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM movies WHERE id = $1 LIMIT 1', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Movie not found' });
    return res.json(mapMovie(result.rows[0]));
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMovieRecommendations = async (req: Request, res: Response) => {
  const genre = typeof req.body?.genre === 'string' ? req.body.genre.trim().toLowerCase() : '';

  try {
    const result = await query('SELECT * FROM movies ORDER BY created_at DESC LIMIT 25');
    const rankedMovies = result.rows
      .map((movie) => {
        const title = movie.title.toLowerCase();
        const score = genre.length > 0 && title.includes(genre) ? 2 : 1;
        return { movie, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ movie }) => movie.title);

    if (rankedMovies.length === 0) {
      return res.json({ recommendations: 'No movies are available yet. Please add movies from the admin dashboard first.' });
    }

    const recommendations = rankedMovies.map((title, index) => `${index + 1}. ${title}`).join('\n');
    return res.json({ recommendations });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
