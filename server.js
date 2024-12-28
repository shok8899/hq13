const express = require('express');
const binanceService = require('./src/services/binanceService');
const websocketService = require('./src/services/websocketService');
const apiRoutes = require('./src/routes/api');

const app = express();
app.use(express.json());
app.use('/', apiRoutes);

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function startServer() {
  try {
    // Initialize WebSocket server first
    await websocketService.init(8001);

    // Start HTTP server
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`HTTP server running on port ${PORT}`);
    });

    // Start Binance streams last
    await binanceService.startStreams((price) => {
      websocketService.broadcast(price);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();