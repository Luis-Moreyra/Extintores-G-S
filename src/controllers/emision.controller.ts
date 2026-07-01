/**
 * @file emision.controller.ts
 * @description Controlador de Capa de Presentación (Server Actions) encargado de mediar entre las vistas del cliente y los modelos de datos de EMISION.
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

import { EmisionReporteModel } from '@/models/emision.model';
import { revalidatePath } from 'next/cache';

export async function emitirReporteAction(evaluacionId: number) {
  try {
    await EmisionReporteModel.actualizarEstadoReporte(evaluacionId, 'Emitido');
    revalidatePath('/dashboard/evaluaciones');
    return { success: true, message: 'Reporte emitido correctamente.' };
  } catch (error) {
    console.error('Error al emitir reporte:', error);
    return { success: false, message: 'No se pudo procesar la emisión.' };
  }
}

export async function obtenerDataEmisionAction(filtros: { id_empleado?: number }) {
  try {
    const historial = await EmisionReporteModel.obtenerHistorialEmisiones(filtros);
    const resumen = await EmisionReporteModel.obtenerResumenEmisiones();
    return { success: true, data: { historial, resumen } };
  } catch (error) {
    console.error('Error al obtener datos de emisión:', error);
    return { success: false, message: 'Error al cargar datos.' };
  }
}