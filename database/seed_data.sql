-- ============================================================================
-- SCRIPT DE SIEMBRA DE DATOS HISTÓRICOS Y DE PRUEBA - EXTINTORES GS S.A.C.
-- Módulos: Asistencia, Empleados, Evaluaciones, Selección y Horarios
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Postulante;
TRUNCATE TABLE Convocatoria;
TRUNCATE TABLE Contrato;
TRUNCATE TABLE Evaluacion;
TRUNCATE TABLE Asistencia;
TRUNCATE TABLE Empleado;
TRUNCATE TABLE Horario;
TRUNCATE TABLE Area;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. INSERTAR ÁREAS
INSERT INTO Area (id_area, nombre_area) VALUES
(1, 'Trabajador'),
(2, 'Responsable de RRHH'),
(3, 'Jefe de Área'),
(4, 'Jefe de Área RRHH'),
(5, 'Administrador'),
(6, 'Operador de Planta');

-- 2. INSERTAR HORARIOS
INSERT INTO Horario (id_horario, nombre_turno, hora_entrada_oficial, hora_salida_oficial, tolerancia_minutos) VALUES
(1, 'Turno Mañana', '08:00:00', '17:00:00', 10),
(2, 'Turno Tarde', '14:00:00', '22:00:00', 10),
(3, 'Turno Noche', '22:00:00', '06:00:00', 15);

-- 3. INSERTAR EMPLEADOS
INSERT INTO Empleado (id_empleado, dni, nombres, apellidos, correo, id_area, id_horario) VALUES
(1, '71234567', 'Roberto', 'Gómez Bolaños', 'roberto.gomez@extintoresgs.com', 1, 1),
(2, '72345678', 'Carmen', 'Salinas Pérez', 'carmen.salinas@extintoresgs.com', 2, 1),
(3, '73456789', 'Ramón', 'Valdés Castillo', 'ramon.valdes@extintoresgs.com', 5, 1),
(4, '74567890', 'Florinda', 'Meza García', 'florinda.meza@extintoresgs.com', 3, 2),
(5, '75678901', 'Carlos', 'Villagrán Ruiz', 'carlos.villagran@extintoresgs.com', 4, 1),
(6, '76789012', 'María', 'Antonieta de las Nieves', 'maria.antonieta@extintoresgs.com', 1, 2),
(7, '77890123', 'Edgar', 'Vivar Portillo', 'edgar.vivar@extintoresgs.com', 6, 1),
(8, '78901234', 'Angelines', 'Fernández Abad', 'angelines.fernandez@extintoresgs.com', 1, 1),
(9, '79012345', 'Rubén', 'Aguirre Fuentes', 'ruben.aguirre@extintoresgs.com', 3, 1),
(10, '70123456', 'Horacio', 'Gómez Bolaños', 'horacio.gomez@extintoresgs.com', 6, 1);

-- 4. INSERTAR CONTRATOS
INSERT INTO Contrato (id_contrato, fecha_inicio, documento_pdf, id_empleado) VALUES
(1, '2025-01-15', '/docs/contratos/1_contrato.pdf', 1),
(2, '2025-02-01', '/docs/contratos/2_contrato.pdf', 2),
(3, '2024-11-10', '/docs/contratos/3_contrato.pdf', 3),
(4, '2025-03-01', '/docs/contratos/4_contrato.pdf', 4),
(5, '2025-04-15', '/docs/contratos/5_contrato.pdf', 5);

-- 5. INSERTAR CONVOCATORIAS
INSERT INTO Convocatoria (id_convocatoria, cargo, requisitos, fecha_publicacion) VALUES
(1, 'Técnico de Mantenimiento', '{"tipo":"Convocatoria","id_solicitud":1,"titulo":"Búsqueda de Técnico de Extintores Senior","fecha_cierre":"2026-07-15","descripcion":"Se requiere técnico calificado.","canales":["LinkedIn","Computrabajo"],"estado":"Activa"}', '2026-06-01'),
(2, 'Asistente Administrativo', '{"tipo":"Convocatoria","id_solicitud":2,"titulo":"Asistente de Facturación y Compras","fecha_cierre":"2026-07-20","descripcion":"Manejo de facturas e inventario.","canales":["LinkedIn","Bumeran"],"estado":"Activa"}', '2026-06-05');

-- 6. INSERTAR POSTULANTES
INSERT INTO Postulante (id_postulante, nombres, apellidos, perfil, puntuacion_final, id_convocatoria) VALUES
(1, 'Luis', 'Alvarado Gómez', '{"nombre_completo":"Luis Alvarado Gómez","dni":"78234567","email":"luis.alvarado@gmail.com","telefono":"999888777","cv":"/cvs/cv_luis.pdf","estado":"Aprobado","fecha_registro":"2026-06-10T10:00:00Z"}', 17.50, 1),
(2, 'Ana', 'Suárez Ríos', '{"nombre_completo":"Ana Suárez Ríos","dni":"79345678","email":"ana.suarez@outlook.com","telefono":"988777666","cv":"/cvs/cv_ana.pdf","estado":"Por revisar","fecha_registro":"2026-06-12T11:30:00Z"}', 14.00, 1),
(3, 'Jorge', 'Mendoza Vera', '{"nombre_completo":"Jorge Mendoza Vera","dni":"74456789","email":"jorge.mendoza@yahoo.com","telefono":"977666555","cv":"/cvs/cv_jorge.pdf","estado":"Rechazado","fecha_registro":"2026-06-15T09:00:00Z"}', 16.00, 2),
(4, 'Sofía', 'Castro Rojas', '{"nombre_completo":"Sofía Castro Rojas","dni":"72567890","email":"sofia.castro@gmail.com","telefono":"966555444","cv":"/cvs/cv_sofia.pdf","estado":"Aprobado","fecha_registro":"2026-06-18T08:00:00Z"}', 19.50, 2);

-- 7. INSERTAR EVALUACIONES DE DESEMPEÑO Y ENTREVISTAS
INSERT INTO Evaluacion (id_evaluacion, tipo_evaluacion, fecha, puntaje, observaciones, id_empleado, id_postulante) VALUES
(1, 'Desempeño', '2026-06-25 10:00:00', 4.20, '{"periodo":"2026-I","id_evaluador":5,"notas_criterios":{"calidad":4,"equipo":4,"responsabilidad":5,"iniciativa":4,"adaptabilidad":4},"comentarios_detalle":{"fortalezas":"Gran responsabilidad y puntualidad.","mejora":"Aportar más ideas en las reuniones.","general":"Muy buen desempeño general."}}', 1, NULL),
(2, 'Desempeño', '2026-06-25 11:30:00', 3.80, '{"periodo":"2026-I","id_evaluador":5,"notas_criterios":{"calidad":4,"equipo":3,"responsabilidad":4,"iniciativa":4,"adaptabilidad":4},"comentarios_detalle":{"fortalezas":"Orientación a resultados.","mejora":"Trabajo colaborativo.","general":"Firme en sus decisiones."}}', 2, NULL),
(3, 'Desempeño', '2026-06-26 09:00:00', 4.80, '{"periodo":"2026-I","id_evaluador":5,"notas_criterios":{"calidad":5,"equipo":5,"responsabilidad":4,"iniciativa":5,"adaptabilidad":5},"comentarios_detalle":{"fortalezas":"Excelente proactividad y soluciones rápidas.","mejora":"Organización de agenda.","general":"Colaborador estrella del área."}}', 3, NULL),
(4, 'Desempeño', '2026-06-26 14:00:00', 4.40, '{"periodo":"2026-I","id_evaluador":3,"notas_criterios":{"calidad":4,"equipo":4,"responsabilidad":5,"iniciativa":4,"adaptabilidad":5},"comentarios_detalle":{"fortalezas":"Altamente disciplinada y atenta al detalle.","mejora":"Flexibilidad de criterio.","general":"Desempeño sobresaliente."}}', 4, NULL),
(5, 'Desempeño', '2026-06-27 10:00:00', 3.20, '{"periodo":"2026-I","id_evaluador":3,"notas_criterios":{"calidad":3,"equipo":3,"responsabilidad":3,"iniciativa":3,"adaptabilidad":4},"comentarios_detalle":{"fortalezas":"Adaptable a nuevas tareas.","mejora":"Cumplimiento de plazos.","general":"Desempeño promedio estable."}}', 5, NULL),
(6, 'Desempeño', '2026-06-27 11:30:00', 4.60, '{"periodo":"2026-I","id_evaluador":4,"notas_criterios":{"calidad":5,"equipo":4,"responsabilidad":5,"iniciativa":4,"adaptabilidad":5},"comentarios_detalle":{"fortalezas":"Eficiente y con alto ritmo de trabajo.","mejora":"Comunicación en equipo.","general":"Liderazgo técnico fuerte."}}', 6, NULL),
(7, 'Desempeño', '2026-06-28 09:00:00', 4.00, '{"periodo":"2026-I","id_evaluador":4,"notas_criterios":{"calidad":4,"equipo":4,"responsabilidad":4,"iniciativa":4,"adaptabilidad":4},"comentarios_detalle":{"fortalezas":"Constancia y buena predisposición.","mejora":"Aprender nuevas herramientas.","general":"Buen colaborador."}}', 7, NULL),
(8, 'Desempeño', '2026-06-28 14:00:00', 3.40, '{"periodo":"2026-I","id_evaluador":9,"notas_criterios":{"calidad":3,"equipo":4,"responsabilidad":3,"iniciativa":3,"adaptabilidad":4},"comentarios_detalle":{"fortalezas":"Compañerismo.","mejora":"Velocidad de ejecución.","general":"Desempeño aceptable."}}', 8, NULL),
(9, 'Entrevista', '2026-06-20 10:00:00', 4.50, '{"hora":"10:00","tipo_entrevista":"Virtual","entrevistadores":"Carmen Salinas","enlace_reunion":"https://zoom.us/j/123456","notes":"Excelente actitud y conocimientos técnicos.","estado":"Programada"}', NULL, 1),
(10, 'Entrevista', '2026-06-20 11:30:00', 3.50, '{"hora":"11:30","tipo_entrevista":"Presencial","entrevistadores":"Carmen Salinas","enlace_reunion":"","notes":"Respuestas correctas, algo nervioso.","estado":"Programada"}', NULL, 2);

-- 8. INSERTAR ASISTENCIAS HISTÓRICAS DE JUNIO 2026
INSERT INTO Asistencia (id_empleado, fecha, hora_entrada, hora_salida, estado_asistencia, observacion_justificacion) VALUES
(1, '2026-06-16', '07:50:00', '17:13:00', 'Presente', NULL),
(2, '2026-06-16', '07:51:00', '17:07:00', 'Presente', NULL),
(3, '2026-06-16', '07:45:00', '17:06:00', 'Presente', NULL),
(4, '2026-06-16', '13:48:00', '22:10:00', 'Presente', NULL),
(5, '2026-06-16', '07:49:00', '17:00:00', 'Presente', NULL),
(6, '2026-06-16', '13:46:00', '22:02:00', 'Presente', NULL),
(7, '2026-06-16', '07:53:00', '17:15:00', 'Presente', NULL),
(8, '2026-06-16', '07:52:00', '17:02:00', 'Presente', NULL),
(9, '2026-06-16', '07:48:00', '17:13:00', 'Presente', NULL),
(10, '2026-06-16', '08:45:00', '17:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(1, '2026-06-17', '07:46:00', '17:04:00', 'Presente', NULL),
(2, '2026-06-17', '07:48:00', '17:07:00', 'Presente', NULL),
(3, '2026-06-17', '07:52:00', '17:06:00', 'Presente', NULL),
(4, '2026-06-17', '13:48:00', '22:02:00', 'Presente', NULL),
(5, '2026-06-17', '07:54:00', '17:08:00', 'Presente', NULL),
(6, '2026-06-17', '13:56:00', '22:12:00', 'Presente', NULL),
(7, '2026-06-17', '07:52:00', '17:15:00', 'Presente', NULL),
(8, '2026-06-17', '07:53:00', '17:03:00', 'Presente', NULL),
(9, '2026-06-17', '08:34:00', '17:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(10, '2026-06-17', '07:56:00', '17:06:00', 'Presente', NULL),
(1, '2026-06-18', '07:50:00', '17:02:00', 'Presente', NULL),
(2, '2026-06-18', '07:47:00', '17:14:00', 'Presente', NULL),
(3, '2026-06-18', '07:59:00', '17:10:00', 'Presente', NULL),
(4, '2026-06-18', '13:50:00', '22:00:00', 'Presente', NULL),
(5, '2026-06-18', '07:57:00', '17:01:00', 'Presente', NULL),
(6, '2026-06-18', '14:33:00', '22:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(7, '2026-06-18', '07:59:00', '17:10:00', 'Presente', NULL),
(8, '2026-06-18', '07:45:00', '17:07:00', 'Presente', NULL),
(9, '2026-06-18', '07:51:00', '17:03:00', 'Presente', NULL),
(10, '2026-06-18', '08:12:00', '17:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(1, '2026-06-19', '07:47:00', '17:15:00', 'Presente', NULL),
(2, '2026-06-19', '07:45:00', '17:13:00', 'Presente', NULL),
(3, '2026-06-19', '08:35:00', '17:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(4, '2026-06-19', '13:47:00', '22:02:00', 'Presente', NULL),
(5, '2026-06-19', '08:41:00', '17:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(6, '2026-06-19', '13:48:00', '22:03:00', 'Presente', NULL),
(7, '2026-06-19', '07:58:00', '17:04:00', 'Presente', NULL),
(8, '2026-06-19', '07:54:00', '17:05:00', 'Presente', NULL),
(9, '2026-06-19', '07:48:00', '17:10:00', 'Presente', NULL),
(10, '2026-06-19', '07:59:00', '17:00:00', 'Presente', NULL),
(1, '2026-06-20', '07:50:00', '17:02:00', 'Presente', NULL),
(2, '2026-06-20', '07:48:00', '17:03:00', 'Presente', NULL),
(3, '2026-06-20', '08:29:00', '17:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(4, '2026-06-20', '13:59:00', '22:06:00', 'Presente', NULL),
(5, '2026-06-20', '07:55:00', '17:11:00', 'Presente', NULL),
(6, '2026-06-20', '13:50:00', '22:09:00', 'Presente', NULL),
(7, '2026-06-20', '08:21:00', '17:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(8, '2026-06-20', '07:55:00', '17:05:00', 'Presente', NULL),
(9, '2026-06-20', '07:58:00', '17:00:00', 'Presente', NULL),
(10, '2026-06-20', '07:47:00', '17:14:00', 'Presente', NULL),
(1, '2026-06-23', '07:45:00', '17:09:00', 'Presente', NULL),
(2, '2026-06-23', '07:45:00', '17:10:00', 'Presente', NULL),
(3, '2026-06-23', '07:50:00', '17:06:00', 'Presente', NULL),
(4, '2026-06-23', '14:00:00', '22:07:00', 'Presente', NULL),
(5, '2026-06-23', '07:46:00', '17:03:00', 'Presente', NULL),
(6, '2026-06-23', '13:49:00', '22:09:00', 'Presente', NULL),
(7, '2026-06-23', '07:55:00', '17:11:00', 'Presente', NULL),
(8, '2026-06-23', '07:49:00', '17:02:00', 'Presente', NULL),
(9, '2026-06-23', '07:47:00', '17:07:00', 'Presente', NULL),
(10, '2026-06-23', '08:35:00', '17:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(1, '2026-06-24', '07:49:00', '17:07:00', 'Presente', NULL),
(2, '2026-06-24', '07:55:00', '17:00:00', 'Presente', NULL),
(3, '2026-06-24', '07:52:00', '17:10:00', 'Presente', NULL),
(4, '2026-06-24', '13:50:00', '22:10:00', 'Presente', NULL),
(5, '2026-06-24', '07:48:00', '17:14:00', 'Presente', NULL),
(6, '2026-06-24', '13:58:00', '22:13:00', 'Presente', NULL),
(7, '2026-06-24', '08:00:00', '17:12:00', 'Presente', NULL),
(8, '2026-06-24', '07:50:00', '17:10:00', 'Presente', NULL),
(9, '2026-06-24', '07:55:00', '17:09:00', 'Presente', NULL),
(10, '2026-06-24', '07:48:00', '17:04:00', 'Presente', NULL),
(1, '2026-06-25', '07:45:00', '17:06:00', 'Presente', NULL),
(2, '2026-06-25', '08:05:00', '17:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(3, '2026-06-25', '07:49:00', '17:14:00', 'Presente', NULL),
(4, '2026-06-25', '13:59:00', '22:13:00', 'Presente', NULL),
(5, '2026-06-25', '07:47:00', '17:10:00', 'Presente', NULL),
(6, '2026-06-25', '14:36:00', '22:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(7, '2026-06-25', '07:48:00', '17:10:00', 'Presente', NULL),
(8, '2026-06-25', '07:46:00', '17:07:00', 'Presente', NULL),
(9, '2026-06-25', '08:01:00', '17:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(10, '2026-06-25', '07:51:00', '17:14:00', 'Presente', NULL),
(1, '2026-06-26', '07:58:00', '17:06:00', 'Presente', NULL),
(2, '2026-06-26', '07:45:00', '17:03:00', 'Presente', NULL),
(3, '2026-06-26', '07:49:00', '17:13:00', 'Presente', NULL),
(4, '2026-06-26', NULL, NULL, 'Falta', 'Inasistencia injustificada.'),
(5, '2026-06-26', '07:51:00', '17:00:00', 'Presente', NULL),
(6, '2026-06-26', '13:50:00', '22:03:00', 'Presente', NULL),
(7, '2026-06-26', '07:56:00', '17:05:00', 'Presente', NULL),
(8, '2026-06-26', '07:53:00', '17:09:00', 'Presente', NULL),
(9, '2026-06-26', '07:58:00', '17:13:00', 'Presente', NULL),
(10, '2026-06-26', '07:50:00', '17:00:00', 'Presente', NULL),
(1, '2026-06-27', NULL, NULL, 'Falta', 'Inasistencia injustificada.'),
(2, '2026-06-27', '07:49:00', '17:04:00', 'Presente', NULL),
(3, '2026-06-27', '08:37:00', '17:00:00', 'Tardanza', 'Ingreso fuera del horario de tolerancia.'),
(4, '2026-06-27', '13:57:00', '22:06:00', 'Presente', NULL),
(5, '2026-06-27', '07:55:00', '17:14:00', 'Presente', NULL),
(6, '2026-06-27', NULL, NULL, 'Falta', 'Inasistencia injustificada.'),
(7, '2026-06-27', '07:50:00', '17:06:00', 'Presente', NULL),
(8, '2026-06-27', '07:56:00', '17:05:00', 'Presente', NULL),
(9, '2026-06-27', '07:46:00', '17:05:00', 'Presente', NULL),
(10, '2026-06-27', '08:00:00', '17:13:00', 'Presente', NULL),
(1, '2026-06-30', '07:54:00', '17:11:00', 'Presente', NULL),
(2, '2026-06-30', '07:50:00', '17:00:00', 'Presente', NULL),
(3, '2026-06-30', '08:00:00', '17:03:00', 'Presente', NULL),
(4, '2026-06-30', '13:55:00', '22:01:00', 'Presente', NULL),
(5, '2026-06-30', '07:47:00', '17:07:00', 'Presente', NULL),
(6, '2026-06-30', NULL, NULL, 'Justificado', 'Licencia por salud con certificado médico presentado.'),
(7, '2026-06-30', '07:57:00', '17:10:00', 'Presente', NULL),
(8, '2026-06-30', '07:56:00', '17:11:00', 'Presente', NULL),
(9, '2026-06-30', '07:50:00', '17:01:00', 'Presente', NULL),
(10, '2026-06-30', '07:46:00', '17:03:00', 'Presente', NULL);
