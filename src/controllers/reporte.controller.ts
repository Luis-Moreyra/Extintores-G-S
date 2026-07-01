/**
 * @file reporte.controller.ts
 * @description Controlador de Capa de Presentación (Server Actions) encargado de mediar entre las vistas del cliente y los modelos de datos de REPORTE.
 * @module ExtintoresGS/controllers
 * @copyright Extintores GS S.A.C. Todos los derechos reservados.
 * 
 * ============================================================================
 * SECCIÓN GENERAL DE DOCUMENTACIÓN Y RESUMEN DE FUNCIONES:
 * - Provee control reactivo y encapsulación de lógica.
 * - Asegura la consistencia en el tipado y llamado de las consultas SQL/Actions.
 * ============================================================================
 */

'use server';

import { ReporteEvaluacionModel } from '@/models/reporte.model';

export async function obtenerMetricasReporteAction(filtros: { 
  periodo: string; 
  idArea: number;
  idAreaComparar?: number;
  idEmpleado?: number;
  idEmpleadoComparar?: number;
}) {
  try {
    const metricas = await ReporteEvaluacionModel.obtenerMetricasGenerales(filtros);
    return { success: true, data: metricas };
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    return { success: false, message: 'Error al calcular métricas' };
  }
}

export async function obtenerDatosDetalladosAction(filtros: { 
  periodo: string; 
  idArea: number; 
  idEmpleado?: number;
  idAreaComparar?: number;
  idEmpleadoComparar?: number;
}) {
  try {
    const datos = await ReporteEvaluacionModel.obtenerDatosInforme({
      idArea: filtros.idArea,
      idEmpleado: filtros.idEmpleado,
      periodo: filtros.periodo,
      idAreaComparar: filtros.idAreaComparar,
      idEmpleadoComparar: filtros.idEmpleadoComparar
    });
    return { success: true, data: datos };
  } catch (error) {
    return { success: false, message: 'Error al extraer datos del informe', data: [] };
  }
}

export async function obtenerFechaMinimaAction() {
  try {
    const res = await ReporteEvaluacionModel.obtenerFechaMinima();
    return { success: true, data: res };
  } catch (e) {
    return { success: false, data: '2025-01-01' };
  }
}