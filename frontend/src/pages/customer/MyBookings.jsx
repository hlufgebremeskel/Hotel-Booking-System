import { useEffect, useRef, useState } from 'react';
import { Container, Typography, Card, CardContent, Button, Box, CircularProgress, Chip, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../api/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my');
      const data = res?.data?.data ?? res?.data ?? [];
      if (mounted.current) setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchMyBookings', err);
      if (mounted.current) setBookings([]);
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    fetchMyBookings();
    return () => { mounted.current = false; };
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      await fetchMyBookings();
      alert('Booking cancelled');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const payBooking = async (id) => {
    try {
      await api.post(`/bookings/${id}/pay`);
      await fetchMyBookings();
      alert('Payment processed successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'chip-info';
      case 'paid': return 'chip-success';
      case 'cancelled': return 'chip-error';
      default: return 'chip-warning';
    }
  };

  return (
    <Container className="page-container animate-fade-in">
      <Typography variant="h4" className="text-center mb-5" style={{ fontWeight: 'bold' }}>
        My Bookings
      </Typography>

      {loading ? (
        <Box className="loading-container">
          <CircularProgress size={60} />
          <Typography className="loading-text">Loading bookings...</Typography>
        </Box>
      ) : bookings.length === 0 ? (
        <Box className="empty-state">
          <Typography className="empty-state-title">No Bookings Found</Typography>
          <Typography className="empty-state-text">
            You haven't made any bookings yet. Start exploring our hotels!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {bookings.map(b => (
            <Grid item xs={12} md={6} key={b.id}>
              <Card className="booking-card">
                <CardContent>
                  <Box className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                    <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                      {b.hotel_name}
                    </Typography>
                    <Chip
                      label={b.status}
                      className={`chip ${getStatusColor(b.status)}`}
                    />
                  </Box>

                  <Typography className="card-subtitle" style={{ marginBottom: '0.5rem' }}>
                    🏨 Room {b.room_number}
                  </Typography>
                  <Typography style={{ marginBottom: '0.5rem' }}>
                    📅 {b.check_in} → {b.check_out}
                  </Typography>
                  <Typography variant="h6" style={{ color: 'var(--primary-color)', fontWeight: 'bold', marginTop: '1rem' }}>
                    Total: ${Number(b.total_price).toFixed(2)}
                  </Typography>

                  {b.status === 'confirmed' && (
                    <Box className="flex gap-2" style={{ marginTop: '1.5rem' }}>
                      <Button
                        variant="contained"
                        className="btn btn-success"
                        onClick={() => payBooking(b.id)}
                        style={{ flex: 1 }}
                      >
                        Pay Now
                      </Button>
                      <Button
                        variant="outlined"
                        className="btn btn-error"
                        onClick={() => cancelBooking(b.id)}
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}

                  {b.status === 'paid' && (
                    <Typography style={{ marginTop: '1rem', color: 'var(--success-color)', fontWeight: 'bold' }}>
                      ✓ Payment Completed
                    </Typography>
                  )}

                  {b.status === 'cancelled' && (
                    <Typography style={{ marginTop: '1rem', color: 'var(--error-color)', fontWeight: 'bold' }}>
                      ✗ Booking Cancelled
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Box className="text-center" style={{ marginTop: '3rem' }}>
        <Button
          variant="outlined"
          className="btn"
          component={Link}
          to="/"
          style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
        >
          Back to Explore Hotels
        </Button>
      </Box>
    </Container>
  );
}

