const express = require('express');
const router = express.Router();
const binanceService = require('../services/binanceService');
const { symbolMapping } = require('../config/symbols');

router.get('/symbols', (req, res) => {
  try {
    const symbols = Array.from(binanceService.prices.keys())
      .map(symbol => symbolMapping[symbol] || symbol);
    res.json(symbols);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/price/:symbol', (req, res) => {
  try {
    const price = binanceService.getPrice(req.params.symbol);
    if (price) {
      res.json(price);
    } else {
      res.status(404).json({ error: 'Symbol not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;