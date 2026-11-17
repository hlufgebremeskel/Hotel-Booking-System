const Booking = require('../models/bookingModel');
const db = require('../db');

exports.createBooking = async (req, res) => {
  const {
    room_id,
    guest_name,
    guest_email,
    guest_phone,
    check_in,
    check_out
  } = req.body;

  if (!room_id || !check_in || !check_out) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    // 1. Get room price
    const [room] = await db.execute(
      "SELECT price, status FROM rooms WHERE id = ?",
      [room_id]
    );

    if (room.length === 0)
      return res.status(404).json({ success: false, error: "Room not found" });

    if (room[0].status !== 'available')
      return res.status(400).json({ success: false, error: "Room is not available" });

    const pricePerNight = room[0].price;

    // 2. Calculate nights
    const start = new Date(check_in);
    const end = new Date(check_out);

    const nights = Math.ceil(
      (end - start) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0)
      return res.status(400).json({ success: false, error: "Invalid dates" });

    const total_price = nights * pricePerNight;

    // 3. Insert booking
    const [result] = await db.execute(
      `INSERT INTO bookings
      (room_id, guest_name, guest_email, guest_phone,
       check_in, check_out, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [
        room_id,
        guest_name,
        guest_email,
        guest_phone,
        check_in,
        check_out,
        total_price
      ]
    );

    // 4. Mark room as occupied
    await db.execute(
      "UPDATE rooms SET status = 'occupied' WHERE id = ?",
      [room_id]
    );

    res.json({
      success: true,
      message: "Booking created",
      total_price,
      nights
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAll = async(req, res) => {
    try{
        const bookings = await Booking.getAllBookings();
        res.status(201).json({ success: true, data: bookings});
    }
    catch(err){
        res.status(500).json({ success: false, error: err.message});
    }
};

exports.checkout = async(req, res) => {
    try{
        await Booking.completeBooking(req.params.id);
        res.json({ success: true, message: 'Checked out successfully'});
    }
    catch(err){
        res.status(500).json({ success: false, error: err.message});
    }
};

exports.getMyBookings = async (req, res) => {
  try {
    const email = req.user.email;   // from JWT
    const bookings = await Booking.getBookingsByEmail(email);
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success:false, error: 'Invalid booking id' });

    // get booking
    const [rows] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success:false, error: 'Booking not found' });
    const booking = rows[0];

    // check permission: admin or owner by email
    if (!(req.user && (req.user.role === 'admin' || (req.user.email && req.user.email.toLowerCase() === (booking.guest_email || '').toLowerCase())))) {
      return res.status(403).json({ success:false, error: 'Not authorized to cancel this booking' });
    }

    // update booking status to cancelled
    await db.execute('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);

    // set room available
    await db.execute('UPDATE rooms SET status = ? WHERE id = ?', ['available', booking.room_id]);

    return res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    console.error('cancelBooking error', err);
    return res.status(500).json({ success:false, error: err.message });
  }
};

exports.payBooking = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success:false, error: 'Invalid booking id' });

    // get booking
    const [rows] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success:false, error: 'Booking not found' });
    const booking = rows[0];

    // check permission: admin or owner by email
    if (!(req.user && (req.user.role === 'admin' || (req.user.email && req.user.email.toLowerCase() === (booking.guest_email || '').toLowerCase())))) {
      return res.status(403).json({ success:false, error: 'Not authorized to pay for this booking' });
    }

    // Simulate payment success and mark booking status to 'paid'
    await db.execute('UPDATE bookings SET status = ? WHERE id = ?', ['paid', id]);

    return res.json({ success: true, message: 'Payment simulated — booking marked as paid' });
  } catch (err) {
    console.error('payBooking error', err);
    return res.status(500).json({ success:false, error: err.message });
  }
};

// Admin: update booking status manually
exports.updateStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ success:false, error: 'Booking id and status required' });
    }

    const allowed = ['confirmed', 'paid', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success:false, error: 'Invalid status value' });
    }

    // check booking exists
    const [rows] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success:false, error: 'Booking not found' });
    }

    const booking = rows[0];

    // update booking
    await db.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );

    // if cancelled → free room
    if (status === 'cancelled') {
      await db.execute(
        'UPDATE rooms SET status = ? WHERE id = ?',
        ['available', booking.room_id]
      );
    }

    res.json({ success:true, message: 'Booking status updated' });
  } catch (err) {
    console.error('updateStatus error', err);
    res.status(500).json({ success:false, error: err.message });
  }
};


// Admin: delete booking completely
exports.delete = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ success:false, error: 'Invalid booking id' });
    }

    // check booking exists
    const [rows] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success:false, error: 'Booking not found' });
    }

    const booking = rows[0];

    // delete booking
    await db.execute('DELETE FROM bookings WHERE id = ?', [id]);

    // free room
    await db.execute(
      'UPDATE rooms SET status = ? WHERE id = ?',
      ['available', booking.room_id]
    );

    res.json({ success:true, message: 'Booking deleted' });
  } catch (err) {
    console.error('delete booking error', err);
    res.status(500).json({ success:false, error: err.message });
  }
};