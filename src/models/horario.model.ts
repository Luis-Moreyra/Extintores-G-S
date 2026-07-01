/**
 * @file horario.model.ts
 * @description Modelo de Datos encargado de las operaciones de base de datos directas (consultas, inserciones, actualizaciones y lógica relacional) sobre la entidad HORARIO en Extintores GS.
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

export class HorarioModel {
  static async obtenerTodos() {
    const [rows]: any = await pool.query(
      "SELECT id_horario, nombre_turno, TIME_FORMAT(hora_entrada_oficial, '%H:%i') as hora_entrada, TIME_FORMAT(hora_salida_oficial, '%H:%i') as hora_salida FROM Horario ORDER BY id_horario ASC"
    );
    return rows;
  }

  static async registrar(nombre_turno: string, hora_entrada: string, hora_salida: string) {
    return pool.query('INSERT INTO Horario (nombre_turno, hora_entrada_oficial, hora_salida_oficial) VALUES (?, ?, ?)', [nombre_turno, hora_entrada, hora_salida]);
  }

  static async eliminar(id_horario: number) {
    return pool.query('DELETE FROM Horario WHERE id_horario = ?', [id_horario]);
  }
}