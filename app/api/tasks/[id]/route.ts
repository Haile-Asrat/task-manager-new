import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../../../middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'completed']).optional(),
  categoryId: z.number().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = (req as any).user;
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const data = taskSchema.parse(req.body);
      const task = await prisma.task.update({
        where: { id: Number(id), userId: user.id },
        data,
      });
      return res.status(200).json(task);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data or task not found' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.task.delete({
        where: { id: Number(id), userId: user.id },
      });
      return res.status(204).end();
    } catch (error) {
      return res.status(404).json({ error: 'Task not found' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default authMiddleware(handler);