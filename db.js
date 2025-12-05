// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// El archivo de BD se llamará intranet.db en esta carpeta
const dbPath = path.join(__dirname, 'intranet.db');
const db = new sqlite3.Database(dbPath);

// Crear tabla usuarios si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      dni TEXT,
      telefono TEXT,
      ticket TEXT NOT NULL,
      fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
