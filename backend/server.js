const morgan = require('morgan');
const express = require('express');
const http = require('http');
const cors = require('cors');
const disasterRoutes = require('./routes/disasterRoutes');
const resourceSocketHandler=require('./sockets/resourceSocketHandler');
const socialSocketListeners=require('./sockets/socialsocketHandler');
const app = express();
const server = http.createServer(app);
const { v4: uuidv4 } = require('uuid');


app.use(morgan('dev'));
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'https://disaster-management-system-black.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
global.io = io; 
app.use(cors({
  origin: 'https://disaster-management-system-black.vercel.app', 
  credentials: true,               
}));
app.use(express.json());
app.use('/disasters', disasterRoutes);

io.on('connection', socket => {
  console.log('🛰️ Client connected:', socket.id);
   resourceSocketHandler(socket, io);
   socialSocketListeners(socket,io);
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const users = {
  admin: {id:1, username: 'admin', role: 'admin', password: 'admin123' },
  user: {id:2,username: 'user', role: 'user', password: 'user123' },
};

const sessions = {};

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const sessionId = uuidv4();
  sessions[sessionId] = { username: user.username, role: user.role ,id:user.id };

  res.cookie('sessionId', sessionId, { httpOnly: true });
  res.json({ message: 'Login successful', role: user.role , id:user.id  });
});
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
