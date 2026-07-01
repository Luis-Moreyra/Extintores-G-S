/**
 * @file EvaluarCandidatos.tsx
 * @description Componente de interfaz de usuario correspondiente a los procesos de Selección, Convocatoria y Contratación de Postulantes.
 * @module ExtintoresGS/components
 * @copyright Extintores GS S.A.C. Todos los derechos reservados.
 * 
 * ============================================================================
 * SECCIÓN GENERAL DE DOCUMENTACIÓN Y RESUMEN DE FUNCIONES:
 * - Provee control reactivo y encapsulación de lógica.
 * - Asegura la consistencia en el tipado y llamado de las consultas SQL/Actions.
 * ============================================================================
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { evaluarCandidato, obtenerEvaluaciones, obtenerPostulantes, obtenerConvocatorias, obtenerTodosLosPostulantesAction } from '@/controllers/seleccion.controller';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function EvaluarCandidatos() {
  const [formData, setFormData] = useState({
    idPostulante: '',
    criterios: JSON.stringify({
      criterio1: 0,
      criterio2: 0,
      criterio3: 0,
      criterio4: 0,
      criterio5: 0,
    }),
    fortalezas: '',
    areasMejora: '',
    comentarios: '',
    recomendacion: 'Considerar' as 'Rechazar' | 'Considerar' | 'Recomendar' | 'Recomendar Fuertemente',
  });

  const [criteriosObj, setCriteriosObj] = useState({
    criterio1: 0,
    criterio2: 0,
    criterio3: 0,
    criterio4: 0,
    criterio5: 0,
  });

  const [convocatorias, setConvocatorias] = useState<any[]>([]);
  const [postulantes, setPostulantes] = useState<any[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [idConvocatoriaSeleccionada, setIdConvocatoriaSeleccionada] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);

  // ==========================================
  // METADATOS Y VARIABLES DE CONFIGURACIÓN
  // ==========================================
  const criteriosDisponibles = [
    { id: 'criterio1', nombre: 'Experiencia Técnica' },
    { id: 'criterio2', nombre: 'Habilidades Blandas' },
    { id: 'criterio3', nombre: 'Adaptabilidad' },
    { id: 'criterio4', nombre: 'Capacidad Analítica' },
    { id: 'criterio5', nombre: 'Motivación Profesional' },
  ];

  /**
   * Obtiene la información detallada del candidato seleccionado actualmente.
   */
  const candInfo = useMemo(() => {
    if (!formData.idPostulante) return null;
    return postulantes.find(p => String(p.id_postulante) === formData.idPostulante) || null;
  }, [formData.idPostulante, postulantes]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resConvocatorias = await obtenerConvocatorias();
        if (resConvocatorias.success) {
          setConvocatorias(resConvocatorias.data);
          if (resConvocatorias.data.length > 0) {
            setIdConvocatoriaSeleccionada(resConvocatorias.data[0].id_convocatoria);
          }
        }

        const resEvaluaciones = await obtenerEvaluaciones();
        if (resEvaluaciones.success) {
          setEvaluaciones(resEvaluaciones.data);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingInicial(false);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    cargarPostulantesEntrevistados();
  }, []);

  const cargarPostulantesEntrevistados = async () => {
    try {
      const res = await obtenerTodosLosPostulantesAction();
      if (res.success) {
        const entrevistados = res.data.filter((p: any) => p.estado === 'Aprobado');
        setPostulantes(entrevistados);
      }
    } catch (error) {
      console.error('Error cargando postulantes:', error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCriterioChange = (criterio: string, valor: number) => {
    const nuevoCriterios = { ...criteriosObj, [criterio]: valor };
    setCriteriosObj(nuevoCriterios);
    setFormData(prev => ({
      ...prev,
      criterios: JSON.stringify(nuevoCriterios)
    }));
  };

  const puntuacionTotal = Object.values(criteriosObj).reduce((a, b) => a + b, 0);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    if (puntuacionTotal === 0) {
      setTipoMensaje('error');
      setMensaje('Debe asignar puntuación a todos los criterios de evaluación');
      setLoading(false);
      setTimeout(() => setMensaje(''), 5000);
      return;
    }

    const result = await evaluarCandidato({
      idPostulante: parseInt(formData.idPostulante),
      criterios: formData.criterios,
      fortalezas: formData.fortalezas,
      areasMejora: formData.areasMejora,
      comentarios: formData.comentarios,
      recomendacion: formData.recomendacion,
      puntuacionTotal: puntuacionTotal,
    });

    setTipoMensaje(result.success ? 'success' : 'error');
    setMensaje(result.message);

    if (result.success) {
      setFormData({
        idPostulante: '',
        criterios: JSON.stringify({
          criterio1: 0,
          criterio2: 0,
          criterio3: 0,
          criterio4: 0,
          criterio5: 0,
        }),
        fortalezas: '',
        areasMejora: '',
        comentarios: '',
        recomendacion: 'Considerar',
      });
      setCriteriosObj({
        criterio1: 0,
        criterio2: 0,
        criterio3: 0,
        criterio4: 0,
        criterio5: 0,
      });

      const resEvaluaciones = await obtenerEvaluaciones();
      if (resEvaluaciones.success) {
        setEvaluaciones(resEvaluaciones.data);
      }
    }

    setLoading(false);
    setTimeout(() => setMensaje(''), 5000);
  };

  if (loadingInicial) {
    return <div className="text-center text-gray-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Evaluar Candidatos</h3>

        {mensaje && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${tipoMensaje === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {tipoMensaje === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {mensaje}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Candidato *</label>
          <select
            name="idPostulante"
            value={formData.idPostulante}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          >
            <option value="">Seleccionar candidato</option>
            {postulantes.map(post => (
              <option key={post.id_postulante} value={post.id_postulante}>{post.nombre_completo}</option>
            ))}
          </select>
          {candInfo && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs animate-in fade-in duration-300">
              <div className="flex justify-between"><span className="text-gray-400 font-bold">DNI:</span> <span className="font-bold text-gray-700">{candInfo.dni || '--'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400 font-bold">Correo:</span> <span className="font-bold text-gray-500">{candInfo.email || '--'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400 font-bold">Teléfono:</span> <span className="font-bold text-gray-700">{candInfo.telefono || '--'}</span></div>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-4">Criterios de Evaluación (Escala 1-5)</h4>
          <div className="space-y-3">
            {criteriosDisponibles.map(crit => (
              <div key={crit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-700">{crit.nombre}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(puntuacion => (
                    <button
                      key={puntuacion}
                      type="button"
                      onClick={() => handleCriterioChange(crit.id, puntuacion)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                        criteriosObj[crit.id as keyof typeof criteriosObj] === puntuacion
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {puntuacion}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600"><strong>Puntuación Total:</strong> {puntuacionTotal} / 25</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fortalezas identificadas</label>
          <textarea
            name="fortalezas"
            value={formData.fortalezas}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Áreas de mejora</label>
          <textarea
            name="areasMejora"
            value={formData.areasMejora}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios adicionales</label>
          <textarea
            name="comentarios"
            value={formData.comentarios}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recomendación Final *</label>
          <select
            name="recomendacion"
            value={formData.recomendacion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          >
            <option value="Rechazar">Rechazar</option>
            <option value="Considerar">Considerar</option>
            <option value="Recomendar">Recomendar</option>
            <option value="Recomendar Fuertemente">Recomendar Fuertemente</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors font-medium"
        >
          {loading ? 'Enviando...' : 'Enviar Evaluación'}
        </button>
      </form>
    </div>
  );
}
