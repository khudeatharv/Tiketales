import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient';
import { getJwtSecret } from '../config/jwt';

const JWT_SECRET = getJwtSecret();

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      res.status(401).json({ message: 'User no longer exists' });
      return;
    }

    const { password: _password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (_error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
