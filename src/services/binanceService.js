const { formatMT4Price } = require('../utils/priceFormatter');
const streamManager = require('./binanceStreamManager');

class BinanceService {
  constructor() {
    this.prices = new Map();
    this.setupStreamHandlers();
  }

  setupStreamHandlers() {
    streamManager.on('trade', trade => {
      try {
        const mt4Price = formatMT4Price(trade.symbol, trade.price, trade.quantity);
        this.prices.set(trade.symbol, mt4Price);
        this.emit('price', mt4Price);
      } catch (error) {
        console.error('Error processing trade:', error);
      }
    });
  }

  async getSymbols() {
    try {
      const exchangeInfo = await streamManager.client.exchangeInfo();
      return exchangeInfo.symbols
        .filter(s => s.quoteAsset === 'USDT' && s.status === 'TRADING')
        .map(s => s.symbol);
    } catch (error) {
      console.error('Error fetching symbols:', error);
      throw error;
    }
  }

  async startStreams(onPrice) {
    try {
      const symbols = await this.getSymbols();
      this.on('price', onPrice);
      await streamManager.connect(symbols);
    } catch (error) {
      console.error('Error starting streams:', error);
      setTimeout(() => this.startStreams(onPrice), 5000);
    }
  }

  getPrice(symbol) {
    return this.prices.get(symbol);
  }

  getAllPrices() {
    return Array.from(this.prices.values());
  }
}

// Inherit from EventEmitter
const EventEmitter = require('events');
Object.setPrototypeOf(BinanceService.prototype, EventEmitter.prototype);
Object.setPrototypeOf(BinanceService, EventEmitter);

module.exports = new BinanceService();