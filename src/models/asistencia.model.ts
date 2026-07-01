/**
 * @file asistencia.model.ts
 * @description Modelo de Datos encargado de las operaciones de base de datos directas (consultas, inserciones, actualizaciones y lógica relacional) sobre la entidad ASISTENCIA en Extintores GS.
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

export class AsistenciaModel {
  static async registrar(empleadoId: number, fecha: string, horaEntrada: string | null, horaSalida: string | null, estado: string, observaciones: string | null) {
    return pool.query(
      'INSERT INTO Asistencia (id_empleado, fecha, hora_entrada, hora_salida, estado_asistencia, observacion_justificacion) VALUES (?, ?, ?, ?, ?, ?)',
      [empleadoId, fecha, horaEntrada, horaSalida, estado, observaciones]
    );
  }

  static async buscar(nombreCompleto: string, fechaInicio: string, fechaFin: string) {
    let query = `
      SELECT 
        a.id_asistencia as id,
        DATE_FORMAT(a.fecha, '%Y-%m-%d') as fecha,
        e.dni,
        CONCAT(e.nombres, ' ', e.apellidos) as empleado,
        ar.nombre_area as cargo,
        IFNULL(TIME_FORMAT(a.hora_entrada, '%H:%i'), '-') as hora_entrada,
        IFNULL(TIME_FORMAT(a.hora_salida, '%H:%i'), '-') as hora_salida,
        a.estado_asistencia as estado,
        IFNULL(a.observacion_justificacion, '-') as observaciones
      FROM Asistencia a
      JOIN Empleado e ON a.id_empleado = e.id_empleado
      LEFT JOIN Area ar ON e.id_area = ar.id_area
      WHERE CONCAT(e.nombres, ' ', e.apellidos) LIKE ?
    `;
    const queryParams: any[] = [`%${nombreCompleto}%`];

    if (fechaInicio) {
      query += ' AND a.fecha >= ?';
      queryParams.push(fechaInicio);
    }
    if (fechaFin) {
      query += ' AND a.fecha <= ?';
      queryParams.push(fechaFin);
    }
    query += ' ORDER BY a.fecha DESC, a.hora_entrada DESC';

    const [rows]: any = await pool.query(query, queryParams);
    return rows;
  }
  
  static async eliminarPorEmpleado(empleadoId: number) {
    return pool.query('DELETE FROM Asistencia WHERE id_empleado = ?', [empleadoId]);
  }

  static async verificarEntradaHoy(empleadoId: number) {
    const [rows]: any = await pool.query(
      "SELECT id_asistencia FROM Asistencia WHERE id_empleado = ? AND fecha = CURDATE()",
      [empleadoId]
    );
    return rows.length > 0;
  }

  static async registrarEntrada(empleadoId: number) {
    return pool.query(
      "INSERT INTO Asistencia (id_empleado, fecha, hora_entrada, estado_asistencia) VALUES (?, CURDATE(), CURTIME(), 'Presente')",
      [empleadoId]
    );
  }

  static async registrarSalida(empleadoId: number) {
    return pool.query(
      "UPDATE Asistencia SET hora_salida = CURTIME() WHERE id_empleado = ? AND fecha = CURDATE() AND hora_salida IS NULL",
      [empleadoId]
    );
  }
}