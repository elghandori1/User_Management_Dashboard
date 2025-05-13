// app.js
const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');


// Read the JSON file
const rawData = fs.readFileSync('data.json');
const users = JSON.parse(rawData);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/AddNewUser', (req, res)=>{

    if (!req.body.name || !req.body.salary) {
        return res.status(400).send('Name  and Salary is required');
    }
    const newUser = {
        id: users.length + 1,
        name: req.body.name,
        salary: req.body.salary
    };

    users.push(newUser);
    res.status(201).json({ message: 'User added successfully'});
});
// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});