const sqlite3 = require('sqlite3');
const fs = require('fs');
const sha256File = require('sha256-file');
const utf8 = require('utf8');

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

  async start() {
    await this.connect();
    await this.createTables();
    await this.convertJsonToSqlite();
  }

  getParticipants() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT DISTINCT sender FROM messages;', [], (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  }

  getRandomMessage(participants) {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM messages WHERE sender IN (${participants.map(function(){ return '?' }).join(',')}) AND type = 0 ORDER BY RANDOM() LIMIT 1;`, participants, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  }
  
  getMessagesBefore(limit, timestamp) {
	return new Promise((resolve, reject) => {
	  this.db.all(`SELECT * FROM messages WHERE timestamp <= ? ORDER BY timestamp DESC LIMIT ?;`, timestamp, limit, (err, rows) => {
		if (err) {
          reject(err);
        }
        resolve(rows);
	  }); 
	});
  }

  addJsonToDatabase(json) {
    const typeToInt = function(type) {
      return type === "Generic" ? 0 : 1;
    };
    const messages = json.messages;
    for (let i = 0; i < messages.length; ++i) {
      const msg = messages[i];
      if (msg.content) {
        this.db.run('INSERT INTO messages VALUES (?, ?, ?, ?);', [utf8.decode(msg.sender_name), msg.timestamp_ms, utf8.decode(msg.content), typeToInt(msg.type)]);
      }
    }
  }

  async convertJsonToSqlite() {
    let filesIds = await this.getModifiedFilesIds();
    if (filesIds.length === 0) {
      return;
    }
    console.log('Converting json to sqlite...');
    this.db.run("BEGIN TRANSACTION");
    for (let i = 0; i < filesIds.length; ++i) {
      try {
        this.addJsonToDatabase(JSON.parse(fs.readFileSync('databases/json/' + this.group + '/message_' + filesIds[i] + '.json', 'ascii')));
        console.log('Processing message_' + filesIds[i] + '.json...');
      } catch {
        console.log('message_' + filesIds[i] + '.json is not valid !');
      }
      this.db.run('REPLACE INTO hashes VALUES (?, ?);', [filesIds[i], sha256File('databases/json/' + this.group + '/message_' + filesIds[i] + '.json')]);
    }
    this.db.run("COMMIT", () => {
      console.log('Conversion finished');
    });
  }

  getModifiedFilesIds() {
    return new Promise((resolve, reject) => {
      let files = [];
      let i = 1;
      let dict = {};
      this.db.all('SELECT * FROM hashes;', [], (err, rows) => {
        if (err) {
          reject(err);
        }
        else {
          rows.forEach((row) => {
            dict[row.message_id] = row.sha256;
          });
          while (fs.existsSync('databases/json/' + this.group + '/message_' + i + '.json')) {
            if (dict[i] !== sha256File('databases/json/' + this.group + '/message_' + i + '.json')) {
              files.push(i);
            }
            ++i;
          }
          resolve(files);
        }
      });
    });
  }

  createTables() {
    return new Promise((resolve, reject) => {
      this.db.run('CREATE TABLE IF NOT EXISTS hashes(message_id INTEGER PRIMARY KEY, sha256 TEXT);', [], (err, rows) => {
        if (err) {
          reject(err);
        }
        this.db.run('CREATE TABLE IF NOT EXISTS messages(sender TEXT, timestamp BIGINT, content LONGTEXT, type INTEGER, CONSTRAINT pk PRIMARY KEY (timestamp, content));', [], (err, rows) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    });
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database('./databases/sqlite/' + this.group + '.sqlite', (err) => {
        if (err) {
          reject(err);
        }
        console.log('Connected to database');
        resolve();
      });
    });
  }
}

module.exports = Database;