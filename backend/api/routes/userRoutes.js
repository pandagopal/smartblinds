const express = require('express');
const router = express.Router();

// TODO: Implement user controllers
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Users API endpoint - not yet implemented',
    data: []
  });
});

module.exports = router;
