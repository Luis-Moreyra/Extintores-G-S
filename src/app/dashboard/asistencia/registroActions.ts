'use server';

import { 
  registrarAsistenciaManual as ctrlRegistrar, 
  obtenerEmpleadoPorId as ctrlObtenerId, 
  obtenerEmpleadoPorDni as ctrlObtenerDni, 
  buscarAsistencias as ctrlBuscar 
} from '@/controllers/asistencia.controller';
import { obtenerTodosLosEmpleados as ctrlObtenerTodos } from '@/controllers/empleado.controller';

export async function registrarAsistenciaManual(data: any) { return ctrlRegistrar(data); }
export async function obtenerEmpleadoPorId(id: number) { return ctrlObtenerId(id); }
export async function obtenerEmpleadoPorDni(dni: string) { return ctrlObtenerDni(dni); }
export async function buscarAsistencias(nombreCompleto: string, fechaInicio: string, fechaFin: string) { return ctrlBuscar(nombreCompleto, fechaInicio, fechaFin); }
export async function obtenerTodosLosEmpleados() { return ctrlObtenerTodos(); }