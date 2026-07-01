/**
 * @file expediente.controller.ts
 * @description Controlador de Capa de Presentación (Server Actions) encargado de mediar entre las vistas del cliente y los modelos de datos de EXPEDIENTE.
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

import { ExpedienteModel } from '@/models/expediente.model';
import { revalidatePath } from 'next/cache';

export async function archivarDocumentoAction(formData: {
  empleadoId: number;
  fecha: string;
  tipo: string;
  notas: string;
}) {
  try {
    if (!formData.empleadoId || !formData.fecha) {
      return { success: false, error: 'Empleado y fecha son requeridos.' };
    }

    // Simulamos la generación de una ruta de archivo basada en el tipo
    const rutaSimulada = `/docs/expedientes/${formData.empleadoId}_${formData.tipo}.pdf`;

    await ExpedienteModel.archivarDocumento({
      id_empleado: formData.empleadoId,
      fecha: formData.fecha,
      ruta_pdf: rutaSimulada
    });

    if (formData.tipo === 'Evaluación') {
      await ExpedienteModel.archivarEvaluacionEmpleado(formData.empleadoId);
    }

    revalidatePath('/dashboard/evaluaciones');
    return { success: true, message: 'Documento archivado correctamente en el expediente.' };
  } catch (error: any) {
    return { success: false, error: 'Error al procesar el archivo del expediente.' };
  }
}

export async function obtenerDatosPanelExpediente(empleadoId?: number) {
  try {
    const metricas = await ExpedienteModel.obtenerMetricasExpediente();
    const detalle = empleadoId ? await ExpedienteModel.obtenerDetalleEmpleado(empleadoId) : null;
    return { success: true, data: { metricas, detalle } };
  } catch (error) {
    return { success: false, error: 'Error al cargar datos del panel.' };
  }
}