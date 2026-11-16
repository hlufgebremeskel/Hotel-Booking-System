import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  const updateUserState = () => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const role = localStorage.getItem('role');
    if (token) {
      setUser({ name, role });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    updateUserState();
    
    // Listen for storage changes (e.g., login from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'name' || e.key === 'role') {
        updateUserState();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleUserUpdate = () => {
      updateUserState();
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, [location.pathname]); // Update when route changes

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  return (
    <AppBar position="static" className="navbar">
      <Toolbar className="navbar-toolbar">
        <Typography variant="h6" className="navbar-brand">
          Hotel Booking
        </Typography>
        <Box className="navbar-links flex items-center">
          <Button color="inherit" component={Link} to="/" className="navbar-button">
            Home
          </Button>
          {user && (
            <>
              <Button color="inherit" component={Link} to="/my-bookings" className="navbar-button">
                My Bookings
              </Button>
              {user.role === 'admin' && (
                <Button color="inherit" component={Link} to="/admin" className="navbar-button">
                  Admin
                </Button>
              )}
              <Button color="inherit" component={Link} to="/profile" className="navbar-button navbar-user-info">
                {user.name || 'User'}
              </Button>
              <Button onClick={handleLogout} className="navbar-button navbar-button-logout">
                Logout
              </Button>
            </>
          )}
          {!user && (
            <>
              <Button color="inherit" component={Link} to="/login" className="navbar-button">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register" className="navbar-button">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

