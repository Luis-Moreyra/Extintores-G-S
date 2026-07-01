/**
 * @file evaluacion.model.ts
 * @description Modelo de Datos encargado de las operaciones de base de datos directas (consultas, inserciones, actualizaciones y lógica relacional) sobre la entidad EVALUACION en Extintores GS.
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

export class EvaluacionDesempeñoModel {
  /**
   * Registra una evaluación de desempeño vinculada a un empleado.
   * Mapea los campos según esquema_inicial.sql
   */
  static async crear(datos: {
    id_empleado: number;
    puntaje: number;
    observaciones: string; // Aquí guardamos el JSON de criterios y comentarios
  }) {
    return pool.query(
      `INSERT INTO Evaluacion (tipo_evaluacion, fecha, puntaje, observaciones, id_empleado) 
       VALUES ('Desempeño', NOW(), ?, ?, ?)`,
      [datos.puntaje, datos.observaciones, datos.id_empleado]
    );
  }
}