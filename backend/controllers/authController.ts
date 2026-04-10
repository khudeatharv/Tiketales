import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient';
import { getJwtSecret } from '../config/jwt';

const JWT_SECRET = getJwtSecret();

const generateToken = (id: string, email: string, role: string) => {
  return jwt.sign({ id, email, role }, JWT_SECRET, {
    expiresIn: '1d',
  });
};

const isAdminEmail = (email: string) => {
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (admins.length === 0) {
    return email.toLowerCase().includes('admin');
  }

  return admins.includes(email.toLowerCase());
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = isAdminEmail(email);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: adminUser ? 'admin' : 'user',
        status: adminUser ? 'approved' : 'pending',
      },
    });

    res.status(201).json({
      message: `Registration successful! ${adminUser ? '' : 'Please wait for admin approval.'}`.trim(),
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
      return;
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
