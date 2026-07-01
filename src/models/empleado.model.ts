/**
 * @file empleado.model.ts
 * @description Modelo de Datos encargado de las operaciones de base de datos directas (consultas, inserciones, actualizaciones y lógica relacional) sobre la entidad EMPLEADO en Extintores GS.
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

export class EmpleadoModel {
  static async obtenerPorId(id: number) {
    const [rows]: any = await pool.query(
      "SELECT e.dni, e.nombres, e.apellidos, a.nombre_area as cargo, TIME_FORMAT(h.hora_entrada_oficial, '%H:%i') as hora_entrada_oficial, h.tolerancia_minutos FROM Empleado e LEFT JOIN Area a ON e.id_area = a.id_area LEFT JOIN Horario h ON e.id_horario = h.id_horario WHERE e.id_empleado = ?",
      [id]
    );
    return rows;
  }

  static async obtenerPorDni(dni: string) {
    const [rows]: any = await pool.query(
      "SELECT e.id_empleado, e.dni, e.nombres, e.apellidos, a.nombre_area as cargo, TIME_FORMAT(h.hora_entrada_oficial, '%H:%i') as hora_entrada_oficial, h.tolerancia_minutos FROM Empleado e LEFT JOIN Area a ON e.id_area = a.id_area LEFT JOIN Horario h ON e.id_horario = h.id_horario WHERE e.dni = ?",
      [dni]
    );
    return rows;
  }

  static async obtenerTodos() {
    const [rows]: any = await pool.query(
      'SELECT e.*, a.nombre_area as cargo, h.nombre_turno as horario_nombre FROM Empleado e LEFT JOIN Area a ON e.id_area = a.id_area LEFT JOIN Horario h ON e.id_horario = h.id_horario ORDER BY e.id_empleado DESC'
    );
    return rows;
  }

  static async registrar(dni: string, nombres: string, apellidos: string, id_area: number, horarioId: number) {
    return pool.query(
      'INSERT INTO Empleado (dni, nombres, apellidos, id_area, id_horario) VALUES (?, ?, ?, ?, ?)',
      [dni, nombres, apellidos, id_area, horarioId]
    );
  }

  static async actualizar(id_empleado: number, dni: string, nombres: string, apellidos: string, id_area: number, horarioId: number) {
    return pool.query(
      'UPDATE Empleado SET dni = ?, nombres = ?, apellidos = ?, id_area = ?, id_horario = ? WHERE id_empleado = ?',
      [dni, nombres, apellidos, id_area, horarioId, id_empleado]
    );
  }

  static async eliminarDependencias(id_empleado: number) {
    await pool.query('DELETE FROM Evaluacion WHERE id_empleado = ?', [id_empleado]);
    await pool.query('DELETE FROM Contrato WHERE id_empleado = ?', [id_empleado]);
  }

  static async eliminar(id_empleado: number) {
    return pool.query('DELETE FROM Empleado WHERE id_empleado = ?', [id_empleado]);
  }

  static async verificarExistenciaId(id: number) {
    const [rows]: any = await pool.query('SELECT id_empleado FROM Empleado WHERE id_empleado = ?', [id]);
    return rows.length > 0;
  }

  static async contarPorHorarioId(horarioId: number): Promise<number> {
    const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM Empleado WHERE id_horario = ?', [horarioId]);
    return rows[0].count;
  }
}