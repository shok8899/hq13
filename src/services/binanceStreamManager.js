const Binance = require('binance-api-node').default;
const EventEmitter = require('events');

class BinanceStreamManager extends EventEmitter {
  constructor() {
    super();
    this.client = Binance();
    this.streams = new Map();
    this.reconnectDelay = 5000;
  }

  async connect(symbols) {
    try {
      console.log('Connecting to Binance streams...');
      
      // Close existing streams if any
      this.closeAllStreams();
      
      // Create new stream
      const stream = this.client.ws.trades(symbols, trade => {
        this.emit('trade', trade);
      });
      
      // Store stream reference
      this.streams.set('trades', stream);
      
      console.log('Successfully connected to Binance streams');
    } catch (error) {
      console.error('Failed to connect to Binance streams:', error);
      setTimeout(() => this.connect(symbols), this.reconnectDelay);
    }
  }

  closeAllStreams() {
    for (const [key, stream] of this.streams.entries()) {
      if (stream && typeof stream.close === 'function') {
        try {
          stream.close();
        } catch (error) {
          console.error(`Error closing stream ${key}:`, error);
        }
      }
    }
    this.streams.clear();
  }
}

module.exports = new BinanceStreamManager();