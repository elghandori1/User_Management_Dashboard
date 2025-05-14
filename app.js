// app.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const dataFilePath = path.join(__dirname, 'data.json');
let users = [];

try {
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    users = JSON.parse(rawData);
} catch (err) {
    console.error('Error loading data from data.json:', err);
}

function saveUsersToFile(callback) {
    fs.writeFile(dataFilePath, JSON.stringify(users, null, 4), 'utf8', (err) => {
        if (err) {
            console.error('Error writing data.json:', err);
        }
        if (callback) {
            callback(err);
        }
    });
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/users', (req, res) => {
    res.json(users);
});

app.get('/user/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
});


app.post('/AddNewUser', (req, res)=>{
    if (!req.body.name || !req.body.salary) {
        return res.status(400).json({error:'Name and Salary is required'});
    }
    const newUser = {
        id: users.length + 1,
        name: req.body.name,
        salary: Number(req.body.salary) 
    };

    users.push(newUser);
    saveUsersToFile((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error saving user data after add' });
        }
        res.status(201).json({ message: 'User added successfully'});
    });
});

app.delete('/DeleteUser/:id',(req,res)=>{
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    const findUserIndex = users.findIndex((x)=>x.id === Number(id));

    if (findUserIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }
    users.splice(findUserIndex, 1)[0];
    saveUsersToFile((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error saving user data after delete' });
        }
        res.status(200).json({ message: 'User deleted successfully'});
    });
});

app.put('/UpdateUser/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, salary } = req.body;
    const index = users.findIndex(user => user.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    users[index].name = name;
    users[index].salary = salary;
    saveUsersToFile((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error saving user data after update' });
        }
        res.status(200).json({ message: "User updated successfully" });
    });
  
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});