import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
    
    if (!token) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const decoded = jwt.verify(token, 'secret123');
    req.userId = decoded._id; // Убедитесь, что decoded._id существует
    next();
  } catch (err) {
    res.status(403).json({ message: 'Ошибка авторизации' });
  }
};