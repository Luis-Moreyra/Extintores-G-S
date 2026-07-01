'use server';

import { 
  registrarEmpleado as ctrlRegistrar, 
  eliminarEmpleado as ctrlEliminar, 
  actualizarEmpleado as ctrlActualizar, 
  obtenerTodosLosHorarios as ctrlHorarios, 
  obtenerTodasLasAreas as ctrlAreas 
} from '@/controllers/empleado.controller';

export async function registrarEmpleado(data: any) { return ctrlRegistrar(data); }
export async function eliminarEmpleado(id_empleado: number) { return ctrlEliminar(id_empleado); }
export async function actualizarEmpleado(id_empleado: number, data: any) { return ctrlActualizar(id_empleado, data); }
export async function obtenerTodosLosHorarios() { return ctrlHorarios(); }
export async function obtenerTodasLasAreas() { return ctrlAreas(); }
