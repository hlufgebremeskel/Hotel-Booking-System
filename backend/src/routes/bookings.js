const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', controller.createBooking);
router.get('/', protect, adminOnly, controller.getAll);
router.put('/:id/checkout', controller.checkout);
router.get('/my', protect, controller.getMyBookings);
router.put('/:id/cancel', protect, controller.cancelBooking);
router.post('/:id/pay', protect, controller.payBooking);
// update status / admin endpoints remain
router.put('/:id', protect, adminOnly, controller.updateStatus);
router.delete('/:id', protect, adminOnly, controller.delete);

module.exports = router;