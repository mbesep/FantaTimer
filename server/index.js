const express = require('express')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


let port = 3001
let timerStarted = false; 
let timer = 0;
let lastClickedUser = "";
const users = []

server.listen(port, () => {
    console.log("listening at port 3001")
});
io.on('connection', (socket) => {
    console.log('connected to', socket.id)
    const room = 'MYROOM'

    socket.on("adduser", (username) => {
        socket.user = username;
        lastClickedUser = username;
        users.push(username)
        console.log("latest users", users)
        console.log(lastClickedUser)
        io.sockets.emit("users", users)
    })
   
    socket.on("disconnect", () => {
        console.log("deleting ", socket.user)

        if (socket.user) {
            users.splice(users.indexOf(socket.user), 1);
        }
        io.sockets.emit("users", users)
        console.log('remaining users: ', users)
    });

    socket.on("startTimer", (username) => {
        if (timerStarted) {
            return; // Evita di avviare il timer se è già stato avviato
        }
            timerStarted = true;
            timer = 10;
            io.sockets.emit("updateTimer", timer);
            io.sockets.emit("disableStartButton"); // Invia un segnale per disabilitare il pulsante
            io.sockets.emit("showLastClickedUser", username);
  });

  socket.on("resetTimer", (username) => {
    timer = 10;
    io.sockets.emit("updateTimer", timer);
    io.sockets.emit("showLastRaisedUser", username);
  });

  socket.on("resetStartButton", () => {
    timerStarted = false;
    io.sockets.emit("enableStartButton"); // Invia un segnale per riabilitare il pulsante
});

  socket.on("increaseTimer", () => {
    timer += 10;
    io.sockets.emit("updateTimer", timer);
  });

  socket.on("decreaseTimer", () => {
    timer -= 10;
    if (timer < 0) timer = 0;
    io.sockets.emit("updateTimer", timer);
  });
});