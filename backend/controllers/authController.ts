import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient';

const JWT_SECRET = process.env.JWT_SECRET || 'bookmyshow_secret_key_123';

const generateToken = (id: string, email: string, role: string) => {
  return jwt.sign({ id, email, role }, JWT_SECRET, {
    expiresIn: '1d', // 1 day expiry as requested
  });
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isAdmin = email.includes('admin');

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isAdmin ? 'admin' : 'user',
        status: isAdmin ? 'approved' : 'pending'
      }
    });

    res.status(201).json({
      message: 'Registration successful! ' + (isAdmin ? '' : 'Please wait for admin approval.'),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.status !== 'approved') {
        return res.status(403).json({ message: 'Your account is pending or blocked. Please contact admin.' });
      }

      res.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
        token: generateToken(user.id, user.email, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
