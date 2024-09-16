const express = require('express');
const app = express();
const http = require('http').createServer(app);


const port = 3000;
http.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
let connectedUsers = [];

// Socket.io setup
const io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log('New user connected');
    
    socket.on('setUsername', (username) => {
        // Add the new user to the list
        connectedUsers.push({ id: socket.id, name: username });
        
        // Broadcast the updated user list to all clients
        io.emit('updateUserList', connectedUsers);
    });

    // Remove user on disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
        
        // Remove the disconnected user from the list
        connectedUsers = connectedUsers.filter(user => user.id !== socket.id);
        
        // Broadcast the updated user list to all clients
        io.emit('updateUserList', connectedUsers);
    });
    
    socket.on('textmessage', (msg) => {
        socket.broadcast.emit('textmessage', msg);
    });
});
