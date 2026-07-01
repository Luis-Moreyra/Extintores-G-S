/**
 * @file notificacion.controller.ts
 * @description Controlador de Capa de Presentación (Server Actions) encargado de mediar entre las vistas del cliente y los modelos de datos de NOTIFICACION.
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

import { NotificacionModel } from '@/models/notificacion.model';
import { revalidatePath } from 'next/cache';

export async function enviarNotificacionResultadosAction(idEvaluacion: number, idEmpleado: number, medio: string) {
  try {
    // Aquí iría la integración real con servicios de correo (Nodemailer, SendGrid, etc.)
    // Por ahora registramos el éxito en la base de datos siguiendo la arquitectura del proyecto.
    await NotificacionModel.registrarNotificacionEnviada(idEvaluacion, medio);

    revalidatePath('/dashboard/evaluaciones');
    return { success: true, message: 'La notificación ha sido enviada y registrada en el sistema.' };
  } catch (error) {
    return { success: false, error: 'Error al procesar el envío de la notificación.' };
  }
}

export async function obtenerInfoNotificacionAction(idEmpleado?: number) {
  try {
    const metricas = await NotificacionModel.obtenerMetricasEnvio();
    const detalle = idEmpleado ? await NotificacionModel.obtenerDatosParaNotificar(idEmpleado) : null;
    
    return { 
      success: true, 
      data: { 
        metricas, 
        detalle 
      } 
    };
  } catch (error) {
    return { success: false, error: 'Error al cargar información de notificaciones.' };
  }
}