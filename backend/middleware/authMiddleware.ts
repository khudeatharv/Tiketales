import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { getJwtSecret } from '../config/jwt';

const JWT_SECRET = getJwtSecret();

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const result = await query('SELECT id, name, email, role, status, created_at FROM users WHERE id = $1 LIMIT 1', [decoded.id]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'User no longer exists' });

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
