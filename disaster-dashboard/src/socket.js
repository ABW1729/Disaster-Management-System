import { io } from 'socket.io-client';

const socket = io('http://51.20.134.106:5000', {
  withCredentials: true,
});

export default socket;
