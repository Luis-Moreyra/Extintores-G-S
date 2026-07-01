/**
 * @file asistencia.controller.ts
 * @description Controlador de Capa de Presentación (Server Actions) encargado de mediar entre las vistas del cliente y los modelos de datos de ASISTENCIA.
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

import { AsistenciaModel } from '@/models/asistencia.model';
import { EmpleadoModel } from '@/models/empleado.model';
import { revalidatePath } from 'next/cache';

export interface AsistenciaFormData {
  empleadoId: number;
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  estado: string;
  observaciones: string;
}

export async function registrarAsistenciaManual(data: AsistenciaFormData) {
  try {
    const { empleadoId, fecha, hora_entrada, hora_salida, estado, observaciones } = data;
    
    if (!empleadoId || !fecha || !estado) {
      return { success: false, message: 'Faltan datos obligatorios (ID de empleado, fecha, estado)' };
    }

    const existe = await EmpleadoModel.verificarExistenciaId(empleadoId);
    if (!existe) return { success: false, message: 'El ID de empleado no existe en la base de datos' };

    const horaEntradaRegistro = estado === 'Ausente' || !hora_entrada || hora_entrada.trim() === '' ? null : hora_entrada;
    const horaSalidaRegistro = estado === 'Ausente' || !hora_salida || hora_salida.trim() === '' ? null : hora_salida;

    await AsistenciaModel.registrar(empleadoId, fecha, horaEntradaRegistro, horaSalidaRegistro, estado, observaciones || null);

    revalidatePath('/dashboard/asistencia');
    return { success: true, message: 'Asistencia registrada correctamente' };
  } catch (error: any) {
    console.error('Error al registrar asistencia:', error);
    if (error.code === 'ER_DUP_ENTRY') return { success: false, message: 'Ya existe un registro de asistencia para este empleado en esta fecha' };
    return { success: false, message: `Error BD: ${error.message || 'Ocurrió un error al registrar la asistencia'}` };
  }
}

export async function buscarAsistencias(nombreCompleto: string, fechaInicio: string, fechaFin: string) {
  try {
    const data = await AsistenciaModel.buscar(nombreCompleto, fechaInicio, fechaFin);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al buscar asistencias:', error);
    return { success: false, message: 'Error de base de datos al buscar asistencias', data: [] };
  }
}

export async function obtenerEmpleadoPorId(id: number) {
  const rows = await EmpleadoModel.obtenerPorId(id);
  return rows.length > 0 ? { success: true, empleado: rows[0] } : { success: false, message: 'Empleado no encontrado' };
}

export async function obtenerEmpleadoPorDni(dni: string) {
  const rows = await EmpleadoModel.obtenerPorDni(dni);
  return rows.length > 0 ? { success: true, empleado: rows[0] } : { success: false, message: 'Empleado no encontrado' };
}

// Para el prototipo, simulamos que el usuario logueado tiene el ID 1
const USER_ID = 1;

export async function marcarEntrada() {
  try {
    const yaMarco = await AsistenciaModel.verificarEntradaHoy(USER_ID);
    if (yaMarco) return { success: false, message: "Ya marcaste tu entrada el día de hoy." };

    await AsistenciaModel.registrarEntrada(USER_ID);
    revalidatePath('/dashboard/asistencia');
    return { success: true, message: "✅ Entrada registrada exitosamente." };
  } catch (error) {
    console.error("Error en marcarEntrada:", error);
    return { success: false, message: "❌ Error al registrar entrada." };
  }
}

export async function marcarSalida() {
  try {
    await AsistenciaModel.registrarSalida(USER_ID);
    revalidatePath('/dashboard/asistencia');
    return { success: true, message: "✅ Salida registrada exitosamente." };
  } catch (error) {
    console.error("Error en marcarSalida:", error);
    return { success: false, message: "❌ Error al registrar salida." };
  }
}