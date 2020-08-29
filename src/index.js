const express = require('express');
const Database = require('./Database');

const app = express();

app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.send('Vous êtes à l\'accueil');
});

/* Database test */
const argv = process.argv;
if (argv.length === 3) {
    try {
        const db = new Database(argv[2]);
        db.connect();
        db.createTables();
        db.convertJsonToSqlite();
    } catch (err) {
        console.error(err);
        return;
    }
}
else {
    console.log('Correct usage: ' + argv[0] + ' ' + argv[1] + ' <group name>');
    return;
}

app.listen(8080);