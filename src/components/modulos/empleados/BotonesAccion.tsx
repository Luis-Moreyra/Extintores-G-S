/**
 * @file BotonesAccion.tsx
 * @description Componente de interfaz de usuario correspondiente a la Gestión y Fichas del Directorio de Empleados en Extintores GS.
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
import { eliminarEmpleado, actualizarEmpleado, obtenerTodosLosHorarios } from '@/app/dashboard/empleados/actions';

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function BotonesAccion({ empleado }: { empleado: { id_empleado: number, dni: string, nombres: string, apellidos: string, cargo: string, horarioId: number } }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombres, setNombres] = useState(empleado.nombres);
  const [apellidos, setApellidos] = useState(empleado.apellidos);
  const [dni, setDni] = useState(empleado.dni);
  const [cargo, setCargo] = useState(empleado.cargo);
  const [horarioId, setHorarioId] = useState(empleado.horarioId ? empleado.horarioId.toString() : '');
  const [listaHorarios, setListaHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const listaCargos = [
    'Trabajador', 'Responsable de RRHH', 'Jefe de Área', 'Jefe de Área RRHH', 'Administrador'
  ];

  useEffect(() => {
    if (isModalOpen && listaHorarios.length === 0) {
      obtenerTodosLosHorarios().then(res => {
        if (res.success) setListaHorarios(res.horarios);
      });
    }
  }, [isModalOpen, listaHorarios.length]);

  const handleEliminar = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.')) {
      await eliminarEmpleado(empleado.id_empleado);
    }
  };

  const handleGuardarEdicion = async () => {
    setLoading(true);
    setMensaje('');
    
    if (!/^\d{8}$/.test(dni)) {
      setMensaje('El DNI debe contener exactamente 8 dígitos numéricos.');
      setLoading(false);
      return;
    }

    if (!horarioId) {
      setMensaje('Por favor, selecciona un horario.');
      setLoading(false);
      return;
    }

    const result = await actualizarEmpleado(empleado.id_empleado, { dni, nombres, apellidos, cargo, horarioId: Number(horarioId) });
    setMensaje(result.message);
    
    if (result.success) {
      // Cerrar el modal automáticamente después de un éxito
      setTimeout(() => {
        setIsModalOpen(false);
        setMensaje('');
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Botones de Acción de la Tabla */}
      <div className="flex space-x-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Editar Empleado"
        >
          ✏️
        </button>
        <button
          onClick={handleEliminar}
          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          title="Eliminar Empleado"
        >
          🗑️
        </button>
      </div>

      {/* Ventana Modal de Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            {/* Encabezado del Modal */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Editar Empleado #{empleado.id_empleado}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                ×
              </button>
            </div>

            {/* Cuerpo del Modal (Formulario) */}
            <div className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">DNI</label>
                <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombres</label>
                <input type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Apellidos</label>
                <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cargo</label>
                <select value={cargo} onChange={(e) => setCargo(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700 bg-white">
                  {listaCargos.map((opcion) => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Horario Asignado</label>
                <select value={horarioId} onChange={(e) => setHorarioId(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700 bg-white">
                  <option value="">Seleccione un horario</option>
                  {listaHorarios.map((horario) => (
                    <option key={horario.id_horario} value={horario.id_horario}>
                      {horario.nombre_turno} ({horario.hora_entrada} - {horario.hora_salida})
                    </option>
                  ))}
                </select>
              </div>

              {mensaje && (
                <div className={`p-3 rounded-lg text-sm font-medium mt-2 ${mensaje.includes('exitosamente') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {mensaje}
                </div>
              )}
            </div>

            {/* Pie del Modal (Botones) */}
            <div className="p-5 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleGuardarEdicion} disabled={loading} className={`px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
