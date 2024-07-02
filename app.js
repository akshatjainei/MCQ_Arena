const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const run = require('./genModel')
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let rooms = {}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('createRoom', (room) => {
        socket.join(room);
        rooms[room] = { users: [socket.id], questions: [], scores: {} };
        socket.emit('roomCreated', room);
    });

    socket.on('joinRoom', (room) => {
        if (rooms[room] && rooms[room].users.length < 2) {
            socket.join(room);
            rooms[room].users.push(socket.id);
            socket.emit('roomJoined', room);
            io.to(room).emit('startGame');
        } else {
            socket.emit('roomFull');
        }
    });

    socket.on('submitAnswer', (data) => {
        const { room, answer } = data;
        if (!rooms[room].scores[socket.id]) {
            rooms[room].scores[socket.id] = 0;
        }
        if (answer.correct) {
            rooms[room].scores[socket.id]++;
        }
        io.to(room).emit('updateScores', rooms[room].scores);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        for (let room in rooms) {
            let users = rooms[room].users;
            if (users.includes(socket.id)) {
                users.splice(users.indexOf(socket.id), 1);
                if (users.length === 0) {
                    delete rooms[room];
                }
            }
        }
    });
});

app.get('/test' , async (req , res)=>{
    const data = await run()
    console.log(express.json(data))
    res.send(express.json(data))
})
server.listen(3000, () => {
    console.log('listening on http://localhost:3000');
});
