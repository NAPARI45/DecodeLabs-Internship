const express = require('express');
const cors = require('cors');
const mongoose    = require('mongoose');
require('dotenv').config()

const cycleRoutes = require('./routes/cycles');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/cycles', cycleRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    message:  'Luna API is running 🌙',
    version:  '2.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
 
app.use('*path', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT        = process.env.PORT        || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/luna';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

app.listen(PORT, () => {
    console.log(`Luna API is running on port http://localhost:${PORT}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/cycles`);
    console.log(`   POST http://localhost:${PORT}/cycles`);
});

})
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Make sure MongoDB is running on your computer.');
    process.exit(1);
  });