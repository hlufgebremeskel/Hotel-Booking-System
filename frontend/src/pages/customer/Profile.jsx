import { useEffect, useRef, useState } from 'react';
import { Container, Typography, TextField, Button, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', password: '' });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const res = await api.get('/auth/me');
        if (!mounted.current) return;
        setUser(res.data.data);
        setForm({ name: res.data.data.name || '', password: '' });
      } catch (err) {
        console.error('fetch profile', err);
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
    return () => { mounted.current = false; };
  }, []);

  const handleChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const save = async () => {
    try {
      const payload = {};
      if (form.name) payload.name = form.name;
      if (form.password) payload.password = form.password;
      if (!Object.keys(payload).length) {
        alert('Nothing to update');
        return;
      }
      setSaving(true);
      const res = await api.put('/auth/me', payload);
      setUser(res.data.data);
      setForm(s => ({ ...s, password: '' }));
      alert('Profile updated successfully!');
      // update localStorage name if present
      localStorage.setItem('name', res.data.data.name || '');
      // Dispatch event to update navbar
      window.dispatchEvent(new Event('userUpdated'));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="page-container">
        <Box className="loading-container">
          <CircularProgress size={60} />
          <Typography className="loading-text">Loading profile...</Typography>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="page-container">
        <Box className="empty-state">
          <Typography className="empty-state-title">User not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container className="page-container animate-fade-in">
      <Typography variant="h4" className="text-center mb-4" style={{ fontWeight: 'bold' }}>
        My Profile
      </Typography>

      <Box className="form-container" style={{ maxWidth: '600px' }}>
        <Box style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Box
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2.5rem',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Box>
          <Typography variant="h5" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {user.name || 'User'}
          </Typography>
          <Typography variant="body2" style={{ color: 'var(--text-secondary)' }}>
            {user.email}
          </Typography>
        </Box>

        <Typography variant="h6" style={{ marginBottom: '1.5rem', fontWeight: 'bold', borderBottom: '2px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
          Account Information
        </Typography>

        <TextField
          fullWidth
          label="Email"
          value={user.email}
          disabled
          className="form-field"
          helperText="Email cannot be changed"
          sx={{
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: 'var(--text-secondary)',
            },
          }}
        />

        <TextField
          fullWidth
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="form-field"
          placeholder="Enter your full name"
        />

        <TextField
          fullWidth
          label="New Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="form-field"
          helperText="Leave blank to keep current password"
          placeholder="Enter new password"
        />

        <Box style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-200)' }}>
          <Button
            variant="contained"
            onClick={save}
            className="btn btn-primary"
            fullWidth
            disabled={saving}
            style={{ marginBottom: '1rem' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            fullWidth
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
