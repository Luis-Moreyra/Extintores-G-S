/**
 * @file reporte.model.ts
 * @description Modelo de Datos encargado de las operaciones de base de datos directas (consultas, inserciones, actualizaciones y lógica relacional) sobre la entidad REPORTE en Extintores GS.
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

export class ReporteEvaluacionModel {
  /**
   * Obtiene métricas agregadas para las tarjetas del panel de informes.
   */
  static async obtenerMetricasGenerales(filtros: { 
    periodo?: string; 
    idArea?: number;
    idAreaComparar?: number;
    idEmpleado?: number;
    idEmpleadoComparar?: number;
  }) {
    let query = `
      SELECT 
        COUNT(*) as totalEvaluaciones,
        AVG(puntaje) as promedioGeneral,
        SUM(CASE WHEN puntaje >= 4.5 THEN 1 ELSE 0 END) as desempeñoExcelente,
        (SUM(CASE WHEN puntaje >= 3.0 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as indiceSatisfaccion
      FROM Evaluacion 
      WHERE tipo_evaluacion = 'Desempeño'
    `;
    const params: any[] = [];

    if (filtros.idEmpleado && filtros.idEmpleado !== 0) {
      if (filtros.idEmpleadoComparar && filtros.idEmpleadoComparar !== 0) {
        query += ` AND id_empleado IN (?, ?)`;
        params.push(filtros.idEmpleado, filtros.idEmpleadoComparar);
      } else {
        query += ` AND id_empleado = ?`;
        params.push(filtros.idEmpleado);
      }
    } else if (filtros.idArea && filtros.idArea !== 0) {
      if (filtros.idAreaComparar && filtros.idAreaComparar !== 0) {
        query += ` AND id_empleado IN (SELECT id_empleado FROM Empleado WHERE id_area IN (?, ?))`;
        params.push(filtros.idArea, filtros.idAreaComparar);
      } else {
        query += ` AND id_empleado IN (SELECT id_empleado FROM Empleado WHERE id_area = ?)`;
        params.push(filtros.idArea);
      }
    }

    if (filtros.periodo) {
      query += ` AND JSON_UNQUOTE(JSON_EXTRACT(observaciones, '$.periodo')) = ?`;
      params.push(filtros.periodo);
    }

    const [rows]: any = await pool.query(query, params);
    return rows[0];
  }

  /**
   * Extrae la lista de evaluaciones con cruce de tablas para el informe.
   */
  static async obtenerDatosInforme(filtros: { 
    idArea?: number; 
    idEmpleado?: number; 
    periodo?: string;
    idAreaComparar?: number;
    idEmpleadoComparar?: number;
  }) {
    let query = `
      SELECT 
        e.id_evaluacion,
        e.fecha,
        e.puntaje,
        e.observaciones,
        emp.nombres,
        emp.apellidos,
        emp.dni,
        a.nombre_area as cargo
      FROM Evaluacion e
      JOIN Empleado emp ON e.id_empleado = emp.id_empleado
      JOIN Area a ON emp.id_area = a.id_area
      WHERE e.tipo_evaluacion = 'Desempeño'
    `;

    const params: any[] = [];
    if (filtros.idEmpleado && filtros.idEmpleado !== 0) {
      if (filtros.idEmpleadoComparar && filtros.idEmpleadoComparar !== 0) {
        query += ` AND emp.id_empleado IN (?, ?)`;
        params.push(filtros.idEmpleado, filtros.idEmpleadoComparar);
      } else {
        query += ` AND emp.id_empleado = ?`;
        params.push(filtros.idEmpleado);
      }
    } else if (filtros.idArea && filtros.idArea !== 0) {
      if (filtros.idAreaComparar && filtros.idAreaComparar !== 0) {
        query += ` AND emp.id_area IN (?, ?)`;
        params.push(filtros.idArea, filtros.idAreaComparar);
      } else {
        query += ` AND emp.id_area = ?`;
        params.push(filtros.idArea);
      }
    }

    if (filtros.periodo) {
      query += ` AND JSON_UNQUOTE(JSON_EXTRACT(e.observaciones, '$.periodo')) = ?`;
      params.push(filtros.periodo);
    }

    query += ` ORDER BY e.fecha DESC`;

    const [rows]: any = await pool.query(query, params);
    return rows;
  }

  static async obtenerFechaMinima() {
    try {
      const [rows]: any = await pool.query(
        `SELECT MIN(fecha) as minDate FROM Evaluacion WHERE tipo_evaluacion = 'Desempeño'`
      );
      if (rows[0] && rows[0].minDate) {
        const d = new Date(rows[0].minDate);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split('T')[0];
        }
      }
      return '2025-01-01';
    } catch (e) {
      return '2025-01-01';
    }
  }
}