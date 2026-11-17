const Room = require('../models/roomModel');

exports.create = async (req, res) => {
    try {
        const room = await Room.createRoom(req.body);
        res.status(201).json({ success: true, data: room });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
};

exports.getByHotel = async (req, res) => {
  try {
    console.log("Params:", req.params);

    const hotelId = Number(req.params.hotelId);
    console.log("Parsed hotelId:", hotelId);

    if (!hotelId) {
      return res.status(400).json({ success: false, message: "Invalid hotel ID" });
    }

    const rooms = await Room.getRoomsByHotel(hotelId);
    console.log("Rooms from DB:", rooms);

    res.json({ success: true, data: rooms });
  } catch (err) {
    console.error("Room fetch error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.getOne = async (req, res) => {
    try {
        const room = await Room.getRoomById(req.params.id);
        if(!room) {
            return res.status(404).json({ success: false, error: 'Not Found'});
        }   
        res.json({ success: true, data: room });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const room = await Room.updateRoom(req.params.id, req.body);
        res.json({ success: true, data: room });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        await Room.deleteRoom(req.params.id);
        res.json({ success: true, message: "Room deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
  };

  exports.getAll = async (req, res) => {
  try {
    const [rows] = await require('../db').execute('SELECT * FROM rooms');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
