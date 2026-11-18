const db = require('../db');

async function createHotel(data) {
    const { name, address, city, description } = data;
    // Convert undefined values to null for SQL
    const [result] = await db.execute(
        'INSERT INTO hotels( name, address, city, description) VALUES (?, ?, ?, ?)',
        [name || null, address || null, city || null, description || null]
    );
    return { id: result.insertId, ...data };
}

async function getAllHotels() {
    const [rows] = await db.execute('SELECT * FROM hotels');
    return rows;
}

async function getHotelById(id) {
    const [rows] = await db.execute('SELECT * FROM hotels WHERE id = ?', [id]);
    return rows[0];
}

async function updateHotel(id, data) {
    const { name, address, city, description } = data;
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
    }
    if (address !== undefined) {
        updates.push('address = ?');
        values.push(address);
    }
    if (city !== undefined) {
        updates.push('city = ?');
        values.push(city);
    }
    if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
    }
    
    if (updates.length === 0) {
        return getHotelById(id);
    }
    
    values.push(id);
    await db.execute(
        `UPDATE hotels SET ${updates.join(', ')} WHERE id = ?`,
        values
    );
    return getHotelById(id);
}

async function deleteHotel(id) {
    await db.execute('DELETE FROM hotels WHERE id = ?', [id]);
    return true;
}

module.exports = {
    createHotel,
    getAllHotels,
    getHotelById,
    updateHotel,
    deleteHotel
};