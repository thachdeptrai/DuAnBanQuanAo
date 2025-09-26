const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');

const app = express();
 
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // frontend React
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.json({ message: "API running" }));

module.exports = app;
