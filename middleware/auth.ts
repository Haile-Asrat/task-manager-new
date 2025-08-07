import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../lib/jwt'

export function authMiddleware(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    try {
      const decoded = verifyToken(token);
      (req as any).user = decoded; // Attach user to request
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}