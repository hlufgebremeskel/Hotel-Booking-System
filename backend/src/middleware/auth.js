const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success:false, error: 'Not authorized (no token)' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ success:false, error: 'Invalid token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success:false, error: 'Not authorized' });
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success:false, error: 'Admin access only' });
  }
  next();
};
