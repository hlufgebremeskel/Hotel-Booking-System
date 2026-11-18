const db = require('../db');

async function createRoom(data) {
  const { hotel_id, number, type, capacity, price, status = 'available' } = data;
  const [result] = await db.execute(
    'INSERT INTO rooms (hotel_id, number, type, capacity, price, status) VALUES (?, ?, ?, ?, ?, ?)',
    [hotel_id, number, type, capacity, price, status]
  );
  return { id: result.insertId, ...data, status };
};

async function getRoomsByHotel(hotel_id) {
  const [rows] = await db.execute('SELECT * FROM rooms WHERE hotel_id = ?', [hotel_id]);
  return rows;
};

async function getRoomById(id) {
  const [rows] = await db.execute('SELECT * FROM rooms WHERE id = ?', [id]);
  return rows[0];
}

async function updateRoom(id, data) {
  const { number, type, capacity, price, status, hotel_id } = data;
  const updates = [];
  const values = [];
  
  if (hotel_id !== undefined) {
    updates.push('hotel_id = ?');
    values.push(hotel_id);
  }
  if (number !== undefined) {
    updates.push('number = ?');
    values.push(number);
  }
  if (type !== undefined) {
    updates.push('type = ?');
    values.push(type);
  }
  if (capacity !== undefined) {
    updates.push('capacity = ?');
    values.push(capacity);
  }
  if (price !== undefined) {
    updates.push('price = ?');
    values.push(price);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }
  
  if (updates.length === 0) {
    return getRoomById(id);
  }
  
  values.push(id);
  await db.execute(
    `UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return getRoomById(id);
}


async function deleteRoom(id) {
  await db.execute('DELETE FROM rooms WHERE id = ?', [id]);
  return true;
}

module.exports = {
  createRoom,
  getRoomsByHotel,
  getRoomById,
  updateRoom,
  deleteRoom
};