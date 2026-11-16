import { useEffect, useRef, useState } from 'react';
import {
  Container, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Button, Dialog, TextField, Box, MenuItem, Select, FormControl, InputLabel, CircularProgress, Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../api/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'customer', password: '' });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/auth/users');
        if (!mounted.current) return;
        const data = res?.data?.data ?? res?.data ?? [];
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('fetchUsers', err);
        if (mounted.current) setUsers([]);
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
    return () => { mounted.current = false; };
  }, []);

  const handleChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ 
      name: user.name || '', 
      email: user.email || '', 
      role: user.role || 'customer',
      password: '' 
    });
    setEditOpen(true);
  };

  const updateUser = async () => {
    if (!form.name || !form.email) { 
      alert('Name and email are required'); 
      return; 
    }
    try {
      const payload = { name: form.name, email: form.email, role: form.role };
      if (form.password) {
        payload.password = form.password;
      }
      await api.put(`/auth/users/${editingUser.id}`, payload);
      setForm({ name: '', email: '', role: 'customer', password: '' });
      setEditOpen(false);
      setEditingUser(null);
      const res = await api.get('/auth/users');
      if (mounted.current) setUsers(res?.data?.data ?? res?.data ?? []);
      alert('User updated successfully!');
    } catch (err) {
      console.error('updateUser', err);
      alert(err.response?.data?.error || 'Failed to update user');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      const res = await api.get('/auth/users');
      if (mounted.current) setUsers(res?.data?.data ?? res?.data ?? []);
      alert('User deleted successfully!');
    } catch (err) {
      console.error('deleteUser', err);
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'chip-error';
      case 'customer': return 'chip-info';
      default: return 'chip-warning';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <Container className="page-container animate-fade-in">
      <Typography variant="h4" className="text-center mb-4" style={{ fontWeight: 'bold' }}>
        Manage Users
      </Typography>

      <Box className="flex justify-center" style={{ marginBottom: '2rem' }}>
        <Button variant="text" component={Link} to="/admin" style={{ color: 'var(--text-secondary)' }}>
          ← Back to Dashboard
        </Button>
      </Box>

      {loading ? (
        <Box className="loading-container">
          <CircularProgress size={60} />
          <Typography className="loading-text">Loading users...</Typography>
        </Box>
      ) : (
        <Box className="table-container">
          <Table>
            <TableHead className="table-header">
              <TableRow>
                <TableCell className="table-header-cell">ID</TableCell>
                <TableCell className="table-header-cell">Name</TableCell>
                <TableCell className="table-header-cell">Email</TableCell>
                <TableCell className="table-header-cell">Role</TableCell>
                <TableCell className="table-header-cell">Joined</TableCell>
                <TableCell className="table-header-cell">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="table-cell">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : users.map(u => (
                <TableRow key={u.id} className="table-row">
                  <TableCell className="table-cell">{u.id}</TableCell>
                  <TableCell className="table-cell">{u.name}</TableCell>
                  <TableCell className="table-cell">{u.email}</TableCell>
                  <TableCell className="table-cell">
                    <Chip
                      label={u.role || 'customer'}
                      className={`chip ${getRoleColor(u.role || 'customer')}`}
                      size="small"
                    />
                  </TableCell>
                  <TableCell className="table-cell">{formatDate(u.created_at)}</TableCell>
                  <TableCell className="table-cell">
                    <Box className="flex gap-1">
                      <Button 
                        size="small"
                        className="btn btn-primary" 
                        onClick={() => handleEdit(u)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small"
                        className="btn btn-error" 
                        onClick={() => deleteUser(u.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={editOpen} onClose={() => { setEditOpen(false); setEditingUser(null); }} PaperProps={{ className: 'dialog-paper' }}>
        <Box style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
          <Typography variant="h6" className="dialog-title">
            Edit User
          </Typography>

          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="form-field"
            required
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="form-field"
            required
          />

          <FormControl fullWidth className="form-field">
            <InputLabel>Role</InputLabel>
            <Select name="role" value={form.role} onChange={handleChange} label="Role">
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="New Password (optional)"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="form-field"
            helperText="Leave blank to keep current password"
          />

          <Box className="flex gap-2" style={{ marginTop: '1.5rem' }}>
            <Button
              variant="contained"
              onClick={updateUser}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Update User
            </Button>
            <Button
              variant="outlined"
              onClick={() => { setEditOpen(false); setEditingUser(null); }}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Container>
  );
}

