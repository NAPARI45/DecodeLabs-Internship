const express = require('express');
const cors = require('cors');

const cycleRoutes = require('./routes/cycles');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/cycles', cycleRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Luna API is running',
        version: '1.0.0'
    });
});

app.use('*path', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `${req.method} ${req.originalUrl} does not exist`


    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Luna API is running on port http://localhost:${PORT}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/cycles`);
    console.log(`   POST http://localhost:${PORT}/cycles`);
})