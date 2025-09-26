const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'Không có token' });

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token hết hạn hoặc không hợp lệ' });
  }
}

module.exports = { requireAuth };
