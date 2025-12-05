// server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Crear usuario
app.post('/api/users', (req, res) => {
  const { nombre, dni, telefono, ticket } = req.body;

  if (!nombre || !ticket) {
    return res.status(400).json({ error: 'nombre y ticket son obligatorios' });
  }

  const sql = `
    INSERT INTO usuarios (nombre, dni, telefono, ticket)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [nombre, dni || '', telefono || '', ticket], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      id: this.lastID,
      nombre,
      dni: dni || '',
      telefono: telefono || '',
      ticket
    });
  });
});

// Listar usuarios
app.get('/api/users', (req, res) => {
  const sql = `SELECT * FROM usuarios ORDER BY fecha_registro DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`API Intranet BBVA escuchando en http://localhost:${PORT}`);
});
