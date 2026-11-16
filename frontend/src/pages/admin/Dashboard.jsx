import { useEffect, useRef, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Button, Grid, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../api/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ hotels: 0, rooms: 0, bookings: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const [hotelsRes, roomsRes, bookingsRes, usersRes] = await Promise.all([
          api.get('/hotels'),
          api.get('/rooms'),
          api.get('/bookings'),
          api.get('/auth/users')
        ]);
        if (!mounted.current) return;
        const hotels = hotelsRes?.data?.data ?? hotelsRes?.data ?? [];
        const rooms = roomsRes?.data?.data ?? roomsRes?.data ?? [];
        const bookings = bookingsRes?.data?.data ?? bookingsRes?.data ?? [];
        const users = usersRes?.data?.data ?? usersRes?.data ?? [];
        setStats({ hotels: hotels.length, rooms: rooms.length, bookings: bookings.length, users: users.length });
      } catch (err) {
        console.error('fetch dashboard stats', err);
        if (mounted.current) setStats({ hotels: 0, rooms: 0, bookings: 0, users: 0 });
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
    return () => { mounted.current = false; };
  }, []);

  return (
    <Container className="page-container animate-fade-in">
      <Typography variant="h4" className="text-center mb-4" style={{ fontWeight: 'bold' }}>
        Admin Dashboard
      </Typography>

      {loading ? (
        <Box className="loading-container">
          <CircularProgress size={60} />
          <Typography className="loading-text">Loading dashboard...</Typography>
        </Box>
      ) : (
        <>
          <Box className="dashboard-stats">
            <Box className="stat-card stat-card-hotels">
              <Box className="stat-card-content">
                <Typography className="stat-label">Total Hotels</Typography>
                <Typography className="stat-value">{stats.hotels}</Typography>
              </Box>
            </Box>

            <Box className="stat-card stat-card-rooms">
              <Box className="stat-card-content">
                <Typography className="stat-label">Total Rooms</Typography>
                <Typography className="stat-value">{stats.rooms}</Typography>
              </Box>
            </Box>

            <Box className="stat-card stat-card-bookings">
              <Box className="stat-card-content">
                <Typography className="stat-label">Total Bookings</Typography>
                <Typography className="stat-value">{stats.bookings}</Typography>
              </Box>
            </Box>

            <Box className="stat-card stat-card-users">
              <Box className="stat-card-content">
                <Typography className="stat-label">Total Users</Typography>
                <Typography className="stat-value">{stats.users}</Typography>
              </Box>
            </Box>
          </Box>

          <Box style={{ marginTop: '3rem' }}>
            <Typography variant="h5" className="text-center mb-4" style={{ fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card className="card" style={{ height: '100%' }}>
                  <CardContent style={{ textAlign: 'center', padding: '2rem' }}>
                    <Typography variant="h6" style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                      🏨 Manage Hotels
                    </Typography>
                    <Typography variant="body2" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                      Create, update, and delete hotels
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/admin/hotels"
                      className="btn btn-primary"
                      fullWidth
                    >
                      Manage Hotels
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card className="card" style={{ height: '100%' }}>
                  <CardContent style={{ textAlign: 'center', padding: '2rem' }}>
                    <Typography variant="h6" style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                      🚪 Manage Rooms
                    </Typography>
                    <Typography variant="body2" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                      Create, update, and delete rooms
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/admin/rooms"
                      className="btn btn-primary"
                      fullWidth
                    >
                      Manage Rooms
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card className="card" style={{ height: '100%' }}>
                  <CardContent style={{ textAlign: 'center', padding: '2rem' }}>
                    <Typography variant="h6" style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                      📋 Manage Bookings
                    </Typography>
                    <Typography variant="body2" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                      View, update, and delete bookings
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/admin/bookings"
                      className="btn btn-primary"
                      fullWidth
                    >
                      Manage Bookings
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card className="card" style={{ height: '100%' }}>
                  <CardContent style={{ textAlign: 'center', padding: '2rem' }}>
                    <Typography variant="h6" style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                      👥 Manage Users
                    </Typography>
                    <Typography variant="body2" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                      View, edit, and manage registered users
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/admin/users"
                      className="btn btn-primary"
                      fullWidth
                    >
                      Manage Users
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Container>
  );
}

