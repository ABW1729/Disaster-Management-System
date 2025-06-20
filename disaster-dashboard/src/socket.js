import { io } from 'socket.io-client';

const socket = io('https://disaster-management-system-production-22c3.up.railway.app', {
  withCredentials: true,
});

export default socket;
