const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 1. Cargar archivo .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const config = {};
envContent.split(/\r?\n/).forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    config[key] = val;
  }
});

async function main() {
  const connection = await mysql.createConnection({
    host: config.DB_HOST || 'localhost',
    user: config.DB_USER || 'root',
    password: config.DB_PASSWORD || 'root',
    database: config.DB_NAME || 'Sistema_RRHH_ExtintoresGS',
    port: parseInt(config.DB_PORT || '3306')
  });

  const [tables] = await connection.query('SHOW TABLES');
  console.log('Tablas:', tables);

  const [postulantes] = await connection.query('SELECT * FROM Postulante');
  console.log('Total Postulantes:', postulantes.length);
  if (postulantes.length > 0) {
    console.log('Ejemplo Postulante:', postulantes[0]);
  }

  const [convocatorias] = await connection.query('SELECT * FROM Convocatoria');
  console.log('Total Convocatorias:', convocatorias.length);
  if (convocatorias.length > 0) {
    console.log('Ejemplo Convocatoria:', convocatorias[0]);
  }

  await connection.end();
}

main().catch(err => console.error(err));
