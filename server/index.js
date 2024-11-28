// index.js
const express = require('express');
const cors = require('cors'); // Import CORS
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

// Create Express app
const app = express();
app.use(cors());
// Middleware to parse JSON requests
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/colleges", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// API Routes
app.use('/schedule', userRoutes);
app.use('/teacher', teacherRoutes);

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
