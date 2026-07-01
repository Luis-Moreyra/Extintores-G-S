/**
 * @file dashboard.model.ts
 * @description Modelo de Datos encargado de las operaciones de base de datos directas (consultas, inserciones, actualizaciones y lógica relacional) sobre la entidad DASHBOARD en Extintores GS.
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

// EL MODELO: Se encarga única y exclusivamente de la conexión a base de datos y consultas SQL.
export class DashboardModel {
  static async getEmployeeCount(): Promise<number> {
    const [rows]: [any[], any] = await pool.query("SELECT COUNT(*) as count FROM Empleado");
    return rows[0].count;
  }

  static async getPresentCountToday(): Promise<number> {
    const [rows]: [any[], any] = await pool.query("SELECT COUNT(*) as count FROM Asistencia WHERE fecha = CURDATE() AND estado_asistencia = 'Presente'");
    return rows[0].count;
  }

  static async getEvaluationCountThisMonth(): Promise<number> {
    const [rows]: [any[], any] = await pool.query("SELECT COUNT(*) as count FROM Evaluacion WHERE tipo_evaluacion = 'Desempeño' AND MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())");
    return rows[0].count;
  }

  static async getActivePostingCount(): Promise<number> {
    const [rows]: [any[], any] = await pool.query("SELECT COUNT(*) as count FROM Convocatoria WHERE requisitos LIKE '%\"tipo\":\"Convocatoria\"%'");
    return rows[0].count;
  }
}