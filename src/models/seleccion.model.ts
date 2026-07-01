/**
 * @file seleccion.model.ts
 * @description Modelo de Datos encargado de las operaciones de base de datos directas (consultas, inserciones, actualizaciones y lógica relacional) sobre la entidad SELECCION en Extintores GS.
 * @module ExtintoresGS/models
 * @copyright Extintores GS S.A.C. Todos los derechos reservados.
 * 
 * ============================================================================
 * SECCIÓN GENERAL DE DOCUMENTACIÓN Y RESUMEN DE FUNCIONES:
 * - Provee control reactivo y encapsulación de lógica.
 * - Asegura la consistencia en el tipado y llamado de las consultas SQL/Actions.
 * ============================================================================
 */

import pool from '@/lib/db';

export class SolicitudModel {
  static async crear(idArea: number, cargo: string, tipoContrato: string, vacantes: number, salarioOfrecido: number, fechaInicio: string, requisitos: string, descripcionFunciones: string, justificacion: string) {
    const payload = JSON.stringify({
      tipo: 'Solicitud',
      id_area: idArea,
      tipo_contrato: tipoContrato,
      vacantes: vacantes,
      salario_ofrecido: salarioOfrecido,
      fecha_inicio_deseada: fechaInicio,
      requisitos_texto: requisitos,
      descripcion_funciones: descripcionFunciones,
      justificacion: justificacion,
      estado: 'Pendiente'
    });
    return pool.query(
      `INSERT INTO Convocatoria (cargo, requisitos, fecha_publicacion) VALUES (?, ?, CURDATE())`,
      [cargo, payload]
    );
  }

  static async obtenerTodas() {
    const [rows]: any = await pool.query(
      `SELECT id_convocatoria as id_solicitud, cargo, requisitos, fecha_publicacion as fecha_registro FROM Convocatoria`
    );
    const solicitudes: any[] = [];
    for (const row of rows) {
      try {
        const data = JSON.parse(row.requisitos || '{}');
        if (data.tipo === 'Solicitud') {
          solicitudes.push({
            id_solicitud: row.id_solicitud,
            id_area: data.id_area,
            cargo: row.cargo,
            tipo_contrato: data.tipo_contrato,
            vacantes: data.vacantes,
            salario_ofrecido: data.salario_ofrecido,
            fecha_inicio_deseada: data.fecha_inicio_deseada,
            requisitos: data.requisitos_texto,
            descripcion_funciones: data.descripcion_funciones,
            justificacion: data.justificacion,
            estado: data.estado || 'Pendiente',
            fecha_registro: row.fecha_registro
          });
        }
      } catch (e) {}
    }
    return solicitudes;
  }

  static async obtenerPorId(id: number) {
    const [rows]: any = await pool.query(
      `SELECT id_convocatoria as id_solicitud, cargo, requisitos, fecha_publicacion as fecha_registro FROM Convocatoria WHERE id_convocatoria = ?`,
      [id]
    );
    if (rows.length === 0) return [];
    try {
      const row = rows[0];
      const data = JSON.parse(row.requisitos || '{}');
      if (data.tipo === 'Solicitud') {
        return [{
          id_solicitud: row.id_solicitud,
          id_area: data.id_area,
          cargo: row.cargo,
          tipo_contrato: data.tipo_contrato,
          vacantes: data.vacantes,
          salario_ofrecido: data.salario_ofrecido,
          fecha_inicio_deseada: data.fecha_inicio_deseada,
          requisitos: data.requisitos_texto,
          descripcion_funciones: data.descripcion_funciones,
          justificacion: data.justificacion,
          estado: data.estado || 'Pendiente',
          fecha_registro: row.fecha_registro
        }];
      }
    } catch (e) {}
    return [];
  }

  static async actualizar(id: number, estado: string) {
    const solicitudes = await this.obtenerPorId(id);
    if (solicitudes.length === 0) return null;
    const sol = solicitudes[0];
    const payload = JSON.stringify({
      tipo: 'Solicitud',
      id_area: sol.id_area,
      tipo_contrato: sol.tipo_contrato,
      vacantes: sol.vacantes,
      salario_ofrecido: sol.salario_ofrecido,
      fecha_inicio_deseada: sol.fecha_inicio_deseada,
      requisitos_texto: sol.requisitos,
      descripcion_funciones: sol.descripcion_funciones,
      justificacion: sol.justificacion,
      estado: estado
    });
    return pool.query(
      `UPDATE Convocatoria SET requisitos = ? WHERE id_convocatoria = ?`,
      [payload, id]
    );
  }
}

export class ConvocatoriaModel {
  static async crear(idSolicitud: number, titulo: string, fechaCierre: string, descripcion: string, canales: string) {
    const [solicitudRows]: any = await pool.query(
      `SELECT cargo, requisitos FROM Convocatoria WHERE id_convocatoria = ?`,
      [idSolicitud]
    );
    let cargo = 'Cargo Desconocido';
    if (solicitudRows.length > 0) {
      cargo = solicitudRows[0].cargo;
      try {
        const solData = JSON.parse(solicitudRows[0].requisitos || '{}');
        solData.estado = 'Aprobado';
        await pool.query(
          `UPDATE Convocatoria SET requisitos = ? WHERE id_convocatoria = ?`,
          [JSON.stringify(solData), idSolicitud]
        );
      } catch (e) {}
    }

    const payload = JSON.stringify({
      tipo: 'Convocatoria',
      id_solicitud: idSolicitud,
      titulo: titulo,
      fecha_cierre: fechaCierre,
      descripcion: descripcion,
      canales: typeof canales === 'string' ? JSON.parse(canales) : canales,
      estado: 'Activa'
    });

    return pool.query(
      `INSERT INTO Convocatoria (cargo, requisitos, fecha_publicacion) VALUES (?, ?, CURDATE())`,
      [cargo, payload]
    );
  }

  static async obtenerTodas() {
    const [rows]: any = await pool.query(
      `SELECT id_convocatoria, cargo, requisitos, fecha_publicacion FROM Convocatoria`
    );
    const convocatorias: any[] = [];
    for (const row of rows) {
      try {
        const data = JSON.parse(row.requisitos || '{}');
        if (data.tipo === 'Convocatoria') {
          convocatorias.push({
            id_convocatoria: row.id_convocatoria,
            cargo: row.cargo,
            id_solicitud: data.id_solicitud,
            titulo: data.titulo,
            fecha_cierre: data.fecha_cierre,
            descripcion: data.descripcion,
            canales: JSON.stringify(data.canales),
            estado: data.estado || 'Activa',
            fecha_creacion: row.fecha_publicacion
          });
        }
      } catch (e) {}
    }
    return convocatorias;
  }

  static async obtenerPorId(id: number) {
    const [rows]: any = await pool.query(
      `SELECT id_convocatoria, cargo, requisitos, fecha_publicacion FROM Convocatoria WHERE id_convocatoria = ?`,
      [id]
    );
    if (rows.length === 0) return [];
    try {
      const row = rows[0];
      const data = JSON.parse(row.requisitos || '{}');
      if (data.tipo === 'Convocatoria') {
        return [{
          id_convocatoria: row.id_convocatoria,
          cargo: row.cargo,
          id_solicitud: data.id_solicitud,
          titulo: data.titulo,
          fecha_cierre: data.fecha_cierre,
          descripcion: data.descripcion,
          canales: JSON.stringify(data.canales),
          estado: data.estado || 'Activa',
          fecha_creacion: row.fecha_publicacion
        }];
      }
    } catch (e) {}
    return [];
  }
}

export class PostulanteModel {
  static async crear(idConvocatoria: number, nombreCompleto: string, dni: string, email: string, telefono: string, cv: string, estado: string = 'Por revisar') {
    const parts = nombreCompleto.trim().split(' ');
    const nombres = parts[0] || '';
    const apellidos = parts.slice(1).join(' ') || '-';

    const payload = JSON.stringify({
      nombre_completo: nombreCompleto,
      dni: dni,
      email: email,
      telefono: telefono,
      cv: cv,
      estado: estado,
      fecha_registro: new Date().toISOString()
    });

    return pool.query(
      `INSERT INTO Postulante (id_convocatoria, nombres, apellidos, perfil, puntuacion_final) VALUES (?, ?, ?, ?, NULL)`,
      [idConvocatoria, nombres, apellidos, payload]
    );
  }

  static async obtenerTodos() {
    const [rows]: any = await pool.query(`SELECT * FROM Postulante`);
    const postulantes: any[] = [];
    for (const row of rows) {
      try {
        const data = JSON.parse(row.perfil || '{}');
        postulantes.push({
          id_postulante: row.id_postulante,
          id_convocatoria: row.id_convocatoria,
          nombre_completo: data.nombre_completo || `${row.nombres} ${row.apellidos}`,
          dni: data.dni || '',
          email: data.email || '',
          telefono: data.telefono || '',
          cv: data.cv || '',
          estado: data.estado || 'Por revisar',
          fecha_registro: data.fecha_registro || new Date().toISOString(),
          puntuacion_final: row.puntuacion_final,
          contrato: data.contrato || null
        });
      } catch (e) {
        postulantes.push({
          id_postulante: row.id_postulante,
          id_convocatoria: row.id_convocatoria,
          nombre_completo: `${row.nombres} ${row.apellidos}`,
          dni: '',
          email: '',
          telefono: '',
          cv: '',
          estado: 'Por revisar',
          fecha_registro: new Date().toISOString(),
          puntuacion_final: row.puntuacion_final,
          contrato: null
        });
      }
    }
    return postulantes;
  }

  static async obtenerPorConvocatoria(idConvocatoria: number) {
    const [rows]: any = await pool.query(
      `SELECT * FROM Postulante WHERE id_convocatoria = ?`,
      [idConvocatoria]
    );
    const postulantes: any[] = [];
    for (const row of rows) {
      try {
        const data = JSON.parse(row.perfil || '{}');
        postulantes.push({
          id_postulante: row.id_postulante,
          id_convocatoria: row.id_convocatoria,
          nombre_completo: data.nombre_completo || `${row.nombres} ${row.apellidos}`,
          dni: data.dni || '',
          email: data.email || '',
          telefono: data.telefono || '',
          cv: data.cv || '',
          estado: data.estado || 'Por revisar',
          fecha_registro: data.fecha_registro || new Date().toISOString(),
          puntuacion_final: row.puntuacion_final,
          contrato: data.contrato || null
        });
      } catch (e) {
        postulantes.push({
          id_postulante: row.id_postulante,
          id_convocatoria: row.id_convocatoria,
          nombre_completo: `${row.nombres} ${row.apellidos}`,
          dni: '',
          email: '',
          telefono: '',
          cv: '',
          estado: 'Por revisar',
          fecha_registro: new Date().toISOString(),
          puntuacion_final: row.puntuacion_final,
          contrato: null
        });
      }
    }
    return postulantes;
  }

  static async actualizarEstado(id: number, estado: string) {
    const [rows]: any = await pool.query('SELECT perfil FROM Postulante WHERE id_postulante = ?', [id]);
    if (rows.length === 0) return null;
    let data: any = {};
    try {
      data = JSON.parse(rows[0].perfil || '{}');
    } catch (e) {}
    data.estado = estado;
    return pool.query(
      'UPDATE Postulante SET perfil = ? WHERE id_postulante = ?',
      [JSON.stringify(data), id]
    );
  }

  static async obtenerPorId(id: number) {
    const [rows]: any = await pool.query('SELECT * FROM Postulante WHERE id_postulante = ?', [id]);
    if (rows.length === 0) return [];
    const row = rows[0];
    try {
      const data = JSON.parse(row.perfil || '{}');
      return [{
        id_postulante: row.id_postulante,
        id_convocatoria: row.id_convocatoria,
        nombre_completo: data.nombre_completo || `${row.nombres} ${row.apellidos}`,
        dni: data.dni || '',
        email: data.email || '',
        telefono: data.telefono || '',
        cv: data.cv || '',
        estado: data.estado || 'Por revisar',
        fecha_registro: data.fecha_registro || new Date().toISOString(),
        puntuacion_final: row.puntuacion_final,
        contrato: data.contrato || null
      }];
    } catch (e) {
      return [{
        id_postulante: row.id_postulante,
        id_convocatoria: row.id_convocatoria,
        nombre_completo: `${row.nombres} ${row.apellidos}`,
        dni: '',
        email: '',
        telefono: '',
        cv: '',
        estado: 'Por revisar',
        fecha_registro: new Date().toISOString(),
        puntuacion_final: row.puntuacion_final,
        contrato: null
      }];
    }
  }

  static async contar(idConvocatoria: number, estado?: string) {
    const postulantes = await this.obtenerPorConvocatoria(idConvocatoria);
    if (estado) {
      return postulantes.filter(p => p.estado === estado).length;
    }
    return postulantes.length;
  }
}

export class EntrevistaModel {
  static async crear(idPostulante: number, fecha: string, hora: string, tipoEntrevista: string, entrevistadores: string, enlaceReunion: string = '', notas: string = '') {
    const payload = JSON.stringify({
      hora: hora,
      tipo_entrevista: tipoEntrevista,
      entrevistadores: entrevistadores,
      enlace_reunion: enlaceReunion,
      notes: notas,
      estado: 'Programada'
    });
    const datetimeStr = `${fecha} ${hora}:00`;
    return pool.query(
      `INSERT INTO Evaluacion (tipo_evaluacion, fecha, puntaje, observaciones, id_postulante, id_empleado)
       VALUES ('Entrevista', ?, NULL, ?, ?, NULL)`,
      [datetimeStr, payload, idPostulante]
    );
  }

  static async obtenerTodas() {
    const [rows]: any = await pool.query(
      `SELECT e.*, p.nombres, p.apellidos, p.perfil FROM Evaluacion e 
       LEFT JOIN Postulante p ON e.id_postulante = p.id_postulante 
       WHERE e.tipo_evaluacion = 'Entrevista'
       ORDER BY e.fecha DESC`
    );
    const entrevistas: any[] = [];
    for (const row of rows) {
      try {
        const data = JSON.parse(row.observaciones || '{}');
        // Check if this is an interview (and not a candidate evaluation)
        if (data.tipo === 'EvaluacionCandidato') continue;

        let nombrePostulante = `${row.nombres || ''} ${row.apellidos || ''}`.trim();
        if (row.perfil) {
          try {
            const pData = JSON.parse(row.perfil);
            if (pData.nombre_completo) nombrePostulante = pData.nombre_completo;
          } catch (e) {}
        }
        
        const dt = new Date(row.fecha);
        const dateStr = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
        const timeStr = String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');

        entrevistas.push({
          id_entrevista: row.id_evaluacion,
          id_postulante: row.id_postulante,
          nombre_completo: nombrePostulante || 'Postulante Desconocido',
          fecha: dateStr,
          hora: data.hora || timeStr,
          tipo_entrevista: data.tipo_entrevista || '',
          entrevistadores: data.entrevistadores || '',
          enlace_reunion: data.enlace_reunion || '',
          notas: data.notes || '',
          estado: data.estado || 'Programada',
          fecha_registro: row.fecha
        });
      } catch (e) {}
    }
    return entrevistas;
  }

  static async obtenerPorId(id: number) {
    const [rows]: any = await pool.query(
      `SELECT e.*, p.nombres, p.apellidos, p.perfil FROM Evaluacion e 
       LEFT JOIN Postulante p ON e.id_postulante = p.id_postulante 
       WHERE e.id_evaluacion = ? AND e.tipo_evaluacion = 'Entrevista'`,
      [id]
    );
    if (rows.length === 0) return [];
    const row = rows[0];
    try {
      const data = JSON.parse(row.observaciones || '{}');
      let nombrePostulante = `${row.nombres || ''} ${row.apellidos || ''}`.trim();
      if (row.perfil) {
        try {
          const pData = JSON.parse(row.perfil);
          if (pData.nombre_completo) nombrePostulante = pData.nombre_completo;
        } catch (e) {}
      }

      const dt = new Date(row.fecha);
      const dateStr = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
      const timeStr = String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');

      return [{
        id_entrevista: row.id_evaluacion,
        id_postulante: row.id_postulante,
        nombre_completo: nombrePostulante,
        fecha: dateStr,
        hora: data.hora || timeStr,
        tipo_entrevista: data.tipo_entrevista || '',
        entrevistadores: data.entrevistadores || '',
        enlace_reunion: data.enlace_reunion || '',
        notas: data.notes || '',
        estado: data.estado || 'Programada',
        fecha_registro: row.fecha
      }];
    } catch (e) {}
    return [];
  }

  static async verificarDisponibilidad(fecha: string, hora: string, idExcluir?: number) {
    const datetimeStr = `${fecha} ${hora}:00`;
    let query = `SELECT COUNT(*) as count FROM Evaluacion 
                 WHERE tipo_evaluacion = 'Entrevista' AND fecha = ?`;
    const params: any[] = [datetimeStr];
    if (idExcluir) {
      query += ` AND id_evaluacion != ?`;
      params.push(idExcluir);
    }
    const [rows]: any = await pool.query(query, params);
    return (rows[0]?.count || 0) === 0;
  }

  static async actualizarEstado(id: number, estado: string) {
    const [rows]: any = await pool.query(
      `SELECT observaciones FROM Evaluacion WHERE id_evaluacion = ? AND tipo_evaluacion = 'Entrevista'`,
      [id]
    );
    if (rows.length === 0) return null;
    let data: any = {};
    try {
      data = JSON.parse(rows[0].observaciones || '{}');
    } catch (e) {}
    data.estado = estado;
    return pool.query(
      `UPDATE Evaluacion SET observaciones = ? WHERE id_evaluacion = ?`,
      [JSON.stringify(data), id]
    );
  }
}

export class EvaluacionModel {
  static async crear(idPostulante: number, criterios: string, fortalezas: string, areasMejora: string, comentarios: string, recomendacion: string, puntuacionTotal: number) {
    const payload = JSON.stringify({
      tipo: 'EvaluacionCandidato',
      criterios: typeof criterios === 'string' ? JSON.parse(criterios) : criterios,
      fortalezas: fortalezas,
      areas_mejora: areasMejora,
      comentarios: comentarios,
      recomendacion: recomendacion
    });

    // Update applicant's score in Postulante table too
    await pool.query(
      'UPDATE Postulante SET puntuacion_final = ? WHERE id_postulante = ?',
      [puntuacionTotal, idPostulante]
    );

    return pool.query(
      `INSERT INTO Evaluacion (tipo_evaluacion, fecha, puntaje, observaciones, id_postulante, id_empleado)
       VALUES ('Entrevista', NOW(), ?, ?, ?, NULL)`,
      [puntuacionTotal, payload, idPostulante]
    );
  }

  static async obtenerPorPostulante(idPostulante: number) {
    const [rows]: any = await pool.query(
      `SELECT * FROM Evaluacion WHERE id_postulante = ? AND tipo_evaluacion = 'Entrevista'`,
      [idPostulante]
    );
    const evals: any[] = [];
    for (const row of rows) {
      try {
        const data = JSON.parse(row.observaciones || '{}');
        if (data.tipo === 'EvaluacionCandidato') {
          evals.push({
            id_evaluacion: row.id_evaluacion,
            id_postulante: row.id_postulante,
            criterios: JSON.stringify(data.criterios),
            fortalezas: data.fortalezas,
            areas_mejora: data.areas_mejora,
            comentarios: data.comentarios,
            recomendacion: data.recomendacion,
            puntuacion_total: row.puntaje,
            fecha_registro: row.fecha
          });
        }
      } catch (e) {}
    }
    return evals;
  }

  static async obtenerTodas() {
    const [rows]: any = await pool.query(
      `SELECT e.*, p.nombres, p.apellidos, p.perfil FROM Evaluacion e 
       LEFT JOIN Postulante p ON e.id_postulante = p.id_postulante
       WHERE e.tipo_evaluacion = 'Entrevista' 
       ORDER BY e.fecha DESC`
    );
    const evals: any[] = [];
    for (const row of rows) {
      try {
        const data = JSON.parse(row.observaciones || '{}');
        if (data.tipo === 'EvaluacionCandidato') {
          let nombrePostulante = `${row.nombres || ''} ${row.apellidos || ''}`.trim();
          if (row.perfil) {
            try {
              const pData = JSON.parse(row.perfil);
              if (pData.nombre_completo) nombrePostulante = pData.nombre_completo;
            } catch (e) {}
          }
          evals.push({
            id_evaluacion: row.id_evaluacion,
            id_postulante: row.id_postulante,
            nombre_completo: nombrePostulante || 'Postulante Desconocido',
            criterios: JSON.stringify(data.criterios),
            fortalezas: data.fortalezas,
            areas_mejora: data.areas_mejora,
            comentarios: data.comentarios,
            recomendacion: data.recomendacion,
            puntuacion_total: row.puntaje,
            fecha_registro: row.fecha
          });
        }
      } catch (e) {}
    }
    return evals;
  }

  static async actualizar(id: number, criterios: string, fortalezas: string, areasMejora: string, comentarios: string, recomendacion: string, puntuacionTotal: number) {
    const [evalRows]: any = await pool.query('SELECT id_postulante FROM Evaluacion WHERE id_evaluacion = ?', [id]);
    if (evalRows.length > 0) {
      const idPostulante = evalRows[0].id_postulante;
      await pool.query(
        'UPDATE Postulante SET puntuacion_final = ? WHERE id_postulante = ?',
        [puntuacionTotal, idPostulante]
      );
    }

    const payload = JSON.stringify({
      tipo: 'EvaluacionCandidato',
      criterios: typeof criterios === 'string' ? JSON.parse(criterios) : criterios,
      fortalezas: fortalezas,
      areas_mejora: areasMejora,
      comentarios: comentarios,
      recomendacion: recomendacion
    });
    return pool.query(
      `UPDATE Evaluacion SET puntaje = ?, observaciones = ? WHERE id_evaluacion = ?`,
      [puntuacionTotal, payload, id]
    );
  }
}

export class ContratoModel {
  static async crear(idPostulante: number, tipoContrato: string, fechaInicio: string, fechaTermino: string, salario: number, cargo: string, area: string, modalidad: string, periodoPrueba: string, beneficios: string, estado: string = 'Borrador') {
    const [rows]: any = await pool.query('SELECT perfil FROM Postulante WHERE id_postulante = ?', [idPostulante]);
    if (rows.length === 0) return null;
    let data: any = {};
    try {
      data = JSON.parse(rows[0].perfil || '{}');
    } catch (e) {}
    
    data.contrato = {
      tipo_contrato: tipoContrato,
      fecha_inicio: fechaInicio,
      fecha_termino: fechaTermino,
      salario: salario,
      cargo: cargo,
      area: area,
      modalidad: modalidad,
      periodo_prueba: periodoPrueba,
      beneficios: beneficios,
      estado: estado,
      fecha_creacion: new Date().toISOString()
    };

    return pool.query(
      'UPDATE Postulante SET perfil = ? WHERE id_postulante = ?',
      [JSON.stringify(data), idPostulante]
    );
  }

  static async obtenerPorPostulante(idPostulante: number) {
    const [rows]: any = await pool.query('SELECT perfil FROM Postulante WHERE id_postulante = ?', [idPostulante]);
    if (rows.length === 0) return [];
    try {
      const data = JSON.parse(rows[0].perfil || '{}');
      if (data.contrato) {
        return [{
          id_contrato: idPostulante,
          id_postulante: idPostulante,
          tipo_contrato: data.contrato.tipo_contrato,
          fecha_inicio: data.contrato.fecha_inicio,
          fecha_termino: data.contrato.fecha_termino,
          salario: data.contrato.salario,
          cargo: data.contrato.cargo,
          area: data.contrato.area,
          modalidad: data.contrato.modalidad,
          periodo_prueba: data.contrato.periodo_prueba,
          beneficios: data.contrato.beneficios,
          estado: data.contrato.estado,
          fecha_creacion: data.contrato.fecha_creacion
        }];
      }
    } catch (e) {}
    return [];
  }

  static async obtenerTodas() {
    const [rows]: any = await pool.query('SELECT id_postulante, nombres, apellidos, perfil FROM Postulante');
    const contratos: any[] = [];
    for (const row of rows) {
      try {
        const data = JSON.parse(row.perfil || '{}');
        if (data.contrato) {
          contratos.push({
            id_contrato: row.id_postulante,
            id_postulante: row.id_postulante,
            nombre_completo: data.nombre_completo || `${row.nombres} ${row.apellidos}`,
            tipo_contrato: data.contrato.tipo_contrato,
            fecha_inicio: data.contrato.fecha_inicio,
            fecha_termino: data.contrato.fecha_termino,
            salario: data.contrato.salario,
            cargo: data.contrato.cargo,
            area: data.contrato.area,
            modalidad: data.contrato.modalidad,
            periodo_prueba: data.contrato.periodo_prueba,
            beneficios: data.contrato.beneficios,
            estado: data.contrato.estado,
            fecha_creacion: data.contrato.fecha_creacion
          });
        }
      } catch (e) {}
    }
    return contratos;
  }

  static async actualizar(id: number, tipoContrato: string, fechaInicio: string, fechaTermino: string, salario: number, cargo: string, area: string, modalidad: string, periodoPrueba: string, beneficios: string, estado: string) {
    return this.crear(id, tipoContrato, fechaInicio, fechaTermino, salario, cargo, area, modalidad, periodoPrueba, beneficios, estado);
  }

  static async actualizarEstado(id: number, estado: string) {
    const [rows]: any = await pool.query('SELECT perfil FROM Postulante WHERE id_postulante = ?', [id]);
    if (rows.length === 0) return null;
    let data: any = {};
    try {
      data = JSON.parse(rows[0].perfil || '{}');
    } catch (e) {}
    if (data.contrato) {
      data.contrato.estado = estado;
    }
    return pool.query(
      'UPDATE Postulante SET perfil = ? WHERE id_postulante = ?',
      [JSON.stringify(data), id]
    );
  }

  static async firmarYContratar(idPostulante: number) {
    // 1. Obtener los datos del postulante y su contrato borrador/enviado
    const [rows]: any = await pool.query('SELECT perfil, nombres, apellidos FROM Postulante WHERE id_postulante = ?', [idPostulante]);
    if (rows.length === 0) throw new Error('Postulante no encontrado');
    
    let perfil: any = {};
    try {
      perfil = JSON.parse(rows[0].perfil || '{}');
    } catch (e) {}

    if (!perfil.contrato) throw new Error('No existe un contrato redactado para este postulante');

    // Actualizar estado del contrato a 'Firmado' y del postulante a 'Contratado'
    perfil.contrato.estado = 'Firmado';
    perfil.estado = 'Contratado';

    await pool.query(
      'UPDATE Postulante SET perfil = ? WHERE id_postulante = ?',
      [JSON.stringify(perfil), idPostulante]
    );

    // 2. Dar de alta en la tabla Empleado
    // Buscamos o creamos el Área por el nombre indicado en el contrato
    let idArea = 1;
    const [areaRows]: any = await pool.query('SELECT id_area FROM Area WHERE nombre_area = ?', [perfil.contrato.area]);
    if (areaRows.length > 0) {
      idArea = areaRows[0].id_area;
    } else {
      // Si no existe el área, la creamos
      const [insertArea]: any = await pool.query('INSERT INTO Area (nombre_area) VALUES (?)', [perfil.contrato.area]);
      idArea = insertArea.insertId;
    }

    // Insertar empleado
    const [empResult]: any = await pool.query(
      `INSERT INTO Empleado (dni, nombres, apellidos, correo, id_area, id_horario) 
       VALUES (?, ?, ?, ?, ?, 1)`,
      [perfil.dni || '00000000', rows[0].nombres, rows[0].apellidos, perfil.email || '', idArea]
    );
    const idEmpleado = empResult.insertId;

    // 3. Crear expediente de Contrato digital para el Empleado
    const rutaPdf = `/docs/contratos/${idEmpleado}_contrato.pdf`;
    await pool.query(
      `INSERT INTO Contrato (id_empleado, fecha_inicio, documento_pdf) VALUES (?, ?, ?)`,
      [idEmpleado, perfil.contrato.fecha_inicio, rutaPdf]
    );

    return idEmpleado;
  }
}
