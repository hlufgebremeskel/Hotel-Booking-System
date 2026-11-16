import { useEffect, useRef, useState } from 'react';
import {
  Container, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Button, Dialog, TextField, Box, MenuItem, Select, FormControl, InputLabel, CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../api/api';

export default function Rooms() {
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState({ hotel_id: '', number: '', type: '', capacity: 1, price: '' });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      setLoading(true);
      try {
        const [hotelsRes, roomsRes] = await Promise.all([api.get('/hotels'), api.get('/rooms')]);
        if (!mounted.current) return;
        setHotels(hotelsRes?.data?.data ?? hotelsRes?.data ?? []);
        setRooms(roomsRes?.data?.data ?? roomsRes?.data ?? []);
      } catch (err) {
        console.error('fetch rooms/hotels', err);
        if (mounted.current) { setHotels([]); setRooms([]); }
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
    return () => { mounted.current = false; };
  }, []);

  const handleChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const createRoom = async () => {
    if (!form.hotel_id || !form.number || !form.price) { alert('Fill required fields'); return; }
    try {
      await api.post('/rooms', { ...form, hotel_id: Number(form.hotel_id), capacity: Number(form.capacity), price: parseFloat(form.price) });
      setForm({ hotel_id: '', number: '', type: '', capacity: 1, price: '' });
      setOpen(false);
      const roomsRes = await api.get('/rooms');
      if (mounted.current) setRooms(roomsRes?.data?.data ?? roomsRes?.data ?? []);
    } catch (err) {
      console.error('createRoom', err);
      alert(err.response?.data?.error || 'Failed to create room');
    }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm('Delete room?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      const roomsRes = await api.get('/rooms');
      if (mounted.current) setRooms(roomsRes?.data?.data ?? roomsRes?.data ?? []);
    } catch (err) {
      console.error('deleteRoom', err);
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setForm({ 
      hotel_id: room.hotel_id || '', 
      number: room.number || '', 
      type: room.type || '', 
      capacity: room.capacity || 1, 
      price: room.price || '' 
    });
    setEditOpen(true);
  };

  const updateRoom = async () => {
    if (!form.hotel_id || !form.number || !form.price) { alert('Fill required fields'); return; }
    try {
      await api.put(`/rooms/${editingRoom.id}`, { 
        ...form, 
        hotel_id: Number(form.hotel_id), 
        capacity: Number(form.capacity), 
        price: parseFloat(form.price) 
      });
      setForm({ hotel_id: '', number: '', type: '', capacity: 1, price: '' });
      setEditOpen(false);
      setEditingRoom(null);
      const roomsRes = await api.get('/rooms');
      if (mounted.current) setRooms(roomsRes?.data?.data ?? roomsRes?.data ?? []);
    } catch (err) {
      console.error('updateRoom', err);
      alert(err.response?.data?.error || 'Failed to update room');
    }
  };

  return (
    <Container className="page-container animate-fade-in">
      <Typography variant="h4" className="text-center mb-4" style={{ fontWeight: 'bold' }}>
        Manage Rooms
      </Typography>

      <Box className="flex justify-center" style={{ marginBottom: '2rem' }}>
        <Button variant="text" component={Link} to="/admin" style={{ color: 'var(--text-secondary)' }}>
          ← Back to Dashboard
        </Button>
      </Box>

      <Box className="flex items-center gap-3" style={{ marginBottom: '2rem' }}>
        <Button variant="contained" onClick={() => setOpen(true)} className="btn btn-primary">
          Add Room
        </Button>
        {loading && <CircularProgress size={24} />}
      </Box>

      <Box className="table-container">
        <Table>
          <TableHead className="table-header">
            <TableRow>
              <TableCell className="table-header-cell">Hotel</TableCell>
              <TableCell className="table-header-cell">Number</TableCell>
              <TableCell className="table-header-cell">Type</TableCell>
              <TableCell className="table-header-cell">Capacity</TableCell>
              <TableCell className="table-header-cell">Price</TableCell>
              <TableCell className="table-header-cell">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="table-cell">
                  No rooms available. Add one to get started!
                </TableCell>
              </TableRow>
            ) : rooms.map(r => (
              <TableRow key={r.id} className="table-row">
                <TableCell className="table-cell">{r.hotel_name ?? r.hotel_id}</TableCell>
                <TableCell className="table-cell">{r.number}</TableCell>
                <TableCell className="table-cell">{r.type}</TableCell>
                <TableCell className="table-cell">{r.capacity}</TableCell>
                <TableCell className="table-cell">${Number(r.price).toFixed(2)}</TableCell>
                <TableCell className="table-cell">
                  <Box className="flex gap-1">
                    <Button 
                      size="small"
                      className="btn btn-primary" 
                      onClick={() => handleEdit(r)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small"
                      className="btn btn-error" 
                      onClick={() => deleteRoom(r.id)}
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
            Add New Room
          </Typography>

          <FormControl fullWidth className="form-field">
            <InputLabel>Hotel</InputLabel>
            <Select name="hotel_id" value={form.hotel_id} onChange={handleChange} label="Hotel">
              <MenuItem value="">Select Hotel</MenuItem>
              {hotels.map(h => <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Room Number"
            name="number"
            value={form.number}
            onChange={handleChange}
            className="form-field"
            required
          />

          <TextField
            fullWidth
            label="Room Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="form-field"
            placeholder="e.g., Deluxe, Suite, Standard"
          />

          <TextField
            fullWidth
            label="Capacity"
            name="capacity"
            type="number"
            value={form.capacity}
            onChange={handleChange}
            className="form-field"
            required
          />

          <TextField
            fullWidth
            label="Price per Night"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="form-field"
            required
          />

          <Box className="flex gap-2" style={{ marginTop: '1.5rem' }}>
            <Button
              variant="contained"
              onClick={createRoom}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Create Room
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

      <Dialog open={editOpen} onClose={() => { setEditOpen(false); setEditingRoom(null); }} PaperProps={{ className: 'dialog-paper' }}>
        <Box style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
          <Typography variant="h6" className="dialog-title">
            Edit Room
          </Typography>

          <FormControl fullWidth className="form-field">
            <InputLabel>Hotel</InputLabel>
            <Select name="hotel_id" value={form.hotel_id} onChange={handleChange} label="Hotel">
              <MenuItem value="">Select Hotel</MenuItem>
              {hotels.map(h => <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Room Number"
            name="number"
            value={form.number}
            onChange={handleChange}
            className="form-field"
            required
          />

          <TextField
            fullWidth
            label="Room Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="form-field"
            placeholder="e.g., Deluxe, Suite, Standard"
          />

          <TextField
            fullWidth
            label="Capacity"
            name="capacity"
            type="number"
            value={form.capacity}
            onChange={handleChange}
            className="form-field"
            required
          />

          <TextField
            fullWidth
            label="Price per Night"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="form-field"
            required
          />

          <Box className="flex gap-2" style={{ marginTop: '1.5rem' }}>
            <Button
              variant="contained"
              onClick={updateRoom}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Update Room
            </Button>
            <Button
              variant="outlined"
              onClick={() => { setEditOpen(false); setEditingRoom(null); }}
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
