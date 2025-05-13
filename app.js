// app.js
const { error } = require('console');
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
        return res.status(400).json({error:'Name and Salary is required'});
    }
    const newUser = {
        id: users.length + 1,
        name: req.body.name,
        salary: req.body.salary
    };

    users.push(newUser);
    res.status(201).json({ message: 'User added successfully'});
});

app.delete('/DeleteUser/:id',(req,res)=>{
    const id = parseInt(req.params.id);
    const findUserIndex = users.findIndex((x)=>x.id === Number(id));

    if (findUserIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }
    users.splice(findUserIndex, 1);
    res.status(200).json({ message: 'User deleted successfully'});
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});