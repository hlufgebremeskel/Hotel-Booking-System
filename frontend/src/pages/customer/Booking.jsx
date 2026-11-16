import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, CircularProgress, Grid } from '@mui/material';
import api from '../../api/api';

export default function Booking() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ guest_name: '', guest_email: '', guest_phone: '', check_in: '', check_out: '' });
  const [room, setRoom] = useState(null);
  const [pricePerNight, setPricePerNight] = useState(0);
  const [nights, setNights] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        if (!mounted.current) return;
        const data = res?.data?.data ?? res?.data ?? null;
        setRoom(data);
        setPricePerNight(Number(data?.price ?? 0));

        // Pre-fill form with user data
        setForm(prev => ({
          ...prev,
          guest_name: localStorage.getItem('name') || '',
          guest_email: localStorage.getItem('email') || ''
        }));
      } catch (err) {
        console.error('fetch room', err);
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
    return () => { mounted.current = false; };
  }, [roomId]);

  useEffect(() => {
    if (form.check_in && form.check_out) {
      const start = new Date(form.check_in);
      const end = new Date(form.check_out);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setNights(diff > 0 ? diff : 0);
    } else setNights(0);
  }, [form.check_in, form.check_out]);

  const handleChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const submitBooking = async () => {
    if (nights <= 0) { alert('Invalid dates'); return; }
    if (!form.guest_name || !form.guest_email) { alert('Please provide name and email'); return; }

    const token = localStorage.getItem('token');
    if (!token) { alert('Please login'); navigate('/login'); return; }

    setSubmitting(true);
    try {
      await api.post('/bookings', {
        room_id: roomId,
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        guest_phone: form.guest_phone || '',
        check_in: form.check_in,
        check_out: form.check_out
      });
      alert('Booking confirmed!');
      navigate('/my-bookings');
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="page-container">
        <Box className="loading-container">
          <CircularProgress size={60} />
          <Typography className="loading-text">Loading room details...</Typography>
        </Box>
      </Container>
    );
  }

  if (!room) {
    return (
      <Container className="page-container">
        <Box className="empty-state">
          <Typography className="empty-state-title">Room not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container className="page-container animate-fade-in">
      <Typography variant="h4" className="text-center mb-4" style={{ fontWeight: 'bold' }}>
        Book Room {room.number}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box className="form-container" style={{ maxWidth: 'none', margin: 0 }}>
            <Typography variant="h6" style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>
              Guest Information
            </Typography>
            <TextField
              fullWidth
              label="Full Name"
              name="guest_name"
              value={form.guest_name}
              onChange={handleChange}
              className="form-field"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="guest_email"
              type="email"
              value={form.guest_email}
              onChange={handleChange}
              className="form-field"
              required
            />
            <TextField
              fullWidth
              label="Phone (optional)"
              name="guest_phone"
              value={form.guest_phone}
              onChange={handleChange}
              className="form-field"
            />

            <Typography variant="h6" style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
              Stay Dates
            </Typography>
            <TextField
              fullWidth
              label="Check-in"
              type="date"
              name="check_in"
              value={form.check_in}
              onChange={handleChange}
              className="form-field"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Check-out"
              type="date"
              name="check_out"
              value={form.check_out}
              onChange={handleChange}
              className="form-field"
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className="booking-summary">
            <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Booking Summary
            </Typography>
            <Typography variant="h5" style={{ marginBottom: '0.5rem' }}>
              Room {room.number} - {room.type}
            </Typography>
            <Typography style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
              Capacity: {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}
            </Typography>

            <Box style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem', marginTop: '1rem' }}>
              <Box className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                <Typography>Price per night:</Typography>
                <Typography style={{ fontWeight: 'bold' }}>${pricePerNight.toFixed(2)}</Typography>
              </Box>
              <Box className="flex justify-between" style={{ marginBottom: '1rem' }}>
                <Typography>Number of nights:</Typography>
                <Typography style={{ fontWeight: 'bold' }}>{nights}</Typography>
              </Box>
              <Box className="flex justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography className="booking-total">${(nights * pricePerNight).toFixed(2)}</Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              className="btn btn-secondary"
              style={{ marginTop: '2rem' }}
              onClick={submitBooking}
              disabled={room.status !== 'available' || nights <= 0 || submitting}
            >
              {submitting ? 'Processing...' : 'Confirm Booking'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              style={{ marginTop: '1rem', color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
              onClick={() => navigate(-1)}
            >
              Cancel and Go Back
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

