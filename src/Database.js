const sqlite3 = require('sqlite3');
const fs = require('fs');

class Database {

  constructor(group) {
    this.group = group;
    if (!fs.existsSync('databases')) {
      fs.mkdirSync('databases');
    }
    if (!fs.existsSync('databases/sqlite')) {
      fs.mkdirSync('databases/sqlite');
    }
    if (!fs.existsSync('databases/json')) {
      fs.mkdirSync('databases/json');
    }
    if (!fs.existsSync('databases/json/' + group)) {
      throw 'databases/json/' + group + ' not found. Put the json files there';
    }
    if (!fs.existsSync('databases/json/' + group + '/message_1.json')) {
      throw 'databases/json/' + group + '/message_1.json not found';
    }
  };

  convertJsonToSqlite() {
    console.log('Converting json to sqlite...');
    console.log('Conversion finished');
  }

  connect() {
    this.db = new sqlite3.Database('./databases/sqlite/' + this.group + '.sqlite', (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to database');
    });
  }
}

module.exports = Database;