import jwt from 'jsonwebtoken';

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.cookie
        ?.split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Attach user info to the socket
    socket.user = decoded;
    next();
  } catch (error) {
    console.error("Socket Authentication Error:", error);
    next(new Error("Authentication error"));
  }
};
