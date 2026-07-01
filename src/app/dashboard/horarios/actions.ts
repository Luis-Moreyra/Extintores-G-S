'use server';

import { registrarHorario as ctrlRegistrar, eliminarHorario as ctrlEliminar } from '@/controllers/horario.controller';

export async function registrarHorario(data: { nombre_turno: string; hora_entrada: string; hora_salida: string }) { return ctrlRegistrar(data); }
export async function eliminarHorario(id_horario: number) { return ctrlEliminar(id_horario); }