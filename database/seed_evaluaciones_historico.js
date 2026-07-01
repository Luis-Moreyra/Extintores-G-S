const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 1. Cargar archivo .env
const envPath = path.join(__dirname, '..', '.env');
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
  console.log('Conectando a la base de datos...');
  const connection = await mysql.createConnection({
    host: config.DB_HOST || 'localhost',
    user: config.DB_USER || 'root',
    password: config.DB_PASSWORD || 'root',
    database: config.DB_NAME || 'Sistema_RRHH_ExtintoresGS',
    port: parseInt(config.DB_PORT || '3306')
  });

  console.log('Limpiando evaluaciones anteriores (tipo_evaluacion = Desempeño)...');
  await connection.query("DELETE FROM Evaluacion WHERE tipo_evaluacion = 'Desempeño'");

  console.log('Insertando evaluaciones históricas de hace un año (Julio 2025 - Mayo 2026)...');

  const criteriosNormales = { calidad: 4, equipo: 4, responsabilidad: 5, iniciativa: 4, adaptabilidad: 4 };
  const comentariosNormales = { fortalezas: 'Gran responsabilidad.', mejora: 'Aportar más ideas.', general: 'Buen desempeño general.' };

  // 12 meses históricos de evaluaciones (Julio 2025 a Mayo 2026)
  const historico = [
    // Julio 2025
    { id_empleado: 1, puntaje: 3.80, fecha: '2025-07-15 10:00:00', obs: { periodo: '2025-I', estado: 'Archivado', notas_criterios: criteriosNormales } },
    { id_empleado: 2, puntaje: 4.10, fecha: '2025-07-15 11:30:00', obs: { periodo: '2025-I', estado: 'Archivado', notas_criterios: criteriosNormales } },
    { id_empleado: 3, puntaje: 4.50, fecha: '2025-07-16 09:00:00', obs: { periodo: '2025-I', estado: 'Archivado', notas_criterios: criteriosNormales } },
    // Agosto 2025
    { id_empleado: 4, puntaje: 3.90, fecha: '2025-08-15 10:00:00', obs: { periodo: '2025-II', estado: 'Archivado', notas_criterios: criteriosNormales } },
    { id_empleado: 5, puntaje: 4.20, fecha: '2025-08-15 11:30:00', obs: { periodo: '2025-II', estado: 'Archivado', notas_criterios: criteriosNormales } },
    // Septiembre 2025
    { id_empleado: 6, puntaje: 4.00, fecha: '2025-09-15 10:00:00', obs: { periodo: '2025-II', estado: 'Archivado', notas_criterios: criteriosNormales } },
    { id_empleado: 7, puntaje: 4.30, fecha: '2025-09-15 11:30:00', obs: { periodo: '2025-II', estado: 'Archivado', notas_criterios: criteriosNormales } },
    // Octubre 2025
    { id_empleado: 8, puntaje: 4.10, fecha: '2025-10-15 10:00:00', obs: { periodo: '2025-II', estado: 'Archivado', notas_criterios: criteriosNormales } },
    { id_empleado: 9, puntaje: 4.40, fecha: '2025-10-15 11:30:00', obs: { periodo: '2025-II', estado: 'Archivado', notas_criterios: criteriosNormales } },
    // Noviembre 2025
    { id_empleado: 10, puntaje: 3.70, fecha: '2025-11-15 10:00:00', obs: { periodo: '2025-II', estado: 'Archivado', notas_criterios: criteriosNormales } },
    { id_empleado: 1, puntaje: 4.20, fecha: '2025-11-15 11:30:00', obs: { periodo: '2025-II', estado: 'Archivado', notas_criterios: criteriosNormales } },
    // Diciembre 2025
    { id_empleado: 2, puntaje: 4.00, fecha: '2025-12-15 10:00:00', obs: { periodo: '2025-II', estado: 'Archivado', notas_criterios: criteriosNormales } },
    { id_empleado: 3, puntaje: 4.60, fecha: '2025-12-15 11:30:00', obs: { periodo: '2025-II', estado: 'Archivado', notas_criterios: criteriosNormales } },
    // Enero 2026
    { id_empleado: 4, puntaje: 4.30, fecha: '2026-01-15 10:00:00', obs: { periodo: '2026-I', estado: 'Archivado', notas_criterios: criteriosNormales } },
    { id_empleado: 5, puntaje: 3.60, fecha: '2026-01-15 11:30:00', obs: { periodo: '2026-I', estado: 'Archivado', notas_criterios: criteriosNormales } },
    // Febrero 2026
    { id_empleado: 6, puntaje: 4.50, fecha: '2026-02-15 10:00:00', obs: { periodo: '2026-I', estado: 'Archivado', notas_criterios: criteriosNormales } },
    { id_empleado: 7, puntaje: 4.10, fecha: '2026-02-15 11:30:00', obs: { periodo: '2026-I', estado: 'Archivado', notas_criterios: criteriosNormales } },
    // Marzo 2026
    { id_empleado: 8, puntaje: 4.20, fecha: '2026-03-15 10:00:00', obs: { periodo: '2026-I', estado: 'Archivado', notas_criterios: criteriosNormales } },
    { id_empleado: 9, puntaje: 4.60, fecha: '2026-03-15 11:30:00', obs: { periodo: '2026-I', estado: 'Archivado', notas_criterios: criteriosNormales } },
    // Abril 2026
    { id_empleado: 10, puntaje: 3.90, fecha: '2026-04-15 10:00:00', obs: { periodo: '2026-I', estado: 'Archivado', notas_criterios: criteriosNormales } },
    { id_empleado: 1, puntaje: 4.40, fecha: '2026-04-15 11:30:00', obs: { periodo: '2026-I', estado: 'Archivado', notas_criterios: criteriosNormales } },
    // Mayo 2026
    { id_empleado: 2, puntaje: 4.10, fecha: '2026-05-15 10:00:00', obs: { periodo: '2026-I', estado: 'Archivado', notas_criterios: criteriosNormales } },
    { id_empleado: 3, puntaje: 4.70, fecha: '2026-05-15 11:30:00', obs: { periodo: '2026-I', estado: 'Archivado', notas_criterios: criteriosNormales } }
  ];

  for (const ev of historico) {
    await connection.query(
      `INSERT INTO Evaluacion (tipo_evaluacion, fecha, puntaje, observaciones, id_empleado)
       VALUES ('Desempeño', ?, ?, ?, ?)`,
      [ev.fecha, ev.puntaje, JSON.stringify(ev.obs), ev.id_empleado]
    );
  }

  console.log('Insertando las 22 evaluaciones del periodo actual (Junio-Julio 2026)...');

  // Distribución del periodo actual deseada por el usuario:
  // - Total: 22
  // - Pendiente: 11
  // - Emitido: 6
  // - Firmado: 2
  // - En Revisión: 1
  // - Archivado: 2
  const distribucionActual = [
    // 11 PENDIENTES
    { id_empleado: 1, puntaje: 4.20, fecha: '2026-06-25 10:00:00', obs: { periodo: '2026-I', id_evaluador: 5, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Pendiente' } },
    { id_empleado: 2, puntaje: 3.80, fecha: '2026-06-25 11:30:00', obs: { periodo: '2026-I', id_evaluador: 5, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Pendiente' } },
    { id_empleado: 3, puntaje: 4.80, fecha: '2026-06-26 09:00:00', obs: { periodo: '2026-I', id_evaluador: 5, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Pendiente' } },
    { id_empleado: 4, puntaje: 4.40, fecha: '2026-06-26 14:00:00', obs: { periodo: '2026-I', id_evaluador: 3, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Pendiente' } },
    { id_empleado: 5, puntaje: 3.20, fecha: '2026-06-27 10:00:00', obs: { periodo: '2026-I', id_evaluador: 3, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Pendiente' } },
    { id_empleado: 6, puntaje: 4.60, fecha: '2026-06-27 11:30:00', obs: { periodo: '2026-I', id_evaluador: 4, notas_criterios: { calidad: 5, equipo: 4, responsabilidad: 5, iniciativa: 4, adaptabilidad: 5 }, comentarios_detalle: comentariosNormales, estado: 'Pendiente' } },
    { id_empleado: 7, puntaje: 4.00, fecha: '2026-06-28 09:00:00', obs: { periodo: '2026-I', id_evaluador: 4, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Pendiente' } },
    { id_empleado: 8, puntaje: 3.40, fecha: '2026-06-28 14:00:00', obs: { periodo: '2026-I', id_evaluador: 9, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Pendiente' } },
    { id_empleado: 9, puntaje: 4.50, fecha: '2026-06-29 10:00:00', obs: { periodo: '2026-I', id_evaluador: 3, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Pendiente' } },
    { id_empleado: 10, puntaje: 4.10, fecha: '2026-06-29 11:30:00', obs: { periodo: '2026-I', id_evaluador: 3, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Pendiente' } },
    { id_empleado: 1, puntaje: 4.50, fecha: '2026-07-01 08:00:00', obs: { periodo: '2026-II', id_evaluador: 5, notas_criterios: { calidad: 5, equipo: 4, responsabilidad: 5, iniciativa: 4, adaptabilidad: 4 }, comentarios_detalle: comentariosNormales, estado: 'Pendiente' } },

    // 6 EMITIDOS
    { id_empleado: 2, puntaje: 4.00, fecha: '2026-07-01 08:30:00', obs: { periodo: '2026-II', id_evaluador: 5, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Emitido' } },
    { id_empleado: 3, puntaje: 4.60, fecha: '2026-07-01 09:00:00', obs: { periodo: '2026-II', id_evaluador: 5, notas_criterios: { calidad: 4, equipo: 5, responsabilidad: 4, iniciativa: 5, adaptabilidad: 5 }, comentarios_detalle: comentariosNormales, estado: 'Emitido' } },
    { id_empleado: 4, puntaje: 4.20, fecha: '2026-07-01 09:15:00', obs: { periodo: '2026-II', id_evaluador: 3, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Emitido' } },
    { id_empleado: 5, puntaje: 3.50, fecha: '2026-07-01 09:30:00', obs: { periodo: '2026-II', id_evaluador: 3, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Emitido' } },
    { id_empleado: 6, puntaje: 4.80, fecha: '2026-07-01 09:45:00', obs: { periodo: '2026-II', id_evaluador: 4, notas_criterios: { calidad: 5, equipo: 5, responsabilidad: 5, iniciativa: 4, adaptabilidad: 5 }, comentarios_detalle: comentariosNormales, estado: 'Emitido' } },
    { id_empleado: 7, puntaje: 4.10, fecha: '2026-07-01 10:00:00', obs: { periodo: '2026-II', id_evaluador: 4, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Emitido' } },

    // 2 FIRMADOS
    { id_empleado: 8, puntaje: 3.90, fecha: '2026-07-01 10:15:00', obs: { periodo: '2026-II', id_evaluador: 9, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Firmado' } },
    { id_empleado: 9, puntaje: 4.30, fecha: '2026-07-01 10:30:00', obs: { periodo: '2026-II', id_evaluador: 3, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Firmado' } },

    // 1 EN REVISIÓN
    { id_empleado: 10, puntaje: 3.60, fecha: '2026-07-01 10:45:00', obs: { periodo: '2026-II', id_evaluador: 3, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'En Revisión' } },

    // 2 ARCHIVADOS
    { id_empleado: 1, puntaje: 4.20, fecha: '2026-06-28 11:00:00', obs: { periodo: '2026-I', id_evaluador: 5, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Archivado' } },
    { id_empleado: 2, puntaje: 3.90, fecha: '2026-06-29 11:00:00', obs: { periodo: '2026-I', id_evaluador: 5, notas_criterios: criteriosNormales, comentarios_detalle: comentariosNormales, estado: 'Archivado' } }
  ];

  for (const ev of distribucionActual) {
    await connection.query(
      `INSERT INTO Evaluacion (tipo_evaluacion, fecha, puntaje, observaciones, id_empleado)
       VALUES ('Desempeño', ?, ?, ?, ?)`,
      [ev.fecha, ev.puntaje, JSON.stringify(ev.obs), ev.id_empleado]
    );
  }

  // Sincronizar contratos
  console.log('Sincronizando contratos para empleados archivados...');
  await connection.query(
    `INSERT INTO Contrato (id_empleado, fecha_inicio, documento_pdf)
     VALUES (1, '2023-01-15', '/docs/contratos/1_contrato.pdf'),
            (2, '2023-02-01', '/docs/contratos/2_contrato.pdf')
     ON DUPLICATE KEY UPDATE documento_pdf = VALUES(documento_pdf)`
  );

  console.log('¡Base de datos sembrada exitosamente con datos del periodo y datos históricos de hace un año!');
  await connection.end();
}

main().catch(err => {
  console.error('Error al correr el seed:', err);
});
