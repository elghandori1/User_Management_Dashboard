// app.js
const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');


// Read the JSON file
const rawData = fs.readFileSync('data.json');
const users = JSON.parse(rawData);

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/users', (req, res) => {
    res.json(users);
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});