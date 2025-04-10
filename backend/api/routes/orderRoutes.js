const express = require('express');
const router = express.Router();

// TODO: Implement order controllers
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Orders API endpoint - not yet implemented',
    data: []
  });
});

module.exports = router;
