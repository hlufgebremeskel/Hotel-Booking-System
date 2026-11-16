import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, Button, Chip, CircularProgress, Box } from '@mui/material';
import api from '../../api/api';

export default function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        console.log("Fetching details for hotel ID:", id);
        const [hotelRes, roomsRes] = await Promise.all([
          api.get(`/hotels/${id}`),
          api.get(`/rooms/hotel/${id}`)
        ]);
        console.log("Hotel API Response:", hotelRes.data);
        console.log("Rooms API Response:", roomsRes.data);
        if (!mounted.current) return;

        const hotelData = hotelRes.data.data || hotelRes.data;
        const roomsData = roomsRes.data.data || roomsRes.data || [];

        console.log("Setting hotel:", hotelData);
        console.log("Setting rooms:", roomsData);

        setHotel(hotelData);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      } catch (err) {
        console.error('fetch hotel details error:', err);
        if (mounted.current) { setHotel(null); setRooms([]); }
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
    return () => { mounted.current = false; };
  }, [id]);

  if (loading) {
    return (
      <Container className="page-container">
        <Box className="loading-container">
          <CircularProgress size={60} />
          <Typography className="loading-text">Loading hotel details...</Typography>
        </Box>
      </Container>
    );
  }

  if (!hotel && !loading) {
    return (
      <Container className="page-container">
        <Box className="empty-state">
          <Typography className="empty-state-title">Hotel Not Found</Typography>
          <Typography className="empty-state-text">
            We couldn't find the hotel details for ID: {id}.
          </Typography>
          <Button variant="outlined" onClick={() => navigate(0)} style={{ marginTop: '1rem' }}>
            Retry
          </Button>
          <Button variant="outlined" onClick={() => navigate('/')} style={{ marginTop: '1rem', marginLeft: '10px' }}>
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container className="page-container animate-fade-in">
      <Box className="hero-section" style={{ marginBottom: '2rem' }}>
        <Typography variant="h3" className="hero-title">
          {hotel.name}
        </Typography>
        <Typography variant="h6" className="hero-subtitle">
          📍 {hotel.city ?? hotel.location}
        </Typography>
      </Box>

      <Typography variant="body1" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
        {hotel.description}
      </Typography>

      <Typography variant="h5" style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>
        Available Rooms
      </Typography>

      {rooms.length === 0 ? (
        <Box className="empty-state">
          <Typography className="empty-state-title">No Rooms Available</Typography>
          <Typography className="empty-state-text">
            Please check back later or contact us for availability.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {rooms.map(r => (
            <Grid item xs={12} sm={6} md={4} key={r.id}>
              <Card className="card room-card">
                <Chip
                  label={r.status ?? 'unknown'}
                  className={`chip room-status-badge ${r.status === 'available' ? 'chip-success' : 'chip-error'}`}
                />
                <CardContent className="card-content">
                  <Typography variant="h6" className="card-title">
                    Room {r.number}
                  </Typography>
                  <Typography className="card-subtitle">
                    {r.type}
                  </Typography>
                  <Typography style={{ marginBottom: '0.5rem' }}>
                    👤 Capacity: {r.capacity} {r.capacity === 1 ? 'guest' : 'guests'}
                  </Typography>
                  <Typography className="room-price">
                    ${Number(r.price).toFixed(2)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ night</span>
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    className={r.status === 'available' ? 'btn btn-primary' : 'btn'}
                    disabled={r.status !== 'available'}
                    onClick={() => navigate(`/booking/${r.id}`)}
                  >
                    {r.status === 'available' ? 'Reserve Now' : 'Unavailable'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

