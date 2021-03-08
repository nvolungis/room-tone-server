const app = require('express')();
const http = require('http').Server(app);

const isProd = process.env.NODE_ENV === 'production';

const clientOrigin = isProd
  ? 'https://room-tone-client-qjy9s.ondigitalocean.app'
  : 'http://localhost:3000'

const io = require('socket.io')(http, {
  cors: {
    origin: clientOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

http.listen(8000, () => {
  console.log('listening on *:8000');
});
