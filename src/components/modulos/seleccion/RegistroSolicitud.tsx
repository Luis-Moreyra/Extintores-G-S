/**
 * @file RegistroSolicitud.tsx
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
import { registrarSolicitud, obtenerSolicitudes } from '@/controllers/seleccion.controller';
import { obtenerTodasLasAreas } from '@/controllers/empleado.controller';
import { AlertCircle, CheckCircle } from 'lucide-react';

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function RegistroSolicitud() {
  const [formData, setFormData] = useState({
    idArea: '',
    cargo: '',
    tipoContrato: 'Indefinido',
    vacantes: 1,
    salarioOfrecido: '',
    fechaInicio: '',
    requisitos: '',
    descripcionFunciones: '',
    justificacion: '',
  });

  const [areas, setAreas] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resAreas = await obtenerTodasLasAreas();
        if (resAreas.success && resAreas.areas) {
          setAreas(resAreas.areas);
        }

        const resSolicitudes = await obtenerSolicitudes();
        if (resSolicitudes.success) {
          setSolicitudes(resSolicitudes.data);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingInicial(false);
      }
    };

    cargarDatos();
  }, []);

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

    const result = await registrarSolicitud({
      idArea: parseInt(formData.idArea),
      cargo: formData.cargo,
      tipoContrato: formData.tipoContrato,
      vacantes: parseInt(formData.vacantes.toString()),
      salarioOfrecido: parseFloat(formData.salarioOfrecido),
      fechaInicio: formData.fechaInicio,
      requisitos: formData.requisitos,
      descripcionFunciones: formData.descripcionFunciones,
      justificacion: formData.justificacion,
    });

    setTipoMensaje(result.success ? 'success' : 'error');
    setMensaje(result.message);

    if (result.success) {
      setFormData({
        idArea: '',
        cargo: '',
        tipoContrato: 'Indefinido',
        vacantes: 1,
        salarioOfrecido: '',
        fechaInicio: '',
        requisitos: '',
        descripcionFunciones: '',
        justificacion: '',
      });

      const resSolicitudes = await obtenerSolicitudes();
      if (resSolicitudes.success) {
        setSolicitudes(resSolicitudes.data);
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
        <h3 className="text-lg font-semibold text-gray-800">Registrar Solicitud de Contratación</h3>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Área de solicitante *</label>
            <select
              name="idArea"
              value={formData.idArea}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            >
              <option value="">Seleccionar área</option>
              {areas.map(area => (
                <option key={area.id_area} value={area.id_area}>{area.nombre_area}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Solicitado *</label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de contrato *</label>
            <select
              name="tipoContrato"
              value={formData.tipoContrato}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            >
              <option value="Indefinido">Indefinido</option>
              <option value="Determinado">Determinado</option>
              <option value="Practicante">Practicante</option>
              <option value="Temporal">Temporal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vacantes *</label>
            <input
              type="number"
              name="vacantes"
              value={formData.vacantes}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salario ofrecido (S/.) *</label>
            <input
              type="number"
              name="salarioOfrecido"
              value={formData.salarioOfrecido}
              onChange={handleChange}
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio Deseada *</label>
            <input
              type="date"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos del cargo *</label>
          <textarea
            name="requisitos"
            value={formData.requisitos}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de funciones *</label>
          <textarea
            name="descripcionFunciones"
            value={formData.descripcionFunciones}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Justificación de la solicitud *</label>
          <textarea
            name="justificacion"
            value={formData.justificacion}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors font-medium"
        >
          {loading ? 'Registrando...' : 'Registrar Solicitud'}
        </button>
      </form>

      {/* Listado de solicitudes registradas */}
      {solicitudes.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Solicitudes Registradas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Cargo</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Vacantes</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Salario</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((sol: any) => (
                  <tr key={sol.id_solicitud} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{sol.cargo}</td>
                    <td className="px-4 py-3">{sol.vacantes}</td>
                    <td className="px-4 py-3">S/ {(typeof sol.salario_ofrecido === 'string' ? parseFloat(sol.salario_ofrecido) : sol.salario_ofrecido || 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{sol.estado}</span></td>
                    <td className="px-4 py-3">{new Date(sol.fecha_registro).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
