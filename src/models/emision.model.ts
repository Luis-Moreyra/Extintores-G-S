/**
 * @file emision.model.ts
 * @description Modelo de Datos encargado de las operaciones de base de datos directas (consultas, inserciones, actualizaciones y lógica relacional) sobre la entidad EMISION en Extintores GS.
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

export class EmisionReporteModel {
  /**
   * Obtiene evaluaciones filtradas con su estado de emisión (desde el JSON de observaciones).
   */
  static async obtenerHistorialEmisiones(filtros: { id_empleado?: number }) {
    let query = `
      SELECT 
        ev.id_evaluacion,
        ev.id_empleado,
        ev.fecha,
        ev.puntaje,
        ev.observaciones,
        emp.nombres,
        emp.apellidos,
        emp.dni,
        ar.nombre_area as cargo
      FROM Evaluacion ev
      JOIN Empleado emp ON ev.id_empleado = emp.id_empleado
      JOIN Area ar ON emp.id_area = ar.id_area
      WHERE ev.tipo_evaluacion = 'Desempeño'
    `;

    const params: any[] = [];
    if (filtros.id_empleado) {
      query += ` AND ev.id_empleado = ?`;
      params.push(filtros.id_empleado);
    }

    query += ` ORDER BY ev.fecha DESC`;

    const [rows]: any = await pool.query(query, params);
    return rows;
  }

  /**
   * Actualiza el estado del flujo de emisión dentro del campo observaciones.
   */
  static async actualizarEstadoReporte(id: number, nuevoEstado: string) {
    return pool.query(
      `UPDATE Evaluacion 
       SET observaciones = JSON_SET(IFNULL(observaciones, '{}'), '$.estado', ?) 
       WHERE id_evaluacion = ?`,
      [nuevoEstado, id]
    );
  }

  /**
   * Calcula las métricas de la fila inferior basadas en los estados JSON.
   */
  static async obtenerResumenEmisiones() {
    const [rows]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(observaciones, '$.estado')) = 'Emitido' THEN 1 ELSE 0 END) as emitidos,
        SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(observaciones, '$.estado')) = 'Firmado' THEN 1 ELSE 0 END) as firmados,
        SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(observaciones, '$.estado')) = 'Archivado' THEN 1 ELSE 0 END) as archivados,
        SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(observaciones, '$.estado')) IS NULL 
                   OR JSON_UNQUOTE(JSON_EXTRACT(observaciones, '$.estado')) = 'Pendiente' 
                   OR JSON_UNQUOTE(JSON_EXTRACT(observaciones, '$.estado')) = 'En Revisión' THEN 1 ELSE 0 END) as pendientes
      FROM Evaluacion 
      WHERE tipo_evaluacion = 'Desempeño'
    `);
    
    const metrics = rows[0];
    const entregados = (metrics.emitidos || 0) + (metrics.firmados || 0) + (metrics.archivados || 0);
    const tasa = metrics.total > 0 ? (entregados / metrics.total) * 100 : 0;

    return {
      emitidos: (metrics.emitidos || 0) + (metrics.archivados || 0),
      entregados: entregados,
      pendientes: metrics.pendientes || 0,
      tasaEntrega: tasa.toFixed(0)
    };
  }
}