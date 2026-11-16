import { useEffect, useRef, useState } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button, CircularProgress, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../api/api';

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const res = await api.get('/hotels');
        if (!mounted.current) return;
        const data = res?.data?.data ?? res?.data ?? [];
        setHotels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('fetchHotels', err);
        if (mounted.current) setHotels([]);
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
    return () => { mounted.current = false; };
  }, []);

  return (
    <>
      <Box className="hero-section">
        <Typography variant="h2" className="hero-title">
          Discover Your Perfect Stay
        </Typography>
        <Typography variant="h5" className="hero-subtitle">
          Explore our collection of premium hotels worldwide
        </Typography>
      </Box>

      <Container className="page-container">
        {loading ? (
          <Box className="loading-container">
            <CircularProgress size={60} />
            <Typography className="loading-text">Loading hotels...</Typography>
          </Box>
        ) : hotels.length === 0 ? (
          <Box className="empty-state">
            <Typography className="empty-state-title">No Hotels Available</Typography>
            <Typography className="empty-state-text">
              Check back later for available hotels.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} className="animate-fade-in-up">
            {hotels.map((h, index) => (
              <Grid item xs={12} sm={6} md={4} key={h.id}>
                <Card className="card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardMedia
                    component="img"
                    className="card-media"
                    image={`https://source.unsplash.com/400x300/?hotel,luxury,${h.id}`}
                    alt={h.name}
                  />
                  <CardContent className="card-content">
                    <Typography variant="h6" className="card-title">
                      {h.name}
                    </Typography>
                    <Typography className="card-subtitle">
                      📍 {h.city ?? h.location ?? 'Location'}
                    </Typography>
                    <Typography className="card-description">
                      {h.description ?? 'Experience luxury and comfort'}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      component={Link}
                      to={`/hotel/${h.id}`}
                      className="btn btn-primary"
                    >
                      View Rooms
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}

