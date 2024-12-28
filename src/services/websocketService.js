const WebSocket = require('ws');
const EventEmitter = require('events');

class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.wss = null;
    this.clients = new Set();
  }

  init(port) {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocket.Server({ 
          port,
          clientTracking: true,
          handleProtocols: () => 'mt4'
        }, () => {
          console.log(`WebSocket server running on port ${port}`);
          this.setupServerHandlers();
          resolve();
        });
      } catch (error) {
        console.error('Error initializing WebSocket server:', error);
        reject(error);
      }
    });
  }

  setupServerHandlers() {
    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  handleConnection(ws, req) {
    console.log('MT4 client connected');
    this.clients.add(ws);

    ws.on('error', (error) => {
      console.error('Client connection error:', error);
    });

    ws.on('close', () => {
      console.log('MT4 client disconnected');
      this.clients.delete(ws);
    });

    // Send initial prices
    this.emit('client:connected', ws);
  }

  broadcast(data) {
    const message = JSON.stringify(data);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Error sending to client:', error);
          this.clients.delete(client);
        }
      }
    }
  }
}

module.exports = new WebSocketService();