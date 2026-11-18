const express = require('express');
const cors = require('cors');

const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// test routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "Hotel Bookinng System API is running"
    });
});

const db = require('./db');
app.get('/test-db', async (req, res) =>{
    try {
        const [rows] = await db.query('SELECT NOW() AS time');
        res.json({success: true, dbTime: rows[0].time});
    } catch(err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Database connection failed'});
    }
});

const hotelRoutes = require('./routes/hotels');
app.use('/api/hotels', hotelRoutes);

const roomRoutes = require('./routes/rooms');
app.use('/api/rooms', roomRoutes);

const bookingRoutes = require('./routes/bookings');
app.use('/api/bookings', bookingRoutes);

app.use('/api/auth', require('./routes/authRoutes'));

module.exports = app;