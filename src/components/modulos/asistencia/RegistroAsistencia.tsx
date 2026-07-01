/**
 * @file RegistroAsistencia.tsx
 * @description Componente de interfaz de usuario correspondiente al flujo de Control de Asistencia y Reportes de Marcaciones del personal.
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
import { registrarAsistenciaManual, obtenerEmpleadoPorId, obtenerEmpleadoPorDni } from '@/controllers/asistencia.controller';
import { obtenerTodasLasAreas } from '@/controllers/empleado.controller';

const calcularEstadoAsistencia = (horaEntradaStr: string, horaOficialStr: string, toleranciaMin: number) => {
  if (!horaEntradaStr || !horaOficialStr) return '';
  const [hEntrada, mEntrada] = horaEntradaStr.split(':').map(Number);
  const [hOficial, mOficial] = horaOficialStr.split(':').map(Number);
  
  const minEntrada = hEntrada * 60 + mEntrada;
  const minLimite = hOficial * 60 + mOficial + (toleranciaMin || 0);
  
  return minEntrada > minLimite ? 'Tardanza' : 'Presente';
};

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function RegistroAsistencia() {
  const [fecha, setFecha] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [estado, setEstado] = useState(''); // Sin estado por defecto
  const [area, setArea] = useState('Trabajador'); // Cargo por defecto
  
  const [empleadoId, setEmpleadoId] = useState('');
  const [dni, setDni] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const [listaCargos, setListaCargos] = useState<string[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);

  // Usamos useEffect para cargar la fecha y hora actual solo en el cliente
  // y evitar errores de hidratación con Next.js
  useEffect(() => {
    const now = new Date();
    
    // Obtener fecha en formato YYYY-MM-DD (necesario para el input type="date")
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setFecha(`${year}-${month}-${day}`);

    // Obtener hora en formato HH:mm (necesario para el input type="time")
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setHoraEntrada(`${hours}:${minutes}`);

    const fetchAreas = async () => {
      setLoadingAreas(true);
      const res = await obtenerTodasLasAreas();
      if (res.success && res.areas) {
        setListaCargos(res.areas.map((a: any) => a.nombre_area));
      }
      setLoadingAreas(false);
    };
    fetchAreas();
  }, []);

  // Función que se ejecuta cuando el usuario termina de escribir el ID
  const handleBuscarEmpleado = async () => {
    if (!empleadoId) {
      setNombreCompleto('');
      setDni('');
      return;
    }

    const idNum = parseInt(empleadoId);
    if (!isNaN(idNum)) {
      const result = await obtenerEmpleadoPorId(idNum);
      if (result.success && result.empleado) {
        setNombreCompleto(`${result.empleado.nombres} ${result.empleado.apellidos}`);
        setArea(result.empleado.cargo || result.empleado.nombre_area || 'Trabajador');
        setDni(result.empleado.dni); // Autocompleta el DNI
        setMensaje(''); // Limpia errores si los había

        // Calcular estado automáticamente según horario del empleado
        if (result.empleado.hora_entrada_oficial && horaEntrada) {
          const nuevoEstado = calcularEstadoAsistencia(horaEntrada, result.empleado.hora_entrada_oficial, result.empleado.tolerancia_minutos);
          setEstado(nuevoEstado);
        }
      } else {
        setNombreCompleto('');
        setDni('');
        setMensaje('Empleado no encontrado en la base de datos.');
      }
    }
  };

  // Función que se ejecuta cuando el usuario termina de escribir el DNI
  const handleBuscarEmpleadoPorDni = async () => {
    if (!dni.trim()) {
      setNombreCompleto('');
      setEmpleadoId('');
      return;
    }

    const result = await obtenerEmpleadoPorDni(dni);
    if (result.success && result.empleado) {
      setNombreCompleto(`${result.empleado.nombres} ${result.empleado.apellidos}`);
      setArea(result.empleado.cargo || result.empleado.nombre_area || 'Trabajador');
      setEmpleadoId(result.empleado.id_empleado.toString()); // Autocompleta el ID
      setMensaje('');

      // Calcular estado automáticamente según horario del empleado
      if (result.empleado.hora_entrada_oficial && horaEntrada) {
        const nuevoEstado = calcularEstadoAsistencia(horaEntrada, result.empleado.hora_entrada_oficial, result.empleado.tolerancia_minutos);
        setEstado(nuevoEstado);
      }
    } else {
      setNombreCompleto('');
      setEmpleadoId('');
      setMensaje('Empleado no encontrado con ese DNI.');
    }
  };

  const handleGuardar = async () => {
    setLoading(true);
    setMensaje('');

    const idNum = parseInt(empleadoId);
    if (isNaN(idNum)) {
      setMensaje('Por favor, ingresa un ID de empleado válido (número).');
      setLoading(false);
      return;
    }

    if (!estado) {
      setMensaje('Por favor, seleccione un estado de asistencia (Presente, Tardanza o Ausente).');
      setLoading(false);
      return;
    }

    if (estado !== 'Ausente' && !horaEntrada) {
      setMensaje('Por favor, ingresa al menos la hora de entrada.');
      setLoading(false);
      return;
    }

    const result = await registrarAsistenciaManual({ empleadoId: idNum, fecha, hora_entrada: horaEntrada, hora_salida: horaSalida, estado, observaciones });
    setMensaje(result.message);

    if (result.success) {
      setEmpleadoId('');
      setDni('');
      setObservaciones('');
      setNombreCompleto('');
      setEstado('');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
        Nuevo Registro de Asistencia
      </h2>
      
      <form className="space-y-8">
        {/* Contenedor Superior Centrado (Fecha y Hora) */}
        <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12">
          {/* 1. Fecha de Ingreso */}
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Fecha de Ingreso</label>
            <input 
              type="date" 
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800"
            />
          </div>

          {/* 2. Hora de Entrada */}
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Hora de Entrada</label>
            <input 
              type="time" 
              value={horaEntrada}
              onChange={(e) => setHoraEntrada(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800"
            />
          </div>

          {/* 3. Hora de Salida */}
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Hora de Salida (Opcional)</label>
            <input 
              type="time" 
              value={horaSalida}
              onChange={(e) => setHoraSalida(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800"
            />
          </div>
        </div>

        {/* Los otros 4 cuadros de texto (Grid 2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">ID del Empleado</label>
            <input 
              type="text" 
              value={empleadoId}
              onChange={(e) => setEmpleadoId(e.target.value)}
              onBlur={handleBuscarEmpleado}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800" 
              placeholder="Ej. 4" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">DNI/Carné de extranjería</label>
            <input 
              type="text" 
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              onBlur={handleBuscarEmpleadoPorDni}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800" 
              placeholder="Ingresar documento..." 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Nombre Completo</label>
            <input 
              type="text" 
              value={nombreCompleto}
              readOnly
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none transition-all duration-200" 
              placeholder="Autocompletado..." 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Área/Departamento</label>
            {loadingAreas ? (
              <div className="w-full p-3 h-[50px] border border-gray-300 rounded-lg bg-gray-100 animate-pulse"></div>
            ) : (
              <select 
                value={area}
                onChange={(e) => setArea(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800 bg-white"
              >
                {listaCargos.map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {mensaje && (
          <div className={`p-3 mt-4 rounded-lg text-sm font-medium ${mensaje.includes('correctamente') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {mensaje}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button 
            type="button" 
            onClick={handleGuardar}
            disabled={loading}
            className={`bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Registrando...' : 'Registrar Asistencia'}
          </button>
        </div>

        {/* Estado de Asistencia Centrado */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="text-center text-base font-bold text-gray-800 mb-6">
            Estado de Asistencia
          </h3>
          <div className="flex justify-center gap-4 md:gap-8">
            <button
              type="button"
              onClick={() => setEstado('Presente')}
              className={`flex flex-col items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold shadow-sm transition-all ${estado === 'Presente' ? 'bg-green-600 text-white ring-4 ring-green-100 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <img src="/check.ico" alt="Presente" className="w-8 h-8" />
              <span>Presente</span>
            </button>
            <button
              type="button"
              onClick={() => setEstado('Tardanza')}
              className={`flex flex-col items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold shadow-sm transition-all ${estado === 'Tardanza' ? 'bg-yellow-500 text-white ring-4 ring-yellow-100 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <img src="/reloj.ico" alt="Tardanza" className="w-8 h-8" />
              <span>Tardanza</span>
            </button>
            <button
              type="button"
              onClick={() => setEstado('Ausente')}
              className={`flex flex-col items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold shadow-sm transition-all ${estado === 'Ausente' ? 'bg-red-600 text-white ring-4 ring-red-100 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <img src="/Cross.ico" alt="Ausente" className="w-8 h-8" />
              <span>Ausente</span>
            </button>
          </div>

          {/* Campo de Observaciones (Textarea) */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Observaciones (Opcional)</label>
            <textarea 
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800 resize-none shadow-sm" 
              placeholder="Ingresar observaciones adicionales sobre la asistencia..." 
            ></textarea>
          </div>
        </div>
      </form>
    </div>
  );
}