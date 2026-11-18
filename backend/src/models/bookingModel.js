const db = require('../db');

async function isRoomAvailable(room_id, check_in, check_out) {
    const [rows] = await db.execute(
        `SELECT id FROM bookings
        WHERE room_id = ? AND status = 'active'
        AND (check_in < ? AND check_out > ?)`,
        [room_id, check_out, check_in]
    );
    return rows.length === 0;
}

async function createBooking(data) {
    const { room_id, guest_name, guest_email, guest_phone, check_in, check_out, total_price } = data;
    const available = await isRoomAvailable(room_id, check_in, check_out);
    if (!available) throw new Error('Room already booked for these dates');
    const [result] = await db.execute(
        `INSERT INTO bookings
        (room_id, guest_name, guest_email, guest_phone, check_in, check_out, total_price)
        VALUES(?, ?, ?, ?, ?, ?, ?)`,
        [room_id, guest_name, guest_email, guest_phone, check_in, check_out, total_price]
    );
    await db.execute(`UPDATE rooms SET status = 'occupied' WHERE id = ?`, [room_id]);

    return { id: result.insertId, ...data };
};

async function getAllBookings() {
    const [rows] = await db.execute(
        `SELECT b.*, r.number AS room_number, h.name AS hotel_name
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN hotels h ON r.hotel_id = h.id`
    );
    return rows;
}

async function completeBooking(id) {
    const [rows] = await db.execute(
        `SELECT room_id FROM bookings WHERE id = ?`, [id]
    );
    await db.execute(`UPDATE bookings SET status = 'completed' WHERE id = ?`, [id]);
    await db.execute(`UPDATE rooms SET status = 'available' WHERE id = ?`, [rows[0].room_id]);
};

async function getBookingsByEmail(email) {
    const [rows] = await db.execute(
        `SELECT b.*, r.number AS room_number, h.name AS hotel_name
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     JOIN hotels h ON r.hotel_id = h.id
     WHERE LOWER(b.guest_email) = LOWER(?)
     ORDER BY b.created_at DESC`,
        [email]
    );
    return rows;
}

module.exports = {
    createBooking,
    getAllBookings,
    completeBooking,
    getBookingsByEmail,
};