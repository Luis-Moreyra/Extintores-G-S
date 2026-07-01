/**
 * @file dashboard.controller.ts
 * @description Controlador de Capa de Presentación (Server Actions) encargado de mediar entre las vistas del cliente y los modelos de datos de DASHBOARD.
 * @module ExtintoresGS/controllers
 * @copyright Extintores GS S.A.C. Todos los derechos reservados.
 * 
 * ============================================================================
 * SECCIÓN GENERAL DE DOCUMENTACIÓN Y RESUMEN DE FUNCIONES:
 * - Provee control reactivo y encapsulación de lógica.
 * - Asegura la consistencia en el tipado y llamado de las consultas SQL/Actions.
 * ============================================================================
 */

import { DashboardModel } from '@/models/dashboard.model';

// EL CONTROLADOR: Intermediario entre la Vista (React) y el Modelo (BD)
export class DashboardController {
  static async getDashboardMetrics() {
    try {
      // 1. Llama al modelo para obtener la información
      const [employeeCount, presentCount, evaluationCount, postingCount] = await Promise.all([
        DashboardModel.getEmployeeCount(),
        DashboardModel.getPresentCountToday(),
        DashboardModel.getEvaluationCountThisMonth(),
        DashboardModel.getActivePostingCount()
      ]);

      // 2. Procesa y empaqueta la respuesta para que la Vista sea "tonta" y solo pinte
      return { 
        success: true, 
        data: { employeeCount, presentCount, evaluationCount, postingCount } 
      };
    } catch (error: any) {
      console.error("Error en DashboardController:", error);
      return { success: false, message: "Error al cargar las métricas del dashboard", data: null };
    }
  }
}