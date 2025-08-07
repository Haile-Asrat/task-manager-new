import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../../middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'completed']).default('pending'),
  categoryId: z.number().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = (req as any).user;

  if (req.method === 'GET') {
    try {
      const tasks = await prisma.task.findMany({
        where: { userId: user.id },
        include: { category: true },
      });
      return res.status(200).json(tasks);
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = taskSchema.parse(req.body);
      const task = await prisma.task.create({
        data: {
          ...data,
          userId: user.id,
        },
      });
      return res.status(201).json(task);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default authMiddleware(handler);