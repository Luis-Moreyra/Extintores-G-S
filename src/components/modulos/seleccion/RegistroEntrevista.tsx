/**
 * @file RegistroEntrevista.tsx
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
import { registrarEntrevista, obtenerEntrevistas, obtenerPostulantes, obtenerConvocatorias, obtenerTodosLosPostulantesAction } from '@/controllers/seleccion.controller';
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react';

export default function RegistroEntrevista() {
  const [formData, setFormData] = useState({
    idPostulante: '',
    fecha: '',
    hora: '',
    tipoEntrevista: 'Virtual',
    entrevistadores: '',
    enlaceReunion: '',
    notas: '',
  });

  const [convocatorias, setConvocatorias] = useState<any[]>([]);
  const [postulantes, setPostulantes] = useState<any[]>([]);
  const [entrevistas, setEntrevistas] = useState<any[]>([]);
  const [idConvocatoriaSeleccionada, setIdConvocatoriaSeleccionada] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);

  // ==========================================
  // METADATOS Y VARIABLES DE CONFIGURACIÓN
  // ==========================================
  
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

        const resEntrevistas = await obtenerEntrevistas();
        if (resEntrevistas.success) {
          setEntrevistas(resEntrevistas.data);
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
    cargarPostulantesAprobados();
  }, []);

  const cargarPostulantesAprobados = async () => {
    try {
      const res = await obtenerTodosLosPostulantesAction();
      if (res.success) {
        const aprobados = res.data.filter((p: any) => p.estado === 'Aprobado');
        setPostulantes(aprobados);
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    const result = await registrarEntrevista({
      idPostulante: parseInt(formData.idPostulante),
      fecha: formData.fecha,
      hora: formData.hora,
      tipoEntrevista: formData.tipoEntrevista,
      entrevistadores: formData.entrevistadores,
      enlaceReunion: formData.enlaceReunion,
      notas: formData.notas,
    });

    setTipoMensaje(result.success ? 'success' : 'error');
    setMensaje(result.message);

    if (result.success) {
      setFormData({
        idPostulante: '',
        fecha: '',
        hora: '',
        tipoEntrevista: 'Virtual',
        entrevistadores: '',
        enlaceReunion: '',
        notas: '',
      });

      const resEntrevistas = await obtenerEntrevistas();
      if (resEntrevistas.success) {
        setEntrevistas(resEntrevistas.data);
      }
    }

    setLoading(false);
    setTimeout(() => setMensaje(''), 5000);
  };

  if (loadingInicial) {
    return <div className="text-center text-gray-500">Cargando...</div>;
  }

  const proximasEntrevistas = entrevistas
    .filter(e => e.estado !== 'Cancelada')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Registrar Entrevista</h3>

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

        <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de entrevista *</label>
            <select
              name="tipoEntrevista"
              value={formData.tipoEntrevista}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            >
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
              <option value="Telefónica">Telefónica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
            <input
              type="time"
              name="hora"
              value={formData.hora}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Entrevistadores *</label>
            <input
              type="text"
              name="entrevistadores"
              value={formData.entrevistadores}
              onChange={handleChange}
              placeholder="Nombre del entrevistador(es)"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>

          {formData.tipoEntrevista !== 'Presencial' && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Enlace de reunión</label>
              <input
                type="url"
                name="enlaceReunion"
                value={formData.enlaceReunion}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas/Instrucciones</label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors font-medium"
        >
          {loading ? 'Programando...' : 'Programar Entrevista'}
        </button>
      </form>

      {/* Próximas entrevistas */}
      {proximasEntrevistas.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Próximas Entrevistas
          </h3>
          <div className="space-y-3">
            {proximasEntrevistas.map((ent: any) => (
              <div key={ent.id_entrevista} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{ent.nombre_completo}</h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{ent.tipo_entrevista}</span>
                </div>
                <p className="text-sm text-gray-600"><strong>Fecha:</strong> {new Date(ent.fecha).toLocaleDateString()} - {ent.hora}</p>
                <p className="text-sm text-gray-600"><strong>Entrevistador(es):</strong> {ent.entrevistadores}</p>
                {ent.enlace_reunion && <p className="text-sm text-gray-600"><strong>Enlace:</strong> <a href={ent.enlace_reunion} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Ver enlace</a></p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
