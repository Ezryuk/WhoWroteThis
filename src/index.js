const express = require('express');
const Database = require('./Database');
const path = require('path');

const app = express();

app.use('/res', express.static(path.join(__dirname, '../res')));

app.get("/",function (req, res) {
  res.sendFile(path.join(__dirname, '../res/index.html'))
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
}

app.listen(8080);