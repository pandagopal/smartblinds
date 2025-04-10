const express = require('express');
const router = express.Router();

// TODO: Implement cart controllers
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Cart API endpoint - not yet implemented',
    data: []
  });
});

module.exports = router;
