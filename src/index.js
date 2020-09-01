const Database = require('./Database');
const path = require('path');
const Game = require('./Game');
const Player = require('./Player');

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use('/', express.static(path.join(__dirname, '../res')));

/* Database test */
const argv = process.argv;
if (argv.length !== 3) {
    console.log('Correct usage: ' + argv[0] + ' ' + argv[1] + ' <group name>');
    return;
}

const main = async function() {
    try {
        const db = new Database(argv[2]);
        await db.start();
        global.wwtGame = new Game(db);
        let participantsSQL = await db.getParticipants();
        let participants = [];
        for (let i = 0; i < participantsSQL.length; ++i) {
            participants.push(participantsSQL[i].sender);
        }
        wwtGame.chooseParticipants(participants);
    } catch (err) {
        console.error(err);
    }
};

main().then(() => {
    io.on('connection', async function(socket) {
        wwtGame.addPlayer(new Player(socket));
        await wwtGame.start(); //TODO need to be replaced
    });

    http.listen(8080, function () {
        console.log('listening on *:8080');
    });
});