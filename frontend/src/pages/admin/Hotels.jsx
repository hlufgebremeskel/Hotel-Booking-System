import { useEffect, useRef, useState } from 'react';
import {
  Container, Typography, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Dialog, Box, CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../api/api';

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [form, setForm] = useState({ name: '', city: '', description: '' });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      setLoading(true);
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

  const handleChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const createHotel = async () => {
    if (!form.name || !form.city) { alert('Provide name and city'); return; }
    try {
      await api.post('/hotels', { name: form.name, city: form.city, description: form.description });
      setForm({ name: '', city: '', description: '' });
      setOpen(false);
      const res = await api.get('/hotels');
      const data = res?.data?.data ?? res?.data ?? [];
      if (mounted.current) setHotels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('createHotel', err);
      alert(err.response?.data?.error || 'Failed to create hotel');
    }
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setForm({ name: hotel.name, city: hotel.city || hotel.location || '', description: hotel.description || '' });
    setEditOpen(true);
  };

  const updateHotel = async () => {
    if (!form.name || !form.city) { alert('Provide name and city'); return; }
    try {
      await api.put(`/hotels/${editingHotel.id}`, { name: form.name, city: form.city, description: form.description });
      setForm({ name: '', city: '', description: '' });
      setEditOpen(false);
      setEditingHotel(null);
      const res = await api.get('/hotels');
      const data = res?.data?.data ?? res?.data ?? [];
      if (mounted.current) setHotels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('updateHotel', err);
      alert(err.response?.data?.error || 'Failed to update hotel');
    }
  };

  const deleteHotel = async (id) => {
    if (!window.confirm('Delete hotel?')) return;
    try {
      await api.delete(`/hotels/${id}`);
      const res = await api.get('/hotels');
      const data = res?.data?.data ?? res?.data ?? [];
      if (mounted.current) setHotels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('deleteHotel', err);
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <Container className="page-container animate-fade-in">
      <Typography variant="h4" className="text-center mb-4" style={{ fontWeight: 'bold' }}>
        Manage Hotels
      </Typography>

      <Box className="flex justify-center" style={{ marginBottom: '2rem' }}>
        <Button variant="text" component={Link} to="/admin" style={{ color: 'var(--text-secondary)' }}>
          ← Back to Dashboard
        </Button>
      </Box>

      <Box className="flex items-center gap-3" style={{ marginBottom: '2rem' }}>
        <Button variant="contained" onClick={() => setOpen(true)} className="btn btn-primary">
          Add Hotel
        </Button>
        {loading && <CircularProgress size={24} />}
      </Box>

      <Box className="table-container">
        <Table>
          <TableHead className="table-header">
            <TableRow>
              <TableCell className="table-header-cell">Name</TableCell>
              <TableCell className="table-header-cell">City</TableCell>
              <TableCell className="table-header-cell">Description</TableCell>
              <TableCell className="table-header-cell">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hotels.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" className="table-cell">
                  No hotels available. Add one to get started!
                </TableCell>
              </TableRow>
            ) : hotels.map(h => (
              <TableRow key={h.id} className="table-row">
                <TableCell className="table-cell">{h.name}</TableCell>
                <TableCell className="table-cell">{h.city ?? h.location}</TableCell>
                <TableCell className="table-cell">{h.description}</TableCell>
                <TableCell className="table-cell">
                  <Box className="flex gap-1">
                    <Button 
                      size="small"
                      className="btn btn-primary" 
                      onClick={() => handleEdit(h)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small"
                      className="btn btn-error" 
                      onClick={() => deleteHotel(h.id)}
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

      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ className: 'dialog-paper' }}>
        <Box style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
          <Typography variant="h6" className="dialog-title">
            Add New Hotel
          </Typography>
          <TextField
            fullWidth
            label="Hotel Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="form-field"
            required
          />
          <TextField
            fullWidth
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="form-field"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="form-field"
            multiline
            rows={3}
          />
          <Box className="flex gap-2" style={{ marginTop: '1.5rem' }}>
            <Button
              variant="contained"
              onClick={createHotel}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Create Hotel
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpen(false)}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog open={editOpen} onClose={() => { setEditOpen(false); setEditingHotel(null); }} PaperProps={{ className: 'dialog-paper' }}>
        <Box style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
          <Typography variant="h6" className="dialog-title">
            Edit Hotel
          </Typography>
          <TextField
            fullWidth
            label="Hotel Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="form-field"
            required
          />
          <TextField
            fullWidth
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="form-field"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="form-field"
            multiline
            rows={3}
          />
          <Box className="flex gap-2" style={{ marginTop: '1.5rem' }}>
            <Button
              variant="contained"
              onClick={updateHotel}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Update Hotel
            </Button>
            <Button
              variant="outlined"
              onClick={() => { setEditOpen(false); setEditingHotel(null); }}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Container>
  );
}
