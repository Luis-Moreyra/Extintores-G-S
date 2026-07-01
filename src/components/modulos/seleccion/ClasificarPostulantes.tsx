/**
 * @file ClasificarPostulantes.tsx
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
import { obtenerConvocatorias, obtenerPostulantes, clasificarPostulante, contarPostulantes, registrarPostulanteAction } from '@/controllers/seleccion.controller';
import { CheckCircle, XCircle } from 'lucide-react';
import Toast from '@/components/ui/Toast';

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function ClasificarPostulantes() {
  const [convocatorias, setConvocatorias] = useState<any[]>([]);
  const [postulantes, setPostulantes] = useState<any[]>([]);
  const [conteosActuales, setConteosActuales] = useState({ total: 0, porRevisar: 0, aprobados: 0, rechazados: 0 });
  const [idConvocatoriaSeleccionada, setIdConvocatoriaSeleccionada] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Estados para registro manual de postulante
  const [mostrarForm, setMostrarForm] = useState(false);
  const [postulanteForm, setPostulanteForm] = useState({
    nombreCompleto: '',
    dni: '',
    email: '',
    telefono: '',
    cv: '',
  });
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    const cargarConvocatorias = async () => {
      try {
        const resConvocatorias = await obtenerConvocatorias();
        if (resConvocatorias.success) {
          setConvocatorias(resConvocatorias.data);
          if (resConvocatorias.data.length > 0) {
            setIdConvocatoriaSeleccionada(resConvocatorias.data[0].id_convocatoria);
          }
        }
      } catch (error) {
        console.error('Error cargando convocatorias:', error);
      } finally {
        setLoadingInicial(false);
      }
    };

    cargarConvocatorias();
  }, []);

  useEffect(() => {
    if (idConvocatoriaSeleccionada) {
      cargarPostulantes();
    }
  }, [idConvocatoriaSeleccionada]);

  const cargarPostulantes = async () => {
    try {
      const res = await obtenerPostulantes(parseInt(idConvocatoriaSeleccionada));
      if (res.success) {
        setPostulantes(res.data);
      }

      const resCont = await contarPostulantes(parseInt(idConvocatoriaSeleccionada));
      if (resCont.success) {
        setConteosActuales(resCont.data);
      }
    } catch (error) {
      console.error('Error cargando postulantes:', error);
    }
  };

  const handleClasificar = async (idPostulante: number, estado: 'Aprobado' | 'Rechazado') => {
    setLoading(true);
    const result = await clasificarPostulante(idPostulante, estado);
    if (result.success) {
      await cargarPostulantes();
    }
    setLoading(false);
  };

  const handleCrearPostulante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idConvocatoriaSeleccionada) {
      setToast({ message: 'Seleccione una convocatoria primero.', type: 'warning' });
      return;
    }
    setLoading(true);
    setFormMsg('');
    const res = await registrarPostulanteAction({
      idConvocatoria: parseInt(idConvocatoriaSeleccionada),
      ...postulanteForm
    });
    setLoading(false);
    if (res.success) {
      setFormMsg('Postulante registrado con éxito.');
      setPostulanteForm({ nombreCompleto: '', dni: '', email: '', telefono: '', cv: '' });
      await cargarPostulantes();
      setTimeout(() => setFormMsg(''), 5000);
    } else {
      setFormMsg('Error: ' + res.message);
    }
  };

  const postulantesFiltrados = postulantes.filter(p => {
    const cumpleEstado = !filtroEstado || p.estado === filtroEstado;
    const cumpleNombre = !filtroNombre || p.nombre_completo.toLowerCase().includes(filtroNombre.toLowerCase());
    return cumpleEstado && cumpleNombre;
  });

  if (loadingInicial) {
    return <div className="text-center text-gray-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Clasificar Postulantes</h3>

      {/* Selección de convocatoria */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Convocatoria</label>
          <select
            value={idConvocatoriaSeleccionada}
            onChange={(e) => setIdConvocatoriaSeleccionada(e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          >
            {convocatorias.map(conv => (
              <option key={conv.id_convocatoria} value={conv.id_convocatoria}>{conv.titulo}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setMostrarForm(!mostrarForm)}
          className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition-all text-sm flex items-center gap-2"
        >
          {mostrarForm ? '✕ Cerrar Registro' : '➕ Registrar Postulante Manual'}
        </button>
      </div>

      {/* Formulario de registro de postulante */}
      {mostrarForm && (
        <form onSubmit={handleCrearPostulante} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 mb-6">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Registrar Nuevo Candidato</h4>
          {formMsg && (
            <div className={`p-3 rounded-lg text-xs font-semibold ${formMsg.includes('éxito') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {formMsg}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Pérez"
                value={postulanteForm.nombreCompleto}
                onChange={e => setPostulanteForm({...postulanteForm, nombreCompleto: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1">DNI *</label>
              <input
                type="text"
                required
                maxLength={8}
                placeholder="8 dígitos"
                value={postulanteForm.dni}
                onChange={e => setPostulanteForm({...postulanteForm, dni: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                required
                placeholder="correo@ejemplo.com"
                value={postulanteForm.email}
                onChange={e => setPostulanteForm({...postulanteForm, email: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1">Teléfono *</label>
              <input
                type="text"
                required
                placeholder="999888777"
                value={postulanteForm.telefono}
                onChange={e => setPostulanteForm({...postulanteForm, telefono: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1">Enlace a CV (Opcional)</label>
            <input
              type="text"
              placeholder="https://drive.google.com/..."
              value={postulanteForm.cv}
              onChange={e => setPostulanteForm({...postulanteForm, cv: e.target.value})}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary py-2 px-6">
              {loading ? 'Guardando...' : 'Guardar Postulante'}
            </button>
          </div>
        </form>
      )}

      {/* Contadores */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total</p>
          <p className="text-2xl font-bold text-blue-700">{conteosActuales.total}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600 font-medium">Por revisar</p>
          <p className="text-2xl font-bold text-yellow-700">{conteosActuales.porRevisar}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-medium">Aprobados</p>
          <p className="text-2xl font-bold text-green-700">{conteosActuales.aprobados}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-600 font-medium">Rechazados</p>
          <p className="text-2xl font-bold text-red-700">{conteosActuales.rechazados}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por nombre</label>
          <input
            type="text"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            placeholder="Buscar..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por estado</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="Por revisar">Por revisar</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
      </div>

      {/* Listado de postulantes */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Teléfono</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {postulantesFiltrados.length > 0 ? (
              postulantesFiltrados.map((post: any) => (
                <tr key={post.id_postulante} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{post.nombre_completo}</td>
                  <td className="px-4 py-3">{post.email}</td>
                  <td className="px-4 py-3">{post.telefono}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.estado === 'Aprobado' ? 'bg-green-100 text-green-700' :
                      post.estado === 'Rechazado' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2 flex gap-2">
                    <button
                      onClick={() => handleClasificar(post.id_postulante, 'Aprobado')}
                      disabled={loading}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 text-xs"
                    >
                      <CheckCircle className="w-4 h-4" /> Aprobar
                    </button>
                    <button
                      onClick={() => handleClasificar(post.id_postulante, 'Rechazado')}
                      disabled={loading}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 text-xs"
                    >
                      <XCircle className="w-4 h-4" /> Rechazar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No hay postulantes para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
