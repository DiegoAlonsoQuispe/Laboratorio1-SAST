const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// CORRECCIÓN #1: Migración de MD5 a SHA-256 para hashing seguro
function hashPassword(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Datos de prueba
const users = [
  { id: 1, username: 'admin', passwordHash: hashPassword('admin123') },
  { id: 2, username: 'user1', passwordHash: hashPassword('password123') }
];

// Endpoint de Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const passwordHash = hashPassword(password);
  
  const user = users.find(u => u.username === username && u.passwordHash === passwordHash);
  
  if (!user) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  // CORRECCIÓN #2: Endurecimiento de la Cookie de sesión con banderas de seguridad
  const sessionToken = crypto.randomUUID();
  res.cookie('auth_token', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });

  res.json({ message: 'Autenticación exitosa', userId: user.id });
});

// CORRECCIÓN #3: Manejo seguro de errores sin revelar stack traces
app.get('/api/debug-error', (req, res) => {
  try {
    throw new Error('Error crítico en el servidor de base de datos');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ocurrió un error interno. Intente de nuevo más tarde.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
