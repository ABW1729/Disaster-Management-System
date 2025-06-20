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
app.use(cookieParser())
app.use('/disasters', disasterRoutes);
const activeSockets = new Map();
const socketToUser = new Map(); 
io.on('connection', socket => {
  console.log('🛰️ Client connected:', socket.id);
  socket.on('user_login', ({ user_id }) => {
  if (!activeSockets.has(user_id)) activeSockets.set(user_id, []);
  activeSockets.get(user_id).push(socket.id);
  socketToUser.set(socket.id, user_id);
});
  
   resourceSocketHandler(socket, io);
   socialSocketListeners(socket,io);
  
  socket.on('user_logout', ({ user_id }) => {
  const sockets = activeSockets.get(user_id) || [];
  sockets.forEach(id => io.sockets.sockets.get(id)?.disconnect());
  activeSockets.delete(user_id);
  sockets.forEach(id => socketToUser.delete(id));
  console.log(`[SOCKET] Logged out all sockets for user: ${user_id}`);
});
  
  socket.on('disconnect', () => {
  const user_id = socketToUser.get(socket.id);
  if (!user_id) return;
  const sockets = activeSockets.get(user_id) || [];
  const filtered = sockets.filter(id => id !== socket.id);
  if (filtered.length > 0) {
    activeSockets.set(user_id, filtered);
  } else {
    activeSockets.delete(user_id);
  }
  socketToUser.delete(socket.id);
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

app.post('/logout', (req, res) => {
  const sessionId = req.cookies?.sessionId;
  if (sessionId && sessions[sessionId]) {
    const user_id = sessions[sessionId].id || sessions[sessionId].username;
    delete sessions[sessionId];
  }

  res.clearCookie('sessionId');
  return res.json({ message: 'Logged out successfully' });
});
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
