// Create socket.io connection and export the same

const socket = require("socket.io");

let io;

module.exports = {
  init: (httpServer) => {
    io = socket(httpServer, {
      cors: {
        origin: "*",
      },
    });
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
