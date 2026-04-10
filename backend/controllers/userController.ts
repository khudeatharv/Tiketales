import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool, { query } from '../config/db';

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

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = $1 LIMIT 1',
      [req.user.id],
    );

    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });

    const user = result.rows[0];
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const bookTicket = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();

  try {
    const { movieId, seats } = req.body;
    if (!movieId || !seats || seats <= 0) return res.status(400).json({ message: 'Invalid booking data' });

    await client.query('BEGIN');

    const movieResult = await client.query('SELECT * FROM movies WHERE id = $1 FOR UPDATE', [movieId]);
    const movie = movieResult.rows[0];

    if (!movie) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Movie not found' });
    }

    if (movie.seats_available < seats) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Only ${movie.seats_available} seats available` });
    }

    await client.query('UPDATE movies SET seats_available = seats_available - $1 WHERE id = $2', [seats, movieId]);

    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, movie_id, seats)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, movie_id, seats, created_at`,
      [req.user.id, movieId, seats],
    );

    await client.query('COMMIT');

    const booking = bookingResult.rows[0];
    return res.status(201).json({
      message: 'Booking successful',
      booking: {
        id: booking.id,
        userId: booking.user_id,
        movieId: booking.movie_id,
        seats: booking.seats,
        createdAt: booking.created_at,
        movie: mapMovie(movie),
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT b.id, b.user_id, b.movie_id, b.seats, b.created_at,
              m.id AS m_id, m.title, m.language, m.genre, m.duration, m.price, m.seats_available, m.created_at AS m_created_at
       FROM bookings b
       JOIN movies m ON m.id = b.movie_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id],
    );

    const bookings = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      movieId: row.movie_id,
      seats: row.seats,
      createdAt: row.created_at,
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

export const getAllMovies = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM movies ORDER BY created_at DESC');
    return res.json(result.rows.map(mapMovie));
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
