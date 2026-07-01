/**
 * @file empleado.ts
 * @description Definiciones de Tipos y Interfaces de TypeScript de soporte para el módulo de EMPLEADO.
 * @module ExtintoresGS/types
 * @copyright Extintores GS S.A.C. Todos los derechos reservados.
 * 
 * ============================================================================
 * SECCIÓN GENERAL DE DOCUMENTACIÓN Y RESUMEN DE FUNCIONES:
 * - Provee control reactivo y encapsulación de lógica.
 * - Asegura la consistencia en el tipado y llamado de las consultas SQL/Actions.
 * ============================================================================
 */

export interface Empleado {
  id_empleado: number;
  dni: string;
  nombres: string;
  apellidos: string;
  id_area?: number;
  id_horario?: number;
  // Campos opcionales que vienen de los JOIN (LEFT JOIN)
  correo?: string;
  cargo?: string;
  horario_nombre?: string;
  hora_entrada_oficial?: string;
}