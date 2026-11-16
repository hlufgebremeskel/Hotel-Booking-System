import { useEffect, useRef, useState } from 'react';
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Box, CircularProgress, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../api/api';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/bookings');
        if (!mounted.current) return;
        const data = res?.data?.data ?? res?.data ?? [];
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('fetchBookings', err);
        if (mounted.current) setBookings([]);
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
    return () => { mounted.current = false; };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      const res = await api.get('/bookings');
      if (mounted.current) setBookings(res?.data?.data ?? res?.data ?? []);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Delete booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      const res = await api.get('/bookings');
      if (mounted.current) setBookings(res?.data?.data ?? res?.data ?? []);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'chip-info';
      case 'paid': return 'chip-success';
      case 'completed': return 'chip-success';
      case 'cancelled': return 'chip-error';
      default: return 'chip-warning';
    }
  };

  return (
    <Container className="page-container animate-fade-in">
      <Typography variant="h4" className="text-center mb-4" style={{ fontWeight: 'bold' }}>
        Manage Bookings
      </Typography>

      <Box className="flex justify-center" style={{ marginBottom: '2rem' }}>
        <Button variant="text" component={Link} to="/admin" style={{ color: 'var(--text-secondary)' }}>
          ← Back to Dashboard
        </Button>
      </Box>

      {loading && (
        <Box className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
          <CircularProgress size={24} />
          <Typography>Loading bookings...</Typography>
        </Box>
      )}

      <Box className="table-container">
        <Table>
          <TableHead className="table-header">
            <TableRow>
              <TableCell className="table-header-cell">Hotel</TableCell>
              <TableCell className="table-header-cell">Room</TableCell>
              <TableCell className="table-header-cell">Guest</TableCell>
              <TableCell className="table-header-cell">Check In</TableCell>
              <TableCell className="table-header-cell">Check Out</TableCell>
              <TableCell className="table-header-cell">Total</TableCell>
              <TableCell className="table-header-cell">Status</TableCell>
              <TableCell className="table-header-cell">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" className="table-cell">
                  No bookings yet.
                </TableCell>
              </TableRow>
            ) : bookings.map(b => (
              <TableRow key={b.id} className="table-row">
                <TableCell className="table-cell">{b.hotel_name}</TableCell>
                <TableCell className="table-cell">{b.room_number}</TableCell>
                <TableCell className="table-cell">{b.guest_name}</TableCell>
                <TableCell className="table-cell">{b.check_in}</TableCell>
                <TableCell className="table-cell">{b.check_out}</TableCell>
                <TableCell className="table-cell">${Number(b.total_price).toFixed(2)}</TableCell>
                <TableCell className="table-cell">
                  <Chip
                    label={b.status}
                    className={`chip ${getStatusColor(b.status)}`}
                  />
                </TableCell>
                <TableCell className="table-cell">
                  <Box className="flex gap-1">
                    {b.status === 'confirmed' && (
                      <Button
                        size="small"
                        className="btn btn-success"
                        onClick={() => updateStatus(b.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                    {b.status !== 'cancelled' && (
                      <Button
                        size="small"
                        className="btn btn-error"
                        onClick={() => updateStatus(b.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      size="small"
                      className="btn btn-error"
                      onClick={() => deleteBooking(b.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
}
