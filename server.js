// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔗 Pool de conexiones a Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // necesario en muchos PaaS (Render, etc.)
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Crear tabla si no existe
async function initDB() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      dni TEXT,
      telefono TEXT,
      ticket TEXT NOT NULL,
      fecha_registro TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await pool.query(createTableQuery);
  console.log('Tabla "usuarios" verificada/creada correctamente.');
}

// Ruta simple para ver que el backend está vivo
app.get('/', (req, res) => {
  res.send('API Intranet BBVA con Postgres está viva ✅');
});

// Crear usuario
app.post('/api/users', async (req, res) => {
  try {
    const { nombre, dni, telefono, ticket } = req.body;

    if (!nombre || !ticket) {
      return res
        .status(400)
        .json({ error: 'nombre y ticket son obligatorios' });
    }

    const insertQuery = `
      INSERT INTO usuarios (nombre, dni, telefono, ticket)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, dni, telefono, ticket, fecha_registro;
    `;

    const values = [nombre, dni || null, telefono || null, ticket];

    const result = await pool.query(insertQuery, values);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en POST /api/users:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Listar usuarios
app.get('/api/users', async (req, res) => {
  try {
    const selectQuery = `
      SELECT id, nombre, dni, telefono, ticket, fecha_registro
      FROM usuarios
      ORDER BY fecha_registro DESC;
    `;

    const result = await pool.query(selectQuery);

    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/users:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// 🔥 Vaciar todos los usuarios
app.delete('/api/users', async (req, res) => {
  try {
    // OJO: esto borra TODOS los registros de la tabla "usuarios"
    const truncateQuery = `
      TRUNCATE TABLE usuarios RESTART IDENTITY;
    `;
    await pool.query(truncateQuery);

    res.json({ message: 'Tabla "usuarios" vaciada correctamente' });
  } catch (err) {
    console.error('Error en DELETE /api/users:', err);
    res.status(500).json({ error: 'Error al vaciar usuarios' });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  try {
    await initDB();
    console.log(`API Intranet BBVA escuchando en puerto ${PORT}`);
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
  }
});
