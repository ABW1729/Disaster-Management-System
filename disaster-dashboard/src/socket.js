import { io } from 'socket.io-client';

const socket = io('https://disaster-management-system-production-22c3.up.railway.app:5000', {
  withCredentials: true,
});

export default socket;
