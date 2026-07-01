/**
 * @file area.model.ts
 * @description Modelo de Datos encargado de las operaciones de base de datos directas (consultas, inserciones, actualizaciones y lógica relacional) sobre la entidad AREA en Extintores GS.
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

export class AreaModel {
  static async obtenerTodas() {
    const [rows]: any = await pool.query("SELECT id_area, nombre_area FROM Area ORDER BY nombre_area ASC");
    return rows;
  }

  static async obtenerIdPorNombre(nombre: string) {
    const [rows]: any = await pool.query('SELECT id_area FROM Area WHERE nombre_area = ?', [nombre]);
    return rows.length > 0 ? rows[0].id_area : null;
  }
}