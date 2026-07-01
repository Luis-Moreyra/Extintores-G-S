/**
 * @file productividad.controller.ts
 * @description Controlador de Capa de Presentación (Server Actions) encargado de mediar entre las vistas del cliente y los modelos de datos de PRODUCTIVIDAD.
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

import { ProductividadModel } from '@/models/productividad.model';

export async function obtenerDashboardAnaliticoAction(filtros: { 
  idArea: number; 
  periodo: string;
  puntuacionMinima?: string;
  compararCon?: string;
}) {
  try {
    const [kpis, historico, distribucion, porArea] = await Promise.all([
      ProductividadModel.obtenerKpisProductividad(filtros),
      ProductividadModel.obtenerHistoricoDesempeno(filtros),
      ProductividadModel.obtenerDistribucionCalificaciones(filtros),
      ProductividadModel.obtenerProductividadArea(filtros)
    ]);

    return {
      success: true,
      data: {
        kpis,
        historico,
        distribucion,
        porArea
      }
    };
  } catch (error) {
    console.error("Error en obtenerDashboardAnaliticoAction:", error);
    return { success: false, message: "Error al procesar indicadores de productividad" };
  }
}