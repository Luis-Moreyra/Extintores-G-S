/**
 * @file RegistroEmpleado.tsx
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
import { registrarEmpleado, obtenerTodosLosHorarios } from '@/app/dashboard/empleados/actions';

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function RegistroEmpleado() {
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [cargo, setCargo] = useState('Trabajador'); // Valor por defecto
  const [horarioId, setHorarioId] = useState('');
  const [listaHorarios, setListaHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const listaCargos = [
    'Trabajador',
    'Responsable de RRHH',
    'Jefe de Área',
    'Jefe de Área RRHH',
    'Administrador'
  ];

  useEffect(() => {
    const fetchHorarios = async () => {
      const res = await obtenerTodosLosHorarios();
      if (res.success) {
        setListaHorarios(res.horarios);
      }
    };
    fetchHorarios();
  }, []);

  const handleGuardar = async () => {
    setLoading(true);
    setMensaje('');
    
    if (!horarioId) {
      setMensaje('Por favor, selecciona un horario asignado.');
      setLoading(false);
      return;
    }

    const result = await registrarEmpleado({ dni, nombres, apellidos, cargo, horarioId: Number(horarioId) });
    setMensaje(result.message);
    
    if (result.success) {
      setDni('');
      setNombres('');
      setApellidos('');
      setCargo('Trabajador');
      setHorarioId('');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
        Registrar Nuevo Empleado
      </h2>
      
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* DNI */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">DNI</label>
            <input 
              type="text" 
              maxLength={8}
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-700" 
              placeholder="Ej. 71234567" 
            />
          </div>

          {/* Nombres */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombres</label>
            <input 
              type="text" 
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-700" 
              placeholder="Ej. Juan Carlos" 
            />
          </div>

          {/* Apellidos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Apellidos</label>
            <input 
              type="text" 
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-700" 
              placeholder="Ej. Pérez Gómez" 
            />
          </div>

          {/* Cargo (Lista Desplegable) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cargo Asignado</label>
            <select 
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-700 bg-white"
            >
              {listaCargos.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
          </div>

          {/* Horario (Lista Desplegable) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Horario Asignado</label>
            <select 
              value={horarioId}
              onChange={(e) => setHorarioId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-700 bg-white"
            >
              <option value="">Seleccione un horario</option>
              {listaHorarios.map((horario) => (
                <option key={horario.id_horario} value={horario.id_horario}>
                  {horario.nombre_turno} ({horario.hora_entrada} - {horario.hora_salida})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mostrar Mensajes de Éxito o Error */}
        {mensaje && (
          <div className={`p-3 rounded-lg text-sm font-medium ${mensaje.includes('exitosamente') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {mensaje}
          </div>
        )}

        {/* Botón de Guardar */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button 
            type="button" 
            onClick={handleGuardar}
            disabled={loading}
            className={`bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Guardando...' : 'Guardar Empleado'}
          </button>
        </div>
      </form>
    </div>
  );
}