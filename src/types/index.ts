/**
 * @file index.ts
 * @description Definiciones de Tipos y Interfaces de TypeScript de soporte para el módulo de INDEX.
 * @module ExtintoresGS/types
 * @copyright Extintores GS S.A.C. Todos los derechos reservados.
 * 
 * ============================================================================
 * SECCIÓN GENERAL DE DOCUMENTACIÓN Y RESUMEN DE FUNCIONES:
 * - Provee control reactivo y encapsulación de lógica.
 * - Asegura la consistencia en el tipado y llamado de las consultas SQL/Actions.
 * ============================================================================
 */

// Usuarios y Roles
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'Trabajador' | 'Responsable RRHH' | 'Administrador' | 'Jefe de Área';
  fecha_creacion: Date;
}

// Asistencias (CU01, CU02)
export interface Asistencia {
  id: number;
  usuario_id: number;
  fecha: Date;
  hora_entrada: string | null; // Usamos string para representar TIME
  hora_salida: string | null;
  estado: 'presente' | 'ausente' | 'permiso';
}

// Evaluaciones (CU07, CU08)
export interface Evaluacion {
  id: number;
  evaluador_id: number;
  evaluado_id: number;
  puntaje: 1 | 2 | 3 | 4 | 5;
  comentarios: string | null;
  fecha: Date;
}

// Selección de Personal (CU13, CU14, CU15)
export interface Convocatoria {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'abierta' | 'cerrada';
  fecha_publicacion: Date;
}

// Nóminas (CU19, CU20, CU21)
export interface Nomina {
  id: number;
  usuario_id: number;
  mes: string;
  salario_base: number;
  horas_extras: number;
  descuentos: number;
  total_pagar: number;
  estado: 'borrador' | 'aprobado' | 'pagado';
}