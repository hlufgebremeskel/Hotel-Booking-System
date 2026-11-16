import { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import api from '../../api/api';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user } = res.data;

            if (user.role !== 'admin') {
                alert('Access denied. Admin credentials required.');
                setLoading(false);
                navigate('/');
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('role', user.role);
            localStorage.setItem('name', user.name ?? '');
            localStorage.setItem('email', email);

            // Dispatch custom event to update navbar
            window.dispatchEvent(new Event('userUpdated'));

            navigate('/admin');
        } catch (err) {
            alert(err.response?.data?.error || 'Login failed');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="login-page" style={{ background: 'linear-gradient(135deg, #1a1c2c 0%, #42194a 100%)' }}>
            <Box className="login-card animate-scale-in" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <Typography variant="h4" className="login-title" style={{ background: 'linear-gradient(to right, #ffffff, #a5a5a5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Admin Portal
                </Typography>
                <Typography variant="body1" className="text-center mb-4" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Secure Administrator Login
                </Typography>

                <TextField
                    fullWidth
                    label="Admin Email"
                    variant="outlined"
                    className="form-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading) {
                        handleLogin();
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        color: '#111827',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.8)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(0, 0, 0, 0.7)',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'rgba(0, 0, 0, 0.9)',
                      },
                    }}
                />

                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    className="form-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading) {
                        handleLogin();
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        color: '#111827',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.8)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(0, 0, 0, 0.7)',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'rgba(0, 0, 0, 0.9)',
                      },
                    }}
                />

                <Button
                    fullWidth
                    variant="contained"
                    className="btn"
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        marginTop: '1rem',
                        background: 'linear-gradient(to right, #4b6cb7, #182848)',
                        color: 'white',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Authenticating...' : 'Enter Dashboard'}
                </Button>

                <Box className="text-center" style={{ marginTop: '1.5rem' }}>
                    <Link to="/login" style={{ color: 'rgba(255, 255, 255, 0.5)', textDecoration: 'none', fontSize: '0.875rem' }}>
                        ← Back to User Login
                    </Link>
                </Box>
            </Box>
        </Box>
    );
}
