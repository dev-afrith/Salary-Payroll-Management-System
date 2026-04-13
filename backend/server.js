const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// ─── Socket.io Security Middleware ────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error: Token missing'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io Connection Logic
const { saveMessage } = require('./controllers/communication.controller');

io.on('connection', (socket) => {
  // Use verified identity from JWT
  // For employees, we use their database ID (employees.id) for rooms
  // For admins, we use their users.id
  const entityId = socket.user.role === 'employee' ? socket.user.employee_db_id : socket.user.id;
  const { role } = socket.user;
  
  // Join their own room for private messages automatically
  socket.join(`${role}_${entityId}`);
  console.log(`📡 Socket connected & secured: ${role}_${entityId}`);

  // Client joining a specific direct chat room or public broadcast
  socket.on('send_message', async (data) => {
    // data = { senderId, senderRole, receiverId, receiverRole, content }
    try {
      const savedMsg = await saveMessage(
        data.senderId, data.senderRole, data.receiverId, data.receiverRole, data.content
      );
      
      if (!data.receiverId) {
        // Public message
        io.emit('receive_message', savedMsg);
      } else {
        // Private message
        // emit to receiver
        io.to(`${data.receiverRole}_${data.receiverId}`).emit('receive_message', savedMsg);
        // emit to sender 
        io.to(`${data.senderRole}_${data.senderId}`).emit('receive_message', savedMsg);
      }
    } catch(err) {
      console.error('Socket Send Message Error:', err);
    }
  });

  socket.on('mark_messages_read', (data) => {
    // Forward the read receipt to the original sender
    // data = { myId, myRole, contactId, contactRole }
    io.to(`${data.contactRole}_${data.contactId}`).emit('messages_read', {
      readerId: data.myId,
      readerRole: data.myRole
    });
  });
});


// ─── Global Middleware ────────────────────────────────
app.use(cors({
  origin: true, // Allow all for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting disabled for development
/*
const apiLimiter = rateLimit({ ... });
...
app.use('/api', apiLimiter);
*/

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employees.routes');
const departmentRoutes = require('./routes/departments.routes');
const designationRoutes = require('./routes/designations.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const salaryRoutes = require('./routes/salary.routes');
const payrollRoutes = require('./routes/payroll.routes');
const leavesRoutes = require('./routes/leaves.routes');
const reportRoutes = require('./routes/report.routes');
const chatRoutes = require('./routes/chat.routes');
const communicationRoutes = require('./routes/communication.routes');

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/communication', communicationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// System Stats (Public)
app.get('/api/public/stats', async (req, res) => {
  try {
    const db = require('./config/db');
    const [empResult] = await db.query('SELECT COUNT(*) as count FROM employees');
    const [payslipResult] = await db.query('SELECT COUNT(*) as count FROM payroll');
    res.json({
      employees: empResult[0].count,
      payslips: payslipResult[0].count
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.json({ employees: 0, payslips: 0 });
  }
});

// ─── 404 Handler ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ─── Start Server ────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 AstraX Technologies API running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
