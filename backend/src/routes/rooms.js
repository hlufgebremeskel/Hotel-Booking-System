const express = require('express');
const router = express.Router();
const controller = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes (customers)
router.get('/', controller.getAll); // GET /api/rooms
router.get('/hotel/:hotelId', controller.getByHotel); // GET /api/rooms/hotel/:hotelId
router.get('/:id', controller.getOne);// GET /api/rooms/:id

// Protected admin routes
router.post('/', protect, adminOnly, controller.create);   // POST /api/rooms
router.put('/:id', protect, adminOnly, controller.update); // PUT /api/rooms/:id
router.delete('/:id', protect, adminOnly, controller.remove); // DELETE /api/rooms/:id

module.exports = router;

