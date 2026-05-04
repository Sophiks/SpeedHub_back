import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Токен відсутній' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user)
      return res.status(401).json({ error: 'Користувача не знайдено' });

    next();
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    res.status(401).json({ error: 'Недійсний токен' });
  }
};
