const database = require('../utils/database');

class Subscription {
  static create(data) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      const { name, url, type, expires_at } = data;
      
      db.run(
        'INSERT INTO subscriptions (name, url, type, expires_at) VALUES (?, ?, ?, ?)',
        [name, url, type, expires_at],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...data });
          }
        }
      );
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      
      db.all('SELECT * FROM subscriptions WHERE is_active = 1', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      
      db.get('SELECT * FROM subscriptions WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static update(id, data) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      const { name, url, type, expires_at, last_checked } = data;
      
      db.run(
        'UPDATE subscriptions SET name = ?, url = ?, type = ?, expires_at = ?, last_checked = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, url, type, expires_at, last_checked, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, changes: this.changes });
          }
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      
      db.run('UPDATE subscriptions SET is_active = 0 WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  static getStats() {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      
      db.get(
        'SELECT COUNT(*) as total, COUNT(CASE WHEN expires_at IS NULL OR expires_at > datetime("now") THEN 1 END) as active FROM subscriptions WHERE is_active = 1',
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }
}

module.exports = Subscription;