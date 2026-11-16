import { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            alert('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', { name, email, password });
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="login-page">
            <Box className="login-card animate-scale-in">
                <Typography variant="h4" className="login-title">
                    Create Account
                </Typography>
                <Typography variant="body1" className="text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Join us today!
                </Typography>

                <TextField
                    fullWidth
                    label="Full Name"
                    variant="outlined"
                    className="form-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    className="form-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    className="form-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    fullWidth
                    variant="contained"
                    className="btn btn-primary"
                    onClick={handleRegister}
                    disabled={loading}
                    style={{ marginTop: '1rem' }}
                >
                    {loading ? 'Processing...' : 'Register'}
                </Button>

                <Box className="text-center" style={{ marginTop: '1.5rem' }}>
                    <Typography variant="body2" style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}>
                            Login Now
                        </Link>
                    </Typography>
                    <Box style={{ marginTop: '1rem' }}>
                        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>
                            ← Back to Home
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
