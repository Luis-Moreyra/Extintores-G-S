/**
 * @file evaluacion.controller.ts
 * @description Controlador de Capa de Presentación (Server Actions) encargado de mediar entre las vistas del cliente y los modelos de datos de EVALUACION.
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

import { EvaluacionDesempeñoModel } from '@/models/evaluacion.model';
import { revalidatePath } from 'next/cache';

export async function registrarEvaluacionAction(formData: {
  empleadoId: number;
  evaluadorId: number;
  periodo: string;
  notas: Record<string, number>;
  comentarios: Record<string, string>;
  promedio: number;
}) {
  try {
    // Validación de campos obligatorios (*)
    if (!formData.empleadoId || !formData.evaluadorId || !formData.periodo) {
      return { success: false, message: 'Empleado, Evaluador y Periodo son obligatorios.' };
    }

    if (Object.keys(formData.notas).length < 5) {
      return { success: false, message: 'Debe calificar todos los criterios de evaluación.' };
    }

    // Estructuramos el campo observaciones para no perder detalle en el esquema genérico
    const observacionesEstructuradas = JSON.stringify({
      periodo: formData.periodo,
      id_evaluador: formData.evaluadorId,
      notas_criterios: formData.notas,
      comentarios_detalle: formData.comentarios
    });

    await EvaluacionDesempeñoModel.crear({
      id_empleado: formData.empleadoId,
      puntaje: formData.promedio,
      observaciones: observacionesEstructuradas
    });

    revalidatePath('/dashboard/evaluaciones');
    return { success: true, message: 'Evaluación registrada exitosamente.' };
  } catch (error: any) {
    console.error('Error en registrarEvaluacionAction:', error);
    return { success: false, message: 'Error interno al procesar la evaluación.' };
  }
}