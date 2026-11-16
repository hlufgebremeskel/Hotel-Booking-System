import { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      // store important data
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('name', user.name ?? '');
      localStorage.setItem('email', email);

      // Dispatch custom event to update navbar
      window.dispatchEvent(new Event('userUpdated'));

      if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      login();
    }
  };

  return (
    <Box className="login-page">
      <Box className="login-card animate-scale-in">
        <Typography variant="h4" className="login-title">
          Welcome Back
        </Typography>
        <Typography variant="body1" className="text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
          Sign in to your account
        </Typography>

        <TextField
          label="Email"
          fullWidth
          className="form-field"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
          type="email"
          autoComplete="email"
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          className="form-field"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          autoComplete="current-password"
        />

        <Button
          variant="contained"
          fullWidth
          onClick={login}
          className="btn btn-primary"
          disabled={loading}
          style={{ marginTop: '1rem' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <Box className="text-center" style={{ marginTop: '1.5rem' }}>
          <Typography variant="body2" style={{ color: 'var(--text-secondary)' }}>
            New user?{' '}
            <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}>
              Register Here
            </Link>
          </Typography>
          <Box style={{ borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
            <Link to="/admin/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>
              Administrator Login
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
