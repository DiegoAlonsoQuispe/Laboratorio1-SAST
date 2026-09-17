const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// VULNERABILIDAD #1: Hashing débil (MD5) para credenciales
function hashPassword(text) {
  return crypto.createHash('md5').update(text).digest('hex');
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

  // VULNERABILIDAD #2: Cookie de sesión sin banderas de seguridad (httpOnly/secure)
  res.cookie('auth_token', user.id, {
    httpOnly: false,
    secure: false
  });

  res.json({ message: 'Autenticación exitosa', userId: user.id });
});

// VULNERABILIDAD #3: Revelación de stack trace en errores
app.get('/api/debug-error', (req, res) => {
  try {
    throw new Error('Error crítico en el servidor de base de datos');
  } catch (err) {
    res.status(500).send(err.stack);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});