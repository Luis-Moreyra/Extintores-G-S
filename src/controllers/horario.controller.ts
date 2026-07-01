/**
 * @file horario.controller.ts
 * @description Controlador de Capa de Presentación (Server Actions) encargado de mediar entre las vistas del cliente y los modelos de datos de HORARIO.
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

import { HorarioModel } from '@/models/horario.model';
import { EmpleadoModel } from '@/models/empleado.model';
import { revalidatePath } from 'next/cache';

export async function registrarHorario(data: { nombre_turno: string; hora_entrada: string; hora_salida: string }) {
  try {
    const { nombre_turno, hora_entrada, hora_salida } = data;
    if (!nombre_turno || !hora_entrada || !hora_salida) {
      return { success: false, message: 'Todos los campos son obligatorios' };
    }
    await HorarioModel.registrar(nombre_turno, hora_entrada, hora_salida);
    revalidatePath('/dashboard/horarios');
    return { success: true, message: 'Horario registrado exitosamente' };
  } catch (error: any) {
    console.error('Error al registrar horario:', error);
    return { success: false, message: `Error BD: ${error.message || 'Error desconocido'}` };
  }
}

export async function eliminarHorario(id_horario: number) {
  try {
    // Prevenir que se elimine un horario si existen empleados atados a él
    const count = await EmpleadoModel.contarPorHorarioId(id_horario);
    if (count > 0) {
      return { success: false, message: `No se puede eliminar. Hay ${count} empleado(s) asignado(s) a este horario.` };
    }

    await HorarioModel.eliminar(id_horario);
    revalidatePath('/dashboard/horarios');
    return { success: true, message: 'Horario eliminado correctamente' };
  } catch (error: any) {
    console.error('Error al eliminar horario:', error);
    return { success: false, message: `Error BD: ${error.message || 'Error desconocido al eliminar'}` };
  }
}