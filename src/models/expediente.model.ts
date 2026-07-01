/**
 * @file expediente.model.ts
 * @description Modelo de Datos encargado de las operaciones de base de datos directas (consultas, inserciones, actualizaciones y lógica relacional) sobre la entidad EXPEDIENTE en Extintores GS.
 * @module ExtintoresGS/models
 * @copyright Extintores GS S.A.C. Todos los derechos reservados.
 * 
 * ============================================================================
 * SECCIÓN GENERAL DE DOCUMENTACIÓN Y RESUMEN DE FUNCIONES:
 * - Provee control reactivo y encapsulación de lógica.
 * - Asegura la consistencia en el tipado y llamado de las consultas SQL/Actions.
 * ============================================================================
 */

import pool from '@/lib/db';

export class ExpedienteModel {
  /**
   * Registra un nuevo documento en el expediente del empleado (Tabla Contrato).
   */
  static async archivarDocumento(datos: {
    id_empleado: number;
    fecha: string;
    ruta_pdf: string;
  }) {
    // Intentamos actualizar si ya existe o insertar si es nuevo (según lógica de Contrato 1:1)
    return pool.query(
      `INSERT INTO Contrato (id_empleado, fecha_inicio, documento_pdf) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE fecha_inicio = VALUES(fecha_inicio), documento_pdf = VALUES(documento_pdf)`,
      [datos.id_empleado, datos.fecha, datos.ruta_pdf]
    );
  }

  /**
   * Obtiene métricas del expediente para las tarjetas inferiores.
   */
  static async obtenerMetricasExpediente() {
    const [rows]: any = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM Contrato) as totalDocumentos,
        (SELECT COUNT(*) FROM Evaluacion WHERE tipo_evaluacion = 'Desempeño') as totalEvaluaciones,
        (SELECT COUNT(*) FROM Evaluacion WHERE tipo_evaluacion = 'Entrevista') as totalReportes,
        (SELECT COUNT(*) FROM Empleado) as totalPersonal
    `);
    return rows[0];
  }

  /**
   * Obtiene información extendida del empleado para el panel central.
   */
  static async obtenerDetalleEmpleado(id: number) {
    const [rows]: any = await pool.query(
      `SELECT 
        e.id_empleado, 
        e.nombres, 
        e.apellidos, 
        e.dni, 
        a.nombre_area as depto,
        'Activo' as estado,
        c.fecha_inicio,
        (
          SELECT COUNT(*) FROM Evaluacion ev 
          WHERE ev.id_empleado = e.id_empleado AND ev.tipo_evaluacion = 'Desempeño'
        ) + (
          CASE WHEN c.documento_pdf IS NOT NULL THEN 1 ELSE 0 END
        ) as total_documentos
       FROM Empleado e
       JOIN Area a ON e.id_area = a.id_area
       LEFT JOIN Contrato c ON e.id_empleado = c.id_empleado
       WHERE e.id_empleado = ?`,
      [id]
    );
    return rows[0];
  }

  /**
   * Actualiza el estado de la última evaluación del empleado a 'Archivado'.
   */
  static async archivarEvaluacionEmpleado(idEmpleado: number) {
    const [rows]: any = await pool.query(
      `SELECT id_evaluacion FROM Evaluacion 
       WHERE id_empleado = ? AND tipo_evaluacion = 'Desempeño' 
       ORDER BY fecha DESC LIMIT 1`,
      [idEmpleado]
    );
    if (rows.length > 0) {
      const idEval = rows[0].id_evaluacion;
      await pool.query(
        `UPDATE Evaluacion 
         SET observaciones = JSON_SET(IFNULL(observaciones, '{}'), '$.estado', 'Archivado') 
         WHERE id_evaluacion = ?`,
        [idEval]
      );
    }
  }
}