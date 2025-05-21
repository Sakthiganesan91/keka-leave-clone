let ioInstance = null;

export const initSocket = (io, subClient) => {
  ioInstance = io;

  subClient.subscribe("employeeUpload", (err, count) => {
    if (err) {
      console.error("Failed to subscribe:", err.message);
    } else {
      console.log(`Subscribed to ${count} channel(s)`);
    }
  });

  subClient.on("message", (channel, message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received from Redis`, data);
      io.emit("job-completed", data);
    } catch (err) {
      console.error("Failed to parse message:", err.message);
    }
  });
};

export const getIO = () => {
  if (!ioInstance) throw new Error("Socket.io not initialized!");
  return ioInstance;
};
