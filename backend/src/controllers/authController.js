const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });
}
function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
}

// Đăng ký
async function register(req, res) {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Thiếu thông tin' });

  const [rows] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
  if (rows.length) return res.status(400).json({ message: 'Email đã tồn tại' });

  const hashed = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name, email, hashed]);

  res.status(201).json({ message: 'Đăng ký thành công' });
}

// Đăng nhập
async function login(req, res) {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
  if (!rows.length) return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 30 DAY))',
    [user.id, refreshToken]);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  });

  res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
}

// Refresh token
async function refreshToken(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Không có refresh token' });

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const accessToken = signAccessToken({ id: payload.id, email: payload.email, role: payload.role });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Refresh token không hợp lệ' });
  }
}

// Logout
async function logout(req, res) {
  const token = req.cookies.refreshToken;
  if (token) {
    await pool.query('DELETE FROM refresh_tokens WHERE token=?', [token]);
    res.clearCookie('refreshToken');
  }
  res.json({ message: 'Đã đăng xuất' });
}

// Lấy thông tin user
async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, refreshToken, logout, me };
