const express = require('express');
const router = express.Router();
const controller = require('../controllers/hotelController');
const { protect, adminOnly } = require('../middleware/auth');

// Public
router.get('/', (req, res, next) => {
    console.log("Hotels Router: GET /");
    next();
}, controller.getAll);

router.get('/:id', (req, res, next) => {
    console.log("Hotels Router: GET /:id, id=", req.params.id);
    next();
}, controller.getOne);

// Admin only
router.post('/', protect, adminOnly, controller.create);
router.put('/:id', protect, adminOnly, controller.update);
router.delete('/:id', protect, adminOnly, controller.remove);

module.exports = router;
