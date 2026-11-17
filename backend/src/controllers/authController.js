const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  await db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashed]
  );

  res.json({ success: true, message: "Registered successfully" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (!rows.length) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role
    }
  });
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ error: 'Not authorized' });
    const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getMe error', err);
    res.status(500).json({ error: err.message });
  }
};


exports.updateMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ error: 'Not authorized' });

    const { name, password } = req.body;
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?'); params.push(name);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?'); params.push(hashed);
    }

    if (!updates.length) return res.status(400).json({ error: 'No updates provided' });

    params.push(req.user.id); // id for WHERE
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);

    // return updated user
    const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateMe error', err);
    res.status(500).json({ error: err.message });
  }
};

// Admin only - Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getAllUsers error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin only - Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role, password } = req.body;
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashed);
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, error: 'No updates provided' });
    }

    params.push(userId);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);

    const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateUser error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin only - Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (req.user && req.user.id === parseInt(userId)) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('deleteUser error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};