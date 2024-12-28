const Decimal = require('decimal.js');
const { symbolMapping } = require('../config/symbols');

function formatMT4Price(symbol, price, volume) {
  return {
    symbol: symbolMapping[symbol] || symbol,
    bid: new Decimal(price).toFixed(8),
    ask: new Decimal(price).plus(0.00001).toFixed(8),
    volume: volume,
    timestamp: Date.now()
  };
}

module.exports = { formatMT4Price };