/**
 * @file GestionHorarios.tsx
 * @description Componente de interfaz de usuario correspondiente a la creación y asignación horaria para el personal corporativo.
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

import { useState } from 'react';
import { registrarHorario, eliminarHorario } from '@/app/dashboard/horarios/actions';
import Toast from '@/components/ui/Toast';

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function GestionHorarios({ horarios }: { horarios: any[] }) {
  const [nombreTurno, setNombreTurno] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const handleGuardar = async () => {
    setLoading(true);
    setMensaje('');

    if (!nombreTurno || !horaEntrada || !horaSalida) {
      setMensaje('Por favor, ingresa el nombre del turno, la hora de entrada y la de salida.');
      setLoading(false);
      return;
    }

    const result = await registrarHorario({  nombre_turno: nombreTurno,hora_entrada: horaEntrada, hora_salida: horaSalida });
    setMensaje(result.message);

    if (result.success) {
      setNombreTurno('');
      setHoraEntrada('');
      setHoraSalida('');
    }
    setLoading(false);
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      const result = await eliminarHorario(id);
      if (!result.success) {
        setToast({ message: result.message, type: 'error' });
      } else {
        setToast({ message: 'Horario eliminado con éxito.', type: 'success' });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulario de Registro */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Registrar Nuevo Horario</h2>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Turno</label>
            <input type="text" value={nombreTurno} onChange={(e) => setNombreTurno(e.target.value)} placeholder="Ej. Turno Mañana" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de Entrada</label>
              <input type="time" value={horaEntrada} onChange={(e) => setHoraEntrada(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de Salida</label>
              <input type="time" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700" />
            </div>
          </div>

          {mensaje && (
            <div className={`p-3 rounded-lg text-sm font-medium ${mensaje.includes('exitosamente') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {mensaje}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="button" onClick={handleGuardar} disabled={loading} className={`bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? 'Guardando...' : 'Guardar Horario'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Horarios */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Horarios Registrados</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 border-b font-semibold w-16">ID</th>
                <th className="p-4 border-b font-semibold text-left">Turno</th>
                <th className="p-4 border-b font-semibold text-center">Entrada</th>
                <th className="p-4 border-b font-semibold text-center">Salida</th>
                <th className="p-4 border-b font-semibold text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {horarios && horarios.length > 0 ? horarios.map((hor) => (
                <tr key={hor.id_horario} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-medium text-red-600">#{hor.id_horario}</td>
                  <td className="p-4 font-medium text-gray-800">{hor.nombre_turno}</td>
                  <td className="p-4 font-mono text-center">{hor.hora_entrada}</td>
                  <td className="p-4 font-mono text-center">{hor.hora_salida}</td>
                  <td className="p-4 flex justify-center"><button onClick={() => handleEliminar(hor.id_horario)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar Horario">🗑️</button></td>
                </tr>
              )) : (<tr><td colSpan={4} className="p-6 text-center text-gray-500">No hay horarios registrados.</td></tr>)}
            </tbody>
          </table>
        </div>
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