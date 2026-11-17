const Hotel = require('../models/hotelModel');

exports.create = async (req, res) => {
    try {
        const hotel = await Hotel.createHotel(req.body);
        res.status(201).json({ success: true, data: hotel });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const hotels = await Hotel.getAllHotels();
        res.json({
            success: true,
            data: hotels
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        console.log("Fetching hotel with ID:", req.params.id);
        const hotel = await Hotel.getHotelById(req.params.id);
        console.log("Found hotel:", hotel);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Not Found" });
        }
        res.json({ success: true, data: hotel });
    }
    catch (err) {
        console.error("Error fetching hotel:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const hotel = await Hotel.updateHotel(req.params.id, req.body);
        res.json({ success: true, data: hotel });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        await Hotel.deleteHotel(req.params.id);
        res.json({ success: true, message: "Hotel deleted successfullly" });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};