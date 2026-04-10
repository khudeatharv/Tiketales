import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
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

export const getAllUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC',
    );
    res.json(result.rows.map((u) => ({ ...u, createdAt: u.created_at })));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveUser = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, status',
      ['approved', req.params.id],
    );
    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User approved', user: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error approving user or user not found' });
  }
};

export const blockUser = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, status',
      ['blocked', req.params.id],
    );
    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User blocked', user: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error blocking user or user not found' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    return res.json({ message: 'User deleted' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting user or user not found' });
  }
};

export const createMovie = async (req: AuthRequest, res: Response) => {
  try {
    const { title, language, genre, duration, price, seatsAvailable } = req.body;
    const result = await query(
      `INSERT INTO movies (title, language, genre, duration, price, seats_available)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, language || null, genre || null, duration || null, Number(price), Number(seatsAvailable)],
    );
    return res.status(201).json({ message: 'Movie created', movie: mapMovie(result.rows[0]) });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAdminMovies = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM movies ORDER BY created_at DESC');
    return res.json(result.rows.map(mapMovie));
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateMovie = async (req: AuthRequest, res: Response) => {
  try {
    const { title, language, genre, duration, price, seatsAvailable } = req.body;
    const result = await query(
      `UPDATE movies
       SET title = $1, language = $2, genre = $3, duration = $4, price = $5, seats_available = $6
       WHERE id = $7
       RETURNING *`,
      [title, language || null, genre || null, duration || null, Number(price), Number(seatsAvailable), req.params.id],
    );
    if (!result.rowCount) return res.status(404).json({ message: 'Movie not found' });
    return res.json({ message: 'Movie updated', movie: mapMovie(result.rows[0]) });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating movie' });
  }
};

export const deleteMovie = async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM movies WHERE id = $1', [req.params.id]);
    return res.json({ message: 'Movie deleted' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting movie' });
  }
};

export const getAllBookings = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT b.id, b.user_id, b.movie_id, b.seats, b.created_at,
              u.name AS user_name, u.email AS user_email,
              m.id AS m_id, m.title, m.language, m.genre, m.duration, m.price, m.seats_available, m.created_at AS m_created_at
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       JOIN movies m ON m.id = b.movie_id
       ORDER BY b.created_at DESC`,
    );

    const bookings = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      movieId: row.movie_id,
      seats: row.seats,
      createdAt: row.created_at,
      user: { name: row.user_name, email: row.user_email },
      movie: {
        id: row.m_id,
        title: row.title,
        language: row.language,
        genre: row.genre,
        duration: row.duration,
        price: Number(row.price),
        seatsAvailable: row.seats_available,
        createdAt: row.m_created_at,
      },
    }));

    return res.json(bookings);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
