import { io } from 'socket.io-client';

const URL = 'http://localhost:5005';

export const socket = io(URL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem('payroll_token')
  }
});
