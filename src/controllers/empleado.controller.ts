/**
 * @file empleado.controller.ts
 * @description Controlador de Capa de Presentación (Server Actions) encargado de mediar entre las vistas del cliente y los modelos de datos de EMPLEADO.
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

import { EmpleadoModel } from '@/models/empleado.model';
import { AreaModel } from '@/models/area.model';
import { HorarioModel } from '@/models/horario.model';
import { AsistenciaModel } from '@/models/asistencia.model';
import { revalidatePath } from 'next/cache';

export async function obtenerTodosLosEmpleados() {
  try {
    const empleados = await EmpleadoModel.obtenerTodos();
    return { success: true, empleados };
  } catch (error) {
    return { success: false, message: 'Error de base de datos', empleados: [] };
  }
}

export interface EmpleadoFormData {
  dni: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  horarioId: number;
}

export async function registrarEmpleado(data: EmpleadoFormData) {
  try {
    const { dni, nombres, apellidos, cargo, horarioId } = data;
    if (!dni || !nombres || !apellidos || !cargo || !horarioId) return { success: false, message: 'Todos los campos son obligatorios' };
    if (!/^\d{8}$/.test(dni)) return { success: false, message: 'El DNI debe contener exactamente 8 dígitos numéricos' };

    const id_area = await AreaModel.obtenerIdPorNombre(cargo);
    if (!id_area) return { success: false, message: `El área/cargo '${cargo}' no existe en el sistema. Por favor, regístrelo primero.` };

    await EmpleadoModel.registrar(dni, nombres, apellidos, id_area, horarioId);
    revalidatePath('/dashboard/empleados');
    return { success: true, message: 'Empleado registrado exitosamente' };
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') return { success: false, message: 'Ya existe un empleado con este DNI' };
    return { success: false, message: `Error BD: ${error.message || 'Ocurrió un error al registrar el empleado'}` };
  }
}

export async function eliminarEmpleado(id_empleado: number) {
  try {
    // Eliminamos registros dependientes a través de los modelos
    await AsistenciaModel.eliminarPorEmpleado(id_empleado);
    await EmpleadoModel.eliminarDependencias(id_empleado);
    
    await EmpleadoModel.eliminar(id_empleado);
    revalidatePath('/dashboard/empleados');
    return { success: true, message: 'Empleado eliminado correctamente' };
  } catch (error: any) {
    return { success: false, message: `Error BD: ${error.message || 'Error al eliminar el empleado'}` };
  }
}

export async function actualizarEmpleado(id_empleado: number, data: EmpleadoFormData) {
  try {
    const { dni, nombres, apellidos, cargo, horarioId } = data;
    if (!dni || !nombres || !apellidos || !cargo || !horarioId) return { success: false, message: 'Todos los campos son obligatorios' };
    if (!/^\d{8}$/.test(dni)) return { success: false, message: 'El DNI debe contener exactamente 8 dígitos numéricos' };

    const id_area = await AreaModel.obtenerIdPorNombre(cargo);
    if (!id_area) return { success: false, message: `El área/cargo '${cargo}' no existe en el sistema. Por favor, regístrelo primero.` };

    await EmpleadoModel.actualizar(id_empleado, dni, nombres, apellidos, id_area, horarioId);
    revalidatePath('/dashboard/empleados');
    return { success: true, message: 'Empleado actualizado exitosamente' };
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') return { success: false, message: 'Ya existe otro empleado con este DNI' };
    return { success: false, message: `Error BD: ${error.message || 'Ocurrió un error al actualizar el empleado'}` };
  }
}

export async function obtenerTodosLosHorarios() {
  try {
    const horarios = await HorarioModel.obtenerTodos();
    return { success: true, horarios };
  } catch (error) {
    return { success: false, message: 'Error de base de datos', horarios: [] };
  }
}

export async function obtenerTodasLasAreas() {
  try {
    const areas = await AreaModel.obtenerTodas();
    return { success: true, areas };
  } catch (error) {
    return { success: false, message: 'Error de base de datos', areas: [] };
  }
}