/**
 * @file PublicarConvocatoria.tsx
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

import { useState, useEffect } from 'react';
import { publicarConvocatoria, obtenerSolicitudes, obtenerConvocatorias } from '@/controllers/seleccion.controller';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function PublicarConvocatoria() {
  const [formData, setFormData] = useState({
    idSolicitud: '',
    titulo: '',
    fechaCierre: '',
    descripcion: '',
    canales: [] as string[],
  });

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [convocatorias, setConvocatorias] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);

  const canalesDisponibles = ['Portal Web Corporativo', 'LinkedIn', 'Computrabajo', 'Bumeran', 'Indeed'];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resSolicitudes = await obtenerSolicitudes();
        if (resSolicitudes.success) {
          setSolicitudes(resSolicitudes.data);
        }

        const resConvocatorias = await obtenerConvocatorias();
        if (resConvocatorias.success) {
          setConvocatorias(resConvocatorias.data);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingInicial(false);
      }
    };

    cargarDatos();
  }, []);

  // ==========================================
  // MANEJADORES DE EVENTOS Y FORMULARIOS
  // ==========================================

  /**
   * Maneja los cambios en los inputs del formulario.
   * Auto-popula el título de publicación cuando se selecciona una solicitud.
   */
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'idSolicitud' && value) {
        const sol = solicitudes.find(s => String(s.id_solicitud) === value);
        if (sol) {
          updated.titulo = `Convocatoria para el puesto de ${sol.cargo}`;
        }
      }
      return updated;
    });
  };

  /**
   * Agrega o remueve un canal de publicación de la lista seleccionada.
   */
  const toggleCanal = (canal: string) => {
    setFormData(prev => ({
      ...prev,
      canales: prev.canales.includes(canal)
        ? prev.canales.filter(c => c !== canal)
        : [...prev.canales, canal]
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    const result = await publicarConvocatoria({
      idSolicitud: parseInt(formData.idSolicitud),
      titulo: formData.titulo,
      fechaCierre: formData.fechaCierre,
      descripcion: formData.descripcion,
      canales: formData.canales,
    });

    setTipoMensaje(result.success ? 'success' : 'error');
    setMensaje(result.message);

    if (result.success) {
      setFormData({
        idSolicitud: '',
        titulo: '',
        fechaCierre: '',
        descripcion: '',
        canales: [],
      });

      const resConvocatorias = await obtenerConvocatorias();
      if (resConvocatorias.success) {
        setConvocatorias(resConvocatorias.data);
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
        <h3 className="text-lg font-semibold text-gray-800">Publicar Convocatoria</h3>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Solicitud de contratación *</label>
            <select
              name="idSolicitud"
              value={formData.idSolicitud}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            >
              <option value="">Seleccionar solicitud</option>
              {solicitudes.map(sol => (
                <option key={sol.id_solicitud} value={sol.id_solicitud}>{sol.cargo} - {sol.vacantes} vacantes</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título de publicación *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de cierre *</label>
            <input
              type="date"
              name="fechaCierre"
              value={formData.fechaCierre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción adicional</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Canales de publicación *</label>
          <div className="grid grid-cols-2 gap-3">
            {canalesDisponibles.map(canal => (
              <label key={canal} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.canales.includes(canal)}
                  onChange={() => toggleCanal(canal)}
                  className="w-4 h-4 accent-red-600"
                />
                <span className="text-sm text-gray-700">{canal}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors font-medium"
        >
          {loading ? 'Publicando...' : 'Publicar Convocatoria'}
        </button>
      </form>

      {/* Listado de convocatorias */}
      {convocatorias.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Convocatorias Publicadas</h3>
          <div className="space-y-3">
            {convocatorias.map((conv: any) => (
              <div key={conv.id_convocatoria} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{conv.titulo}</h4>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">{conv.estado}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2"><strong>Cargo:</strong> {conv.cargo}</p>
                <p className="text-sm text-gray-600"><strong>Cierre:</strong> {new Date(conv.fecha_cierre).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
