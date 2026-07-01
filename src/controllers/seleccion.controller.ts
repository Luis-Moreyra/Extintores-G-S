/**
 * @file seleccion.controller.ts
 * @description Controlador de Capa de Presentación (Server Actions) encargado de mediar entre las vistas del cliente y los modelos de datos de SELECCION.
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

import { 
  SolicitudModel, 
  ConvocatoriaModel, 
  PostulanteModel, 
  EntrevistaModel, 
  EvaluacionModel, 
  ContratoModel 
} from '@/models/seleccion.model';
import { revalidatePath } from 'next/cache';

// ============ SOLICITUD DE CONTRATACIÓN (CU13) ============

export async function registrarSolicitud(data: {
  idArea: number;
  cargo: string;
  tipoContrato: string;
  vacantes: number;
  salarioOfrecido: number;
  fechaInicio: string;
  requisitos: string;
  descripcionFunciones: string;
  justificacion: string;
}) {
  try {
    const { idArea, cargo, tipoContrato, vacantes, salarioOfrecido, fechaInicio, requisitos, descripcionFunciones, justificacion } = data;

    if (!idArea || !cargo || !tipoContrato || !vacantes || !salarioOfrecido || !fechaInicio) {
      return { success: false, message: 'Se han encontrado datos inválidos o incompletos' };
    }

    const today = new Date().toISOString().split('T')[0];
    if (fechaInicio < today) {
      return { success: false, message: 'La fecha de inicio deseada no puede ser menor a la fecha actual' };
    }

    await SolicitudModel.crear(idArea, cargo, tipoContrato, vacantes, salarioOfrecido, fechaInicio, requisitos, descripcionFunciones, justificacion);
    revalidatePath('/dashboard/seleccion');
    return { success: true, message: 'Solicitud registrada satisfactoriamente' };
  } catch (error: any) {
    console.error('Error al registrar solicitud:', error);
    return { success: false, message: 'Error al registrar la solicitud' };
  }
}

export async function obtenerSolicitudes() {
  try {
    const solicitudes = await SolicitudModel.obtenerTodas();
    return { success: true, data: solicitudes };
  } catch (error: any) {
    console.error('Error al obtener solicitudes:', error);
    return { success: false, data: [] };
  }
}

// ============ CONVOCATORIA (CU14) ============

export async function publicarConvocatoria(data: {
  idSolicitud: number;
  titulo: string;
  fechaCierre: string;
  descripcion: string;
  canales: string[];
}) {
  try {
    const { idSolicitud, titulo, fechaCierre, descripcion, canales } = data;

    if (!idSolicitud || !titulo || !fechaCierre || !canales || canales.length === 0) {
      return { success: false, message: 'Se han encontrado datos inválidos o incompletos' };
    }

    if (canales.length === 0) {
      return { success: false, message: 'Debe seleccionar al menos un canal de publicación' };
    }

    await ConvocatoriaModel.crear(idSolicitud, titulo, fechaCierre, descripcion, JSON.stringify(canales));
    revalidatePath('/dashboard/seleccion');
    return { success: true, message: 'Convocatoria publicada satisfactoriamente' };
  } catch (error: any) {
    console.error('Error al publicar convocatoria:', error);
    return { success: false, message: `Error: ${error.message || 'Error al publicar la convocatoria'}` };
  }
}

export async function obtenerConvocatorias() {
  try {
    const convocatorias = await ConvocatoriaModel.obtenerTodas();
    return { success: true, data: convocatorias };
  } catch (error: any) {
    console.error('Error al obtener convocatorias:', error);
    return { success: false, data: [] };
  }
}

// ============ POSTULANTE Y CLASIFICACIÓN (CU15) ============

export async function obtenerPostulantes(idConvocatoria: number) {
  try {
    const postulantes = await PostulanteModel.obtenerPorConvocatoria(idConvocatoria);
    return { success: true, data: postulantes };
  } catch (error: any) {
    console.error('Error al obtener postulantes:', error);
    return { success: false, data: [] };
  }
}

export async function clasificarPostulante(idPostulante: number, estado: 'Aprobado' | 'Rechazado') {
  try {
    if (!['Aprobado', 'Rechazado'].includes(estado)) {
      return { success: false, message: 'Estado inválido' };
    }

    await PostulanteModel.actualizarEstado(idPostulante, estado);
    revalidatePath('/dashboard/seleccion');
    return { success: true, message: 'Postulante clasificado satisfactoriamente' };
  } catch (error: any) {
    console.error('Error al clasificar postulante:', error);
    return { success: false, message: 'Error al clasificar postulante' };
  }
}

export async function contarPostulantes(idConvocatoria: number) {
  try {
    const total = await PostulanteModel.contar(idConvocatoria);
    const porRevisar = await PostulanteModel.contar(idConvocatoria, 'Por revisar');
    const aprobados = await PostulanteModel.contar(idConvocatoria, 'Aprobado');
    const rechazados = await PostulanteModel.contar(idConvocatoria, 'Rechazado');

    return { 
      success: true, 
      data: { total, porRevisar, aprobados, rechazados }
    };
  } catch (error: any) {
    console.error('Error al contar postulantes:', error);
    return { success: false, data: { total: 0, porRevisar: 0, aprobados: 0, rechazados: 0 } };
  }
}

// ============ ENTREVISTA (CU16) ============

export async function registrarEntrevista(data: {
  idPostulante: number;
  fecha: string;
  hora: string;
  tipoEntrevista: string;
  entrevistadores: string;
  enlaceReunion?: string;
  notas?: string;
}) {
  try {
    const { idPostulante, fecha, hora, tipoEntrevista, entrevistadores, enlaceReunion, notas } = data;

    if (!idPostulante || !fecha || !hora || !tipoEntrevista || !entrevistadores) {
      return { success: false, message: 'Se han encontrado datos inválidos o incompletos' };
    }

    const disponible = await EntrevistaModel.verificarDisponibilidad(fecha, hora);
    if (!disponible) {
      return { success: false, message: 'La fecha y hora seleccionada no se encuentra disponible' };
    }

    await EntrevistaModel.crear(idPostulante, fecha, hora, tipoEntrevista, entrevistadores, enlaceReunion || '', notas || '');
    revalidatePath('/dashboard/seleccion');
    return { success: true, message: 'Entrevista programada satisfactoriamente' };
  } catch (error: any) {
    console.error('Error al registrar entrevista:', error);
    return { success: false, message: 'Error al registrar la entrevista' };
  }
}

export async function obtenerEntrevistas() {
  try {
    const entrevistas = await EntrevistaModel.obtenerTodas();
    return { success: true, data: entrevistas };
  } catch (error: any) {
    console.error('Error al obtener entrevistas:', error);
    return { success: false, data: [] };
  }
}

export async function cancelarEntrevista(idEntrevista: number) {
  try {
    await EntrevistaModel.actualizarEstado(idEntrevista, 'Cancelada');
    revalidatePath('/dashboard/seleccion');
    return { success: true, message: 'Entrevista cancelada satisfactoriamente' };
  } catch (error: any) {
    console.error('Error al cancelar entrevista:', error);
    return { success: false, message: 'Error al cancelar la entrevista' };
  }
}

// ============ EVALUACIÓN (CU17) ============

export async function evaluarCandidato(data: {
  idPostulante: number;
  criterios: string;
  fortalezas: string;
  areasMejora: string;
  comentarios: string;
  recomendacion: 'Rechazar' | 'Considerar' | 'Recomendar' | 'Recomendar Fuertemente';
  puntuacionTotal: number;
}) {
  try {
    const { idPostulante, criterios, fortalezas, areasMejora, comentarios, recomendacion, puntuacionTotal } = data;

    if (!idPostulante || !criterios || !recomendacion) {
      return { success: false, message: 'Se han encontrado datos inválidos o incompletos' };
    }

    if (puntuacionTotal < 0 || puntuacionTotal > 25) {
      return { success: false, message: 'Debe asignar puntuación a todos los criterios de evaluación' };
    }

    const evaluacionExistente = await EvaluacionModel.obtenerPorPostulante(idPostulante);
    
    if (evaluacionExistente && evaluacionExistente.length > 0) {
      await EvaluacionModel.actualizar(
        evaluacionExistente[0].id_evaluacion,
        criterios,
        fortalezas,
        areasMejora,
        comentarios,
        recomendacion,
        puntuacionTotal
      );
    } else {
      await EvaluacionModel.crear(idPostulante, criterios, fortalezas, areasMejora, comentarios, recomendacion, puntuacionTotal);
    }

    revalidatePath('/dashboard/seleccion');
    return { success: true, message: 'Evaluación enviada satisfactoriamente' };
  } catch (error: any) {
    console.error('Error al evaluar candidato:', error);
    return { success: false, message: 'Error al registrar la evaluación' };
  }
}

export async function obtenerEvaluaciones() {
  try {
    const evaluaciones = await EvaluacionModel.obtenerTodas();
    return { success: true, data: evaluaciones };
  } catch (error: any) {
    console.error('Error al obtener evaluaciones:', error);
    return { success: false, data: [] };
  }
}

// ============ CONTRATO (CU18) ============

export async function gestionarContrato(data: {
  idPostulante: number;
  tipoContrato: string;
  fechaInicio: string;
  fechaTermino: string;
  salario: number;
  cargo: string;
  area: string;
  modalidad: string;
  periodoPrueba: string;
  beneficios: string;
}) {
  try {
    const { idPostulante, tipoContrato, fechaInicio, fechaTermino, salario, cargo, area, modalidad, periodoPrueba, beneficios } = data;

    if (!idPostulante || !tipoContrato || !fechaInicio || !fechaTermino || !salario) {
      return { success: false, message: 'Se han encontrado datos inválidos o incompletos' };
    }

    if (fechaTermino <= fechaInicio) {
      return { success: false, message: 'La fecha de término debe ser mayor a la fecha de inicio' };
    }

    const contratoExistente = await ContratoModel.obtenerPorPostulante(idPostulante);
    
    if (contratoExistente && contratoExistente.length > 0) {
      await ContratoModel.actualizar(
        contratoExistente[0].id_contrato,
        tipoContrato,
        fechaInicio,
        fechaTermino,
        salario,
        cargo,
        area,
        modalidad,
        periodoPrueba,
        beneficios,
        'Enviado para firma'
      );
    } else {
      await ContratoModel.crear(idPostulante, tipoContrato, fechaInicio, fechaTermino, salario, cargo, area, modalidad, periodoPrueba, beneficios, 'Enviado para firma');
    }

    revalidatePath('/dashboard/seleccion');
    return { success: true, message: 'Contrato enviado para firma satisfactoriamente' };
  } catch (error: any) {
    console.error('Error al gestionar contrato:', error);
    return { success: false, message: 'Error al gestionar el contrato' };
  }
}

export async function obtenerContratos() {
  try {
    const contratos = await ContratoModel.obtenerTodas();
    return { success: true, data: contratos };
  } catch (error: any) {
    console.error('Error al obtener contratos:', error);
    return { success: false, data: [] };
  }
}

export async function guardarBorradorContrato(data: {
  idPostulante: number;
  tipoContrato: string;
  fechaInicio: string;
  fechaTermino: string;
  salario: number;
  cargo: string;
  area: string;
  modalidad: string;
  periodoPrueba: string;
  beneficios: string;
}) {
  try {
    const contratoExistente = await ContratoModel.obtenerPorPostulante(data.idPostulante);
    
    if (contratoExistente && contratoExistente.length > 0) {
      await ContratoModel.actualizar(
        contratoExistente[0].id_contrato,
        data.tipoContrato,
        data.fechaInicio,
        data.fechaTermino,
        data.salario,
        data.cargo,
        data.area,
        data.modalidad,
        data.periodoPrueba,
        data.beneficios,
        'Borrador'
      );
    } else {
      await ContratoModel.crear(
        data.idPostulante,
        data.tipoContrato,
        data.fechaInicio,
        data.fechaTermino,
        data.salario,
        data.cargo,
        data.area,
        data.modalidad,
        data.periodoPrueba,
        data.beneficios,
        'Borrador'
      );
    }

    revalidatePath('/dashboard/seleccion');
    return { success: true, message: 'Borrador guardado satisfactoriamente' };
  } catch (error: any) {
    console.error('Error al guardar borrador:', error);
    return { success: false, message: 'Error al guardar el borrador' };
  }
}

export async function registrarPostulanteAction(data: {
  idConvocatoria: number;
  nombreCompleto: string;
  dni: string;
  email: string;
  telefono: string;
  cv: string;
}) {
  try {
    const { idConvocatoria, nombreCompleto, dni, email, telefono, cv } = data;
    if (!idConvocatoria || !nombreCompleto || !dni || !email || !telefono) {
      return { success: false, message: 'Se han encontrado datos inválidos o incompletos' };
    }
    await PostulanteModel.crear(idConvocatoria, nombreCompleto, dni, email, telefono, cv);
    revalidatePath('/dashboard/seleccion');
    return { success: true, message: 'Postulante registrado satisfactoriamente' };
  } catch (error: any) {
    console.error('Error al registrar postulante:', error);
    return { success: false, message: 'Error al registrar postulante' };
  }
}

export async function firmarYContratarPostulanteAction(idPostulante: number) {
  try {
    if (!idPostulante) {
      return { success: false, message: 'ID de postulante inválido' };
    }
    await ContratoModel.firmarYContratar(idPostulante);
    revalidatePath('/dashboard/seleccion');
    revalidatePath('/dashboard/empleados');
    return { success: true, message: '¡Contrato firmado y alta de empleado procesada con éxito!' };
  } catch (error: any) {
    console.error('Error en firmarYContratarPostulanteAction:', error);
    return { success: false, message: error.message || 'Error al procesar la firma del contrato' };
  }
}

export async function obtenerTodosLosPostulantesAction() {
  try {
    const postulantes = await PostulanteModel.obtenerTodos();
    return { success: true, data: postulantes };
  } catch (error: any) {
    console.error('Error al obtener todos los postulantes:', error);
    return { success: false, data: [] };
  }
}
