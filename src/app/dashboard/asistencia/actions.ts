'use server';

import { marcarEntrada as ctrlMarcarEntrada, marcarSalida as ctrlMarcarSalida } from '@/controllers/asistencia.controller';

export async function marcarEntrada() { return ctrlMarcarEntrada(); }
export async function marcarSalida() { return ctrlMarcarSalida(); }