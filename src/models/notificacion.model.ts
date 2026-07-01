/**
 * @file notificacion.model.ts
 * @description Modelo de Datos encargado de las operaciones de base de datos directas (consultas, inserciones, actualizaciones y lógica relacional) sobre la entidad NOTIFICACION en Extintores GS.
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

export class NotificacionModel {
  /**
   * Obtiene los datos necesarios para enviar la notificación (Correo y último puntaje).
   */
  static async obtenerDatosParaNotificar(idEmpleado: number) {
    const [rows]: any = await pool.query(
      `SELECT 
        e.id_empleado, e.nombres, e.apellidos, e.correo, e.dni,
        ev.id_evaluacion, ev.puntaje, ev.fecha, ev.observaciones,
        a.nombre_area as cargo
       FROM Empleado e
       JOIN Evaluacion ev ON e.id_empleado = ev.id_empleado
       JOIN Area a ON e.id_area = a.id_area
       WHERE e.id_empleado = ? AND ev.tipo_evaluacion = 'Desempeño'
       ORDER BY ev.fecha DESC LIMIT 1`,
      [idEmpleado]
    );
    return rows[0];
  }

  /**
   * Registra el rastro de la notificación en el JSON de la evaluación.
   */
  static async registrarNotificacionEnviada(idEvaluacion: number, medio: string) {
    return pool.query(
      `UPDATE Evaluacion 
       SET observaciones = JSON_SET(IFNULL(observaciones, '{}'), '$.notificado', true, '$.fecha_notificacion', NOW(), '$.medio_notificacion', ?) 
       WHERE id_evaluacion = ?`,
      [medio, idEvaluacion]
    );
  }

  /**
   * Métricas de notificaciones para el panel inferior.
   */
  static async obtenerMetricasEnvio() {
    const [rows]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN JSON_EXTRACT(observaciones, '$.notificado') = true THEN 1 ELSE 0 END) as notificados,
        SUM(CASE WHEN puntaje >= 4.0 AND JSON_EXTRACT(observaciones, '$.notificado') = true THEN 1 ELSE 0 END) as destacados
      FROM Evaluacion 
      WHERE tipo_evaluacion = 'Desempeño'
    `);
    return rows[0];
  }
}