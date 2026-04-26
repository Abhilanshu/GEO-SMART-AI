const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
const needRoutes = require('./routes/needRoutes');
const authRoutes = require('./routes/authRoutes');
const predictiveRoutes = require('./routes/predictiveRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const smsRoutes = require('./routes/smsRoutes');
const { processAIOrder } = require('./controllers/aiController');

// Strategic API Endpoints
app.use('/api/needs', needRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/predictive', predictiveRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sms', smsRoutes);
app.post('/api/ai/command', processAIOrder);

// Basic Health Check
app.get('/', (req, res) => {
  res.send('GeoSmart AI Mission Control is LIVE.');
});

// Socket.io Real-time Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('📡 Intelligence Hub Connected:', socket.id);
});

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/geosmart')
  .then(() => console.log('🔥 MongoDB Tactical Database Connected'))
  .catch(err => console.log('❌ Connection Error:', err));

server.listen(PORT, () => {
  console.log(`🚀 Mission Control listening on port ${PORT}`);
});
