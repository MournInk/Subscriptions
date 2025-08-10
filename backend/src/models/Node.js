const database = require('../utils/database');

class Node {
  static create(data) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      const { name, type, config, subscription_id, source } = data;
      
      db.run(
        'INSERT INTO nodes (name, type, config, subscription_id, source) VALUES (?, ?, ?, ?, ?)',
        [name, type, config, subscription_id, source],
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
      
      db.all('SELECT * FROM nodes WHERE is_active = 1', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static findActive() {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      
      db.all(
        'SELECT * FROM nodes WHERE is_active = 1 AND latency IS NOT NULL ORDER BY latency ASC',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  static findTopPerforming(limit = 10) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      
      db.all(
        'SELECT * FROM nodes WHERE is_active = 1 AND latency IS NOT NULL ORDER BY latency ASC LIMIT ?',
        [limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  static updateLatency(id, latency) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      
      db.run(
        'UPDATE nodes SET latency = ?, last_tested = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [latency, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, latency, changes: this.changes });
          }
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      
      db.run('UPDATE nodes SET is_active = 0 WHERE id = ?', [id], function(err) {
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
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN latency IS NOT NULL THEN 1 END) as tested,
          COUNT(CASE WHEN latency IS NOT NULL AND latency < 100 THEN 1 END) as fast,
          AVG(latency) as avg_latency
        FROM nodes WHERE is_active = 1`,
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

  static findBySubscription(subscriptionId) {
    return new Promise((resolve, reject) => {
      const db = database.getDB();
      
      db.all(
        'SELECT * FROM nodes WHERE subscription_id = ? AND is_active = 1',
        [subscriptionId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }
}

module.exports = Node;