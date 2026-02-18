const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

const socketManager = require('./src/sockets/socketManager');

// ... (socket init)

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev to fix connection issues
        methods: ["GET", "POST"]
    }
});

// Initialize Socket Manager
socketManager(io);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/routes', require('./src/routes/routeRoutes'));
app.use('/api/history', require('./src/routes/historyRoutes'));

app.get('/', (req, res) => {
    res.send('NST Shuttle Tracker API is running');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
