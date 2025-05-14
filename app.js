// app.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();

app.use(session({
    secret: 'mysecretkey12345',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));


const registeredPath = path.join(__dirname, 'registered.json');
let registeredUsers = [];

try {
    const rawRegistered = fs.readFileSync(registeredPath, 'utf8');
    registeredUsers = JSON.parse(rawRegistered);
    if (!Array.isArray(registeredUsers)) {
        console.warn('registered.json content is not an array, initializing as empty.');
        registeredUsers = [];
    }
} catch (err) {
    console.error('Error loading registered users:', err);
    registeredUsers = [];
}

function saveRegisteredUsers(callback) {

    fs.writeFile(registeredPath, JSON.stringify(registeredUsers, null, 4), 'utf8', (err) => {
        if (err) {
            console.error('Error writing registered.json:', err);
        }
        if (callback) {
            callback(err);
        }
    });
}

const dataFilePath = path.join(__dirname, 'data.json');
let users = [];

try {
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    users = JSON.parse(rawData);
    if (!Array.isArray(users)) {
         console.warn('data.json content is not an array, initializing as empty.');
         users = [];
     }
} catch (err) {
    console.error('Error loading data from data.json:', err);
    users = [];
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

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
     if (req.session && req.session.user) {
        return res.redirect('/');
    }
   res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    if (registeredUsers.length >= 1) {
        return res.status(403).json({ success: false, message: 'Only one user can use this site.' });
    }

    const existingUser = registeredUsers.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).json({ success: false, message: 'Username already exists.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        registeredUsers.push({ username, password: hashedPassword });

        saveRegisteredUsers((err) => {
            if (err) {
                console.error('Error saving new registered user:', err);
                return res.status(500).json({ success: false, message: 'Error during registration.' });
            }
            res.status(201).json({ success: true, message: 'Registration successful! You can now log in.' });
        });
    } catch (error) {
        console.error('Error hashing password during registration:', error);
        res.status(500).json({ success: false, message: 'Internal server error during registration.' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = registeredUsers.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        req.session.user = { username: user.username };

        res.status(200).json({ success: true, message: 'Login successful!' });

    } catch (err) {
        console.error('Error during login comparison:', err);
        res.status(500).json({ success: false, message: 'Internal server error during login.' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        console.log(`Access denied for ${req.method} ${req.path}, redirecting to login.`);
        return res.redirect('/login');
    }
}


app.get('/',isAuthenticated,(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html')); // Changed to Home.html
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
     if (!req.body.name || typeof req.body.salary === 'undefined') {
        return res.status(400).json({error:'Name and Salary is required'});
    }
    const newSalary = Number(req.body.salary);
    if (isNaN(newSalary)) {
         return res.status(400).json({error:'Salary must be a number'});
    }

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: req.body.name,
        salary: newSalary
    };

    users.push(newUser);
    saveUsersToFile((err) => {
        if (err) {
            console.error('Error saving user data after add:', err);
            return res.status(500).json({ error: 'Error saving user data after add' });
        }
        res.status(201).json({ message: 'User added successfully', user: newUser });
    });
});

app.delete('/DeleteUser/:id',(req,res)=>{
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    const findUserIndex = users.findIndex((x)=>x.id === id);

    if (findUserIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }
    users.splice(findUserIndex, 1);

    saveUsersToFile((err) => {
        if (err) {
            console.error('Error saving user data after delete:', err);
            return res.status(500).json({ error: 'Error saving user data after delete' });
        }
        res.status(200).json({ message: 'User deleted successfully', id: id });
    });
});

app.put('/UpdateUser/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, salary } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    const index = users.findIndex(user => user.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    if (name === undefined && salary === undefined) {
        return res.status(400).json({ error: 'At least name or salary must be provided for update' });
    }

    if (name !== undefined) {
        users[index].name = name;
    }
    if (salary !== undefined) {
         const updatedSalary = Number(salary);
         if (isNaN(updatedSalary)) {
             return res.status(400).json({error:'Salary must be a number if provided'});
         }
        users[index].salary = updatedSalary;
    }

    saveUsersToFile((err) => {
        if (err) {
            console.error('Error saving user data after update:', err);
            return res.status(500).json({ error: 'Error saving user data after update' });
        }
        res.status(200).json({ message: "User updated successfully", user: users[index] });
    });
});

// --- Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
